import * as PropTypes from 'prop-types';
import { Component } from 'react';
import { AnuxStores } from '../stores';

interface IProps {
  stores?: AnuxStores;
}

interface IState {
  stores: AnuxStores;
}

export class AnuxStoresProvider extends Component<IProps, IState> {
  constructor(props: IProps, context: any) {
    super(props, context);
    this.state = {
      stores: null,
    };
  }

  //#region Properties

  public static childContextTypes = { anuxStores: PropTypes.instanceOf(AnuxStores) };

  //#endregion

  //#region Methods

  public render() {
    return this.props.children || null;
  }

  public static getDerivedStateFromProps(props: IProps, state: IState): IState {
    const { stores: propStores } = props;
    let { stores } = state;

    const hasNoStore = !propStores && !stores;
    const hasNewStore = propStores && propStores !== stores;

    if (hasNewStore || hasNoStore) {
      if (stores) { stores.dispose(); }
      stores = propStores || new AnuxStores();
    }

    return {
      stores,
    };
  }

  protected getChildContext() {
    const { stores } = this.state;
    return {
      anuxStores: stores,
    };
  }

  //#endregion

}
