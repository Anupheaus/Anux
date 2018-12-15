export type StoreSubscriberDelegate<TState extends {}> = (state: TState, prevState: TState) => void | Promise<void>;
