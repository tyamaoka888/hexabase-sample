import { Datastore, Item } from "@hexabase/hexabase-js";

export interface RollbackOperation {
  execute: () => Promise<void>;
}

export class DeleteItemRollback implements RollbackOperation {
  constructor(private item: Item) {}
  async execute(): Promise<void> {
    await this.item.delete();
  }
}

export class CreateItemRollback implements RollbackOperation {
  constructor(private item: Item) {}

  async execute(): Promise<void> {
    const newItem = await this.item.datastore.item();

    for (const [key, value] of Object.entries(this.item.fields)) {
      newItem.setFieldValue(key, value);
    }

    // 新しいItemを保存
    await newItem.save();
  }
}

export class UpdateItemRollback implements RollbackOperation {
  constructor(
    private item: Item,
    private originalValues: { [key: string]: any },
  ) {}
  async execute(): Promise<void> {
    for (const [key, value] of Object.entries(this.originalValues)) {
      this.item.setFieldValue(key, value);
    }
    await this.item.save();
  }
}

export class LinkItemsRollback implements RollbackOperation {
  constructor(
    private item1: Item,
    private item2: Item,
  ) {}

  async execute(): Promise<void> {
    await this.item1.link(this.item2).save();
  }
}

export class UnlinkItemsRollback implements RollbackOperation {
  constructor(
    private parent: Item,
    private child: Item,
  ) {}
  async execute(): Promise<void> {
    await this.parent.unlink(this.child).save();
  }
}
