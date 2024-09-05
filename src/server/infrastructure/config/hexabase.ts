import { HexabaseClient, Datastore } from "@hexabase/hexabase-js";
import { injectable } from "inversify";
import "reflect-metadata";
import { auth, XSession, XUser } from "@/auth";

type LoginParams = { token: string } | { email: string; password: string };

interface dataStoreProps {
  workspaceId?: string;
  projectId?: string;
  datastoreId?: string;
  payload?: any;
  itemId?: any;
  unread?: boolean;
}

@injectable()
export class HexabaseClientManager {
  private readonly _client: HexabaseClient;

  constructor() {
    this._client = new HexabaseClient();
  }

  get client() {
    return this._client;
  }

  public isInitialized(): boolean {
    return !!this._client.tokenHxb;
  }

  public async login(params: LoginParams): Promise<void> {
    await this._client.login(params);
    await this._client.setWorkspace(
      process.env.HEXABASE_WORKSPACE_ID as string,
    );
  }

  public async logout(): Promise<void> {
    await this._client.logout();
  }

  public async initializeDatastore(props: dataStoreProps): Promise<Datastore> {
    if (!this.isInitialized()) {
      const session = (await auth()) as XSession | null;

      if (!session?.user.token) {
        await this.logout();
      } else {
        await this.login({ token: session?.user.token });
      }
    }

    const {
      workspaceId = process.env.HEXABASE_WORKSPACE_ID,
      projectId = process.env.HEXABASE_PROJECT_ID,
      datastoreId,
    } = props;
    const workspace = await this._client.workspace(workspaceId);
    const project = await workspace.project(projectId);

    const datastore = await project.datastore(datastoreId).catch((err) => {
      if (err?.response?.errors?.[0]?.message === "TOKEN_INVALID") {
        this.logout();
      }
    });
    if (!datastore) {
      throw new Error("Datastore not found.");
    }
    return datastore;
  }

  // public async createItemId(
  //   props: dataStoreProps,
  // ): Promise<{ item_id: string }> {
  //   const { datastoreId, payload } = props;
  //   const datastore = await this.initializeDatastore(props);
  //   return datastore.request(CREATE_ITEMID, payload);
  // }
  //
  // public async getDatastoreItems(props: dataStoreProps) {
  //   const datastore = await this.initializeDatastore(props);
  //   const { payload } = props;
  //
  //   return datastore.itemsWithCount(payload);
  // }
  //
  // public async createDatastoreItem(props: dataStoreProps) {
  //   const datastore = await this.initializeDatastore(props);
  //
  //   return datastore.request(CREATE_NEW_ITEM, {
  //     ...props,
  //   });
  // }
}

/**
 const createDatastoreItem = async (props: dataStoreProps) => {
 const { payload } = props;
 const datastore = await initializeDatastore(props);
 return await datastore.request(CREATE_NEW_ITEM, { ...payload });
 };
 */
