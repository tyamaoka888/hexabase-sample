import { inject, injectable } from "inversify";
import { TYPES } from "@/shared/config/types";
import "reflect-metadata";
import { HexabaseClientManager } from "@/server/infrastructure/config/hexabase";
import { Task } from "@/server/domain/model/aggregate/task";
import { Datastore, Item } from "@hexabase/hexabase-js";
import { TaskDetail } from "@/server/domain/model/entity/taskDetail";
import { RollbackEnabledRepository } from "@/server/infrastructure/repositories/rollbackEnabledRepository";
import {
  CreateItemRollback,
  DeleteItemRollback,
  LinkItemsRollback,
  UnlinkItemsRollback,
  UpdateItemRollback,
} from "@/server/infrastructure/repositories/rollbackOperations";

export interface TaskRepository {
  findAll(): Promise<Task[]>;
  create(task: Task): Promise<void>;
}

@injectable()
export class HexTaskRepository
  extends RollbackEnabledRepository
  implements TaskRepository
{
  private readonly hexabase: HexabaseClientManager;
  private readonly _workspaceId: string;
  private readonly _projectId: string;
  private readonly _tasksDS: string;
  private readonly _taskDetailsDS: string;

  private tasksDataStore: Datastore | null = null;
  private taskDetailsDataStore: Datastore | null = null;

  constructor(
    @inject(TYPES.HexabaseClientManager) hexabase: HexabaseClientManager,
  ) {
    super();
    this.hexabase = hexabase;
    this._workspaceId = process.env.HEXABASE_WORKSPACE_ID as string;
    this._projectId = process.env.HEXABASE_PROJECT_ID as string;
    this._tasksDS = process.env.TASKS_DATA_STORE_ID as string;
    this._taskDetailsDS = process.env.TASK_DETAILS_DATA_STORE_ID as string;
  }

  private async getTasksDataStore(): Promise<Datastore> {
    if (!this.tasksDataStore) {
      this.tasksDataStore = await this.hexabase.initializeDatastore({
        datastoreId: this._tasksDS,
      });
    }
    return this.tasksDataStore;
  }

  private async getTaskDetailsDataStore(): Promise<Datastore> {
    if (!this.taskDetailsDataStore) {
      this.taskDetailsDataStore = await this.hexabase.initializeDatastore({
        datastoreId: this._taskDetailsDS,
      });
    }
    return this.taskDetailsDataStore;
  }

  async findAll(): Promise<Task[]> {
    const tasksDS = await this.getTasksDataStore();

    const { items, totalCount } = await tasksDS.itemsWithCount({
      sort_field_id: "taskId",
      sort_order: "asc",
      page: 1,
      per_page: 100,
      include_links: true,
    });

    console.log("items", items);

    return Promise.all(
      items.map(async (item) => {
        const linkItems = await item.links(this._taskDetailsDS);
        const fields = item.fields;
        return Task.reconstruct(
          fields.task_id,
          fields.user_id,
          fields.task_title,
          fields.status,
          linkItems.map((linkItem: Item) => {
            const linkFields = linkItem.fields;
            return TaskDetail.reconstruct(
              linkFields.task_detail_id,
              linkFields.task_id,
              linkFields.description,
              linkFields.notes,
            );
          }),
        );
      }),
    );
  }

  async create(task: Task): Promise<void> {
    return this.withRollback(async () => {
      const tasksDS = await this.getTasksDataStore();
      const taskDetailsDS = await this.getTaskDetailsDataStore();

      // タスクアイテムを作成
      const itemTask = await tasksDS.item();
      await itemTask
        .setFieldValue("userId", task.userId)
        .setFieldValue("taskTitle", task.taskTitle)
        .save();
      // ロールバック用にアイテムを削除するために保存
      this.addRollbackOperation(new DeleteItemRollback(itemTask));

      // タスク詳細アイテムをループで作成
      for (const detail of task.details) {
        const itemTaskDetail = await taskDetailsDS.item();
        await itemTaskDetail
          .setFieldValue("taskId", itemTask.fields.taskId)
          .setFieldValue("description", detail.description)
          .setFieldValue("notes", detail.notes)
          .save();
        this.addRollbackOperation(new DeleteItemRollback(itemTaskDetail));

        // タスクアイテムにタスク詳細アイテムをリンク
        await itemTask.link(itemTaskDetail).save();
        // ロールバック用にアイテムを削除するために保存
        // ロールバック用にリンクを削除するために保存
        this.addRollbackOperation(
          new UnlinkItemsRollback(itemTask, itemTaskDetail),
        );
      }
    });
  }

  async update(task: Task): Promise<void> {
    return this.withRollback(async () => {
      const tasksDS = await this.getTasksDataStore();
      const taskDetailsDS = await this.getTaskDetailsDataStore();

      // タスクアイテムを更新
      const itemTask = await tasksDS.item(task.taskId!.toString());
      await itemTask.fetch();
      // ロールバック用に元の値を保存
      const originalTaskValues = { ...itemTask.fields };
      this.addRollbackOperation(
        new UpdateItemRollback(itemTask, originalTaskValues),
      );

      itemTask
        .setFieldValue("userId", task.userId)
        .setFieldValue("taskTitle", task.taskTitle)
        .setFieldValue("status", task.status);
      await itemTask.save();

      // タスク詳細アイテムを削除
      const existingDetails = await itemTask.links(this._taskDetailsDS);
      for (const detail of existingDetails) {
        this.addRollbackOperation(new CreateItemRollback(detail));
        this.addRollbackOperation(new LinkItemsRollback(itemTask, detail));
        await detail.delete();
      }

      // タスク詳細アイテムを作成
      for (const detailData of task.details) {
        const newDetailItem = await taskDetailsDS.item();
        await newDetailItem
          .setFieldValue("taskId", task.taskId)
          .setFieldValue("description", detailData.description)
          .setFieldValue("notes", detailData.notes)
          .save();
        this.addRollbackOperation(new DeleteItemRollback(newDetailItem));

        // タスクアイテムにタスク詳細アイテムをリンク
        await itemTask.link(newDetailItem).save();
        this.addRollbackOperation(
          new UnlinkItemsRollback(itemTask, newDetailItem),
        );
      }
    });
  }

  async delete(taskId: string): Promise<void> {
    return this.withRollback(async () => {
      const tasksDS = await this.getTasksDataStore();

      console.log("入ってる？");
      // タスクアイテムを削除
      const itemTask = await tasksDS.item(taskId);
      console.log("itemTask", itemTask);

      this.addRollbackOperation(new CreateItemRollback(itemTask));
      await itemTask.delete();
    });
  }
}

