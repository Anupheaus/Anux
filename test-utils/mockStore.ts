import { AnuxStore, bind } from '../src';

interface IState {
  propertyA: string;
  propertyB: boolean;
  propertyC: number;
}

export class MockStore extends AnuxStore<IState> {

  @bind
  public async setPropertyA(value: string): Promise<void> {
    return this.setState({ propertyA: value });
  }

  @bind
  public async setPropertyB(value: boolean): Promise<void> {
    return this.setState({ propertyB: value });
  }

  protected initialiseState(): IState {
    return {
      propertyA: 'test',
      propertyB: true,
      propertyC: 10,
    };
  }

}
