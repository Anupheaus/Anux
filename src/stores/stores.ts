import { ConstructorOf } from '../models';
import { AnuxStore } from './store';

interface IGetOptions {
  autoCreate?: boolean;
  cacheStore?: boolean;
  alwaysNew?: boolean;
}

export class AnuxStores {
  constructor() {
    this._stores = [];
  }

  //#region Variables

  private _stores: AnuxStore[];

  //#endregion

  //#region Methods

  public get<TStore extends AnuxStore>(type: ConstructorOf<TStore>, options?: IGetOptions): TStore {
    options = {
      autoCreate: true,
      cacheStore: true,
      alwaysNew: false,
      ...options,
    };

    let store: TStore = null;
    if (!options.alwaysNew) { store = this._stores.find(instance => instance instanceof type) as TStore; }
    if (!store && (options.autoCreate || options.alwaysNew)) { store = new type(this); }
    if (store && options.cacheStore) { this._stores.push(store); }
    return store;
  }

  public remove(store: AnuxStore): void {
    const index = this._stores.indexOf(store);
    if (index === -1) { return; }
    this._stores.splice(index, 1);
  }

  public dispose(): void {
    this._stores.forEach(store => store.dispose());
    this._stores = null;
  }

  //#endregion

}