/** CreateItem payload
 * {
 *   "action_id": "NewAction2", // （省略可）省略すると、デフォルトで指定されている新規登録Actionにより、登録されます。 アクションの画面ID(display_id)または 内部ID（a_id）を指定可能です。
 *   "item": {
 *       "field_id": "登録データ",
 *       "title": "タイトル",
 *       "assignee": "担当者"
 *   },
 *   "return_item_result": true, // true指定すると、登録されたアイテム情報を返します
 *   "return_display_id": true, // true指定すると、登録されたアイテム情報のkeyをdisplay_idで返します
 *   "ensure_transaction": false, // true指定すると、関連アイテムの処理中一つでもエラーが発生するとすべての登録がロールバックされます。デフォルトはfalseであり、成功されたrelated_itemの登録・更新は反映され、エラーがあった明細についてはエラーメッセージが返されます。
 *   "exec_children_post_procs": true, // true指定すると、related_ds_itemsに対してもActionScript(POST ActionScript)やWebhookの実行、自動リンクの生成、通知処理の実行を行います。注意）related_ds_itemsに対してPRE ActionScriptは実行されません。
 *   "as_params": {"param1": "value1", "param2": "value2",}, // ActionScriptへ任意のObject（型形式は自由）を渡すことができます。PRE/POST ActionScript双方に渡されます。 ActionScript内からは、 `data.as_params`として参照可能です。
 *   "is_force_update": true, // 子供Item(related_ds_items)の更新に"rev_no"を指定しない場合、強制更新する
 *   "is_sync_related_items": true, // true指定すると、related_ds_itemsの登録順がpayloadで指定した並びになります（同期実行となるため処理が少し遅くなります）
 *   "realtime_auto_link": true, // true指定すると、自動リンクの作成を同期実行する（同期実行となるため処理が少し遅くなります）
 *   "related_ds_items" : {
 *       "関連データストアID_1" : [{ },{ },{ },{ }... ] ,
 *       "関連データストアID_2" : [{ },{ },{ },{ }... ]
 *   },  // 関連するデータストアの新規・更新・削除を指定  詳細は以下を参照
 * 　"access_key_updates": {　　// アクセスキーを指定
 *       "overwrite": true,　 // アクセスキーを上書き保存（デフォルトはfalse：既存のキーに追加する）
 *       "ignore_action_settings": true, // アクションに設定された公開設定を利用しない（このPayloadで指定したキーのみを付与する）
 *       "apply_related_ds": true,  // related_ds_itemsに指定したアイテムにも同様の設定を利用する（個別に指定した場合はその内容が実行されます）
 *       "groups_to_publish": ["GROUP1", "GROUP2"],  // group display_idを指定（実行ユーザが保持するキーのみ指定可能）
 *       "roles_to_publish": ["ADMIN", "MEMBER"], // role display_idを指定（実行ユーザが保持するキーのみ指定可能）
 *       "users_to_publish": ["607c2a25844887b6855a12a9", "5f25956428dc5c55b463bc77" ] // user_idを指定（ワークスペース内に存在するuser_idを指定可能）
 *   }
 * }
 *
 *     "related_ds_items" : { // 関連するデータストアの新規・更新・削除を指定
 *       "RELATED_DS_1" : [
 *         {
 *           "operation" : 1,  // new
 *           "link_to_parent": true,  // 親Itemとのデータリンクを作成する（双方のリンクが作成される） default: false(親→指定したi_idへのリンクのみ)
 *           "action_id" : "", // new actionID　※省略可 (省略するとデフォルトの新規アクションが利用される)
 *           "item": {
 *             "FIELD_ID1" : "data",
 *             "FIELD_ID2" : "data",
 *             "FIELD_ID3" : "data",
 *             "FIELD_ID4" : "data"
 *           },
 *           "access_key_updates": {　　// アクセスキーを個別に指定
 *             "overwrite": true,　 // アクセスキーを上書き保存（デフォルトはfalse：既存のキーに追加する）
 *             "ignore_action_settings": true, // アクションに設定された公開設定を利用しない（このPayloadで指定したキーのみを付与する）
 *             "apply_related_ds": true,  // related_ds_itemsに指定したアイテムにも同様の設定を利用する
 *             "groups_to_publish": ["GROUP1", "GROUP2"],  // group display_idを指定（実行ユーザが保持するキーのみ指定可能）
 *             "roles_to_publish": ["ADMIN", "MEMBER"], // role display_idを指定（実行ユーザが保持するキーのみ指定可能）
 *             "users_to_publish": ["607c2a25844887b6855a12a9", "5f25956428dc5c55b463bc77" ] // user_idを指定（ワークスペース内に存在するuser_idを指定可能）
 *           },
 *           "related_ds_items" : {  // related_ds_itemsをネストさせることも可能。（同一Datastoreの複数ネストさせることは不可）
 *             "関連データストアID_3" : [{ },{ },{ },{ }... ]
 *           }
 *         },{
 *           "operation" : 2,  // update
 *           "action_id" : "", // update actionID　※省略可 (省略するとデフォルトの更新アクションが利用される)
 *           "link_to_parent": true,  // 親Itemとのデータリンクを作成する（双方のリンクが作成される） default: false(親→指定したi_idへのリンクのみ)
 *           "i_id" : "58bbaa27fbfcba609874aaa3f", // 対象アイテムID
 *           "item": {
 *             "FIELD_ID1" : "data",
 *             "FIELD_ID3" : "data"
 *           },
 *           "access_key_updates": {　　// アクセスキーを個別に指定
 *             "overwrite": true,　 // アクセスキーを上書き保存（デフォルトはfalse：既存のキーに追加する）
 *             "ignore_action_settings": true, // アクションに設定された公開設定を利用しない（このPayloadで指定したキーのみを付与する）
 *             "apply_related_ds": true,  // related_ds_itemsに指定したアイテムにも同様の設定を利用する
 *             "groups_to_publish": ["GROUP1", "GROUP2"],  // group display_idを指定（実行ユーザが保持するキーのみ指定可能）
 *             "roles_to_publish": ["ADMIN", "MEMBER"], // role display_idを指定（実行ユーザが保持するキーのみ指定可能）
 *             "users_to_publish": ["607c2a25844887b6855a12a9", "5f25956428dc5c55b463bc77" ] // user_idを指定（ワークスペース内に存在するuser_idを指定可能）
 *           },
 *         },{
 *           "operation" : 3,  // delete
 *           "action_id" : "", // delete actionID　※省略可 (省略するとデフォルトの削除アクションが利用される)
 *           "i_id" : "58bbaa27fbfcba609874aqr45" // 対象アイテムID
 *         },{
 *           "operation" : 11,  // add link :リンクを作成
 *           "link_to_parent": true,  // 親Itemとのデータリンクを作成する（双方のリンクが作成される） default: false(親→指定したi_idへのリンクのみ)
 *           "i_id" : "58bbaa27fbfcba609874aqr46" // 対象アイテムID
 *         },{
 *           "operation" : 12,  // remove link :リンクを削除
 *           "i_id" : "58bbaa27fbfcba609874aqr47" // 対象アイテムID
 *         },{
 *           // 関連する複数アイテムを指定可能。sample 省略
 *         },{
 *           // 関連する複数アイテムを指定可能。sample 省略
 *         },{
 *           // 関連する複数アイテムを指定可能。sample 省略
 *         }
 *       ]
 *       "RELATED_DS_2" : [ // sample 省略 ]
 *       "RELATED_DS_3" : [ // sample 省略 ]
 *     }
 */

