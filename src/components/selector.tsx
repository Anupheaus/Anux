import { shallowEqual } from 'fast-equals';
import * as PropTypes from 'prop-types';
import { Component } from 'react';
import { ConstructorOf, Omit, StoreUnsubscribeDelegate } from '../models';
import { AnuxStore, AnuxStores } from '../stores';

type StateSelectionDelegate<TState extends {} = {}, TNewSelection extends {} = {}> = (state: TState) => TNewSelection;
type ActionSelectionDelegate<TActions extends {} = {}, TNewSelection extends {} = {}> = (actions: TActions) => TNewSelection;
type RenderDelegate<TSelection extends {} = {}> = (selection: TSelection) => React.ReactNode;

interface ISelectFromOptions<TState extends {} = {}, TActions extends {} = {}, TSelection extends {} = {}> {
  state<TNewSelection>(delegate: StateSelectionDelegate<TState, TNewSelection>): ISelectFromOptions<TState, TActions, TNewSelection & TSelection>;
  actions<TNewSelection>(delegate: ActionSelectionDelegate<TActions, TNewSelection>): ISelectFromOptions<TState, TActions, TNewSelection & TSelection>;
  render(delegate: RenderDelegate<TSelection>): void;
}

interface IWrappedAction {
  wrapper(...args: any[]): any;
  actionDelegate(...args: any[]): any;
}

type StateOf<TStore extends AnuxStore> = TStore['state'];

type ActionsOf<TStore extends AnuxStore> = Omit<TStore, 'dispose' | 'state'>;

type SelectFrom = <TStore extends AnuxStore, TSelection>(storeType: ConstructorOf<TStore>) => ISelectFromOptions<StateOf<TStore>, ActionsOf<TStore>, TSelection>;

interface IProps {
  children(from: SelectFrom): void;
}

interface IState {
  stores: AnuxStores;
  store: AnuxStore;
  element: React.ReactNode;
  selection: {};
  serializedChildren: string;
  actionWrappers: Map<string, IWrappedAction>;
  getSelection(state?: {}): {};
  render(selection: {}): React.ReactNode;
}

export class AnuxSelector extends Component<IProps, IState> {
  constructor(props: IProps, context) {
    super(props, context);
    this._unsubscribe = null;
    this.state = {
      stores: context.anuxStores,
      store: null,
      element: null,
      selection: {},
      serializedChildren: '',
      actionWrappers: new Map<string, IWrappedAction>(),
      getSelection: () => this.state.selection,
      render: () => null,
    };
  }

  //#region Variables

  private _unsubscribe: StoreUnsubscribeDelegate;

  //#endregion

  //#region Properties

  public static contextTypes = { anuxStores: PropTypes.instanceOf(AnuxStores) };

  //#endregion

  //#region Methods

  public render() {
    const { element } = this.state;

    return element;
  }

  public static getDerivedStateFromProps(props: IProps, state: IState): IState {
    const { children } = props;
    let { element, stores, store, selection, getSelection, render, serializedChildren, actionWrappers } = state;

    if (children.toString() === serializedChildren) { return state; }
    serializedChildren = children.toString();

    let stateDelegate: StateSelectionDelegate;
    let actionDelegate: ActionSelectionDelegate;

    const from: SelectFrom = type => {
      store = stores.get(type);
      const selectFrom: ISelectFromOptions<any, any, any> = {
        state(delegate: StateSelectionDelegate) {
          stateDelegate = delegate;
          return selectFrom;
        },
        actions(delegate: ActionSelectionDelegate) {
          actionDelegate = delegate;
          return selectFrom;
        },
        render(delegate: RenderDelegate): void { render = delegate; },
      };
      return selectFrom;
    };

    children(from);

    getSelection = overridingState => {
      const storeState = overridingState || store.state;
      const storeActions = store;

      const stateSelection = stateDelegate ? stateDelegate(storeState) : undefined;
      let actionsSelection = actionDelegate ? actionDelegate(storeActions) : undefined;

      if (actionsSelection) { actionsSelection = AnuxSelector.processActions(actionsSelection, actionWrappers); }

      return {
        ...stateSelection,
        ...actionsSelection,
      };
    };

    selection = getSelection();

    element = render(selection);

    return {
      stores,
      store,
      element,
      selection,
      serializedChildren,
      actionWrappers,
      getSelection,
      render,
    };
  }

  public componentDidMount(): void {
    const { store } = this.state;
    this.subscribeToStore(store, store);
  }

  public componentWillUnmount(): void {
    if (this._unsubscribe) {
      this._unsubscribe();
      this._unsubscribe = null;
    }
  }

  public componentDidUpdate(_prevProps: IProps, prevState: IState): void {
    const { store: prevStore } = prevState;
    const { store } = this.state;

    this.subscribeToStore(store, prevStore);
  }

  private static processActions(actions: {}, actionWrappers: Map<string, IWrappedAction>): {} {
    Object.keys(actions).forEach(key => {
      const action = actions[key];
      if (typeof (action) !== 'function') { return; }
      let wrappedAction = actionWrappers.get(key);
      if (!wrappedAction) {
        wrappedAction = {
          wrapper(...args: any[]) { return wrappedAction.actionDelegate(...args); },
          actionDelegate: null,
        };
        actionWrappers.set(key, wrappedAction);
      }
      wrappedAction.actionDelegate = action;
      actions[key] = wrappedAction.wrapper;
    });
    return actions;
  }

  private subscribeToStore(store: AnuxStore, prevStore: AnuxStore): void {
    const hasJustMounted = store === prevStore && !this._unsubscribe;
    const hasJustGotNewStore = store !== prevStore;
    if (hasJustMounted || hasJustGotNewStore) {
      if (this._unsubscribe) {
        this._unsubscribe();
        this._unsubscribe = null;
      }
      if (store) {
        this._unsubscribe = store.subscribe(state => this.handleStoreChanges(state), () => this.handleStoreDisposed());
      }
    }
  }

  private handleStoreChanges(state: AnuxStore['state']): void {
    const { getSelection, selection: oldSelection, render } = this.state;
    const selection = getSelection(state);
    if (shallowEqual(oldSelection, selection)) { return; }
    const element = render(selection);
    this.setState({ selection, element });
  }

  private handleStoreDisposed(): void {
    this._unsubscribe = null;
    this.setState({ selection: null, store: null });
  }

  //#endregion

}
