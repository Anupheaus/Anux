import { shallowEqual } from 'fast-equals';
import { StoreDisposedDelegate, StoreSubscriberDelegate, StoreUnsubscribeDelegate } from '../models';
import { AnuxStores } from './stores';

interface ISubscriber<TState extends {}> {
  subscription: StoreSubscriberDelegate<TState>;
  onDisposed: StoreDisposedDelegate;
}

export abstract class AnuxStore<TState extends {} = {}> {
  constructor(...args: any[]) {
    const stores: AnuxStores = args[0];
    if (!(stores instanceof AnuxStores)) { throw new Error('This store should have been provided with an AnuxStores instance as the first argument in the constructor.'); }
    this._stores = stores;
    this._subscribers = [];
    this._state = this.initialiseState();
    if (this.load) { this.load(); }
  }

  //#region Variables

  private _state: TState;
  private _stores: AnuxStores;
  private _subscribers: ISubscriber<TState>[];

  //#endregion

  //#region Properties

  public get state(): Readonly<TState> { return this._state; }

  protected get stores() { return this._stores; }

  //#endregion

  //#region Methods

  public subscribe(subscription: StoreSubscriberDelegate<TState>, onDisposed?: StoreDisposedDelegate): StoreUnsubscribeDelegate {
    onDisposed = onDisposed || (() => void (0));
    const subscriber = { subscription, onDisposed };
    this._subscribers.push(subscriber);
    return () => {
      const index = this._subscribers.indexOf(subscriber);
      this._subscribers.splice(index, 1);
    };
  }

  public dispose(): void {
    this._state = null;
    this._subscribers.forEach(subscriber => subscriber.onDisposed());
    this._subscribers = null;
    this._stores.remove(this);
    this._stores = null;
  }

  protected abstract initialiseState(): TState;

  protected async load?(): Promise<void>;

  protected async setState<TKey extends keyof TState>(state: Partial<TState> | Pick<TState, TKey>): Promise<void> {
    const newState: TState = { ...this._state as any, ...state as any };
    if (shallowEqual(this._state, newState)) { return; }
    const oldState = this._state;
    this._state = newState;
    await this.broadcastToSubscribers(newState, oldState);
  }

  private async broadcastToSubscribers(state: TState, prevState: TState): Promise<void> {
    await Promise.all(this._subscribers.map(async subscriber => {
      if (!this._subscribers.includes(subscriber)) { return; }
      return subscriber.subscription(state, prevState);
    }));
  }

  //#endregion

}