/** ItemList payload
 * conditions                 : 検索条件を指定
 * use_or_condition           : conditionsの条件に対してOR条件で検索します（falseまたは指定しない場合は、AND条件が適用されます）
 * per_page                   : 検索結果の件数(省略、または、0を指定すると、全件取得されます）
 * page                       : ページ数
 * unread_only                : trueを指定すると、「未読履歴を持つItem」のみの絞込条件がconditionsへ追加されます。
 * exclude_action_history     : trueを指定すると、unreadでカウントされる未読履歴数について、アクションを除いて取得します。
 * exclude_comment_history    : trueを指定すると、unreadでカウントされる未読履歴数について、コメントを除いて取得します。
 * sort_field_id              : ソートするフィールドIDを指定(ソートキーが1fieldのみの場合)
 * sort_order                 : 昇順の場合"asc" 降順の場合"desc"(ソートキーが1fieldのみの場合)
 * sort_fields                : ソートキーが複数ある場合に指定します。 sort_field_idに優先してソートに利用されます。 [{id: "FIELD_A", order: "asc"},{id: "FIELD_B", order: "desc"}]
 *                       idにフィールド画面ID、orderにソート順を指定します。orderを省略できます。省略すると昇順となります。
 *                       配列で指定した順番で第1ソートキー、第2ソートキーという形で適用されます。
 * use_default_search         : true or false デフォルト検索条件(注)を適用する場合、trueを指定
 * include_links              : true を指定すると、関連するアイテムのIDの配列を取得できます
 * include_lookups            : true を指定すると、データベース参照型の参照先アイテム情報を結果に含めます。（trueの場合、データベースの参照階層が深いと時間がかかるため、include_lookups_limitで取得階層を指定することを推奨します。）
 * include_lookups_limit      : データベース参照型Itemのデータ取得の階層を指定。（1以上を指定、かつinclude_lookupsがtrueの時のみ有効。再帰的に同一データベースを参照している場合は同一データベース2回までの取得となります。）
 * return_count_only          : trueを指定すると、totalItemsのみ返却します。 itemsは[] (空配列)となります。
 * include_fields_data        : trueを指定すると、fieldsの情報を含めて返却します。
 * omit_total_items           : trueを指定すると、totalItemsをカウントしません（より高速になります） totalItemsは0となります。
 * data_result_timeout_sec    : 一覧結果取得までのタイムアウト秒数を指定します。タイムアウトした場合は、itemsは[] (空配列)となります。
 * total_count_timeout_sec    : 件数取得までのタイムアウト秒数を指定します。タイムアウトした場合は-1が返ります。
 * return_number_value        : true を指定すると、数値型データがNumberとして出力されます（defaultでは、数値は文字列("123")で返却される）
 * select_fields              : レスポンスのitemsに返却されるフィールド項目を絞り込み指定する（より高速になります）
 * select_fields_lookup       : レスポンスのlookup_itemsに返却されるフィールド項目をデータストア単位で絞り込み指定する（より高速になります）
 * format                     : "csv"を指定すると、結果をCSV形式で出力されます
 * no_cache                   : true を指定すると、検索結果のキャッシュを使用せず、再度データを検索します。
 */
