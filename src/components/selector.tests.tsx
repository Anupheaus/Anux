import { mount } from 'enzyme';
import { delay, MockComponent, MockStore } from '../../test-utils';
import { AnuxStores } from '../stores';
import { AnuxSelector } from './selector';
import { AnuxStoresProvider } from './stores';

describe('selector', () => {

  beforeEach(() => {
    chai.spy.on(MockComponent.prototype, 'render');
  });

  afterEach(() => {
    chai.spy.restore(MockComponent.prototype, 'render');
  });

  it('causes a refresh when the selected state is changed and not when it isn\'t', async () => {
    const stores = new AnuxStores();
    const mockStore = stores.get(MockStore);
    mount((
      <AnuxStoresProvider stores={stores}>
        <AnuxSelector>
          {from => from(MockStore)
            .state(({ propertyA }) => ({ propertyA }))
            .render(({ propertyA }) => (
              <MockComponent>{propertyA}</MockComponent>
            ))}
        </AnuxSelector>
      </AnuxStoresProvider>
    ));
    expect(MockComponent.prototype.render).to.have.been.called.exactly(1);
    await mockStore.setPropertyA('boo');
    expect(MockComponent.prototype.render).to.have.been.called.exactly(2);
    await mockStore.setPropertyB(false);
    expect(MockComponent.prototype.render).to.have.been.called.exactly(2);
  });

  it('can create an action and it use it', async () => {
    const stores = new AnuxStores();
    let actionCalled = false;
    mount((
      <AnuxStoresProvider stores={stores}>
        <AnuxSelector>
          {from => from(MockStore)
            .state(({ propertyA }) => ({ propertyA }))
            .actions(({ setPropertyA }) => ({
              occursOnce: () => {
                actionCalled = true;
                setPropertyA('boo');
              },
            }))
            .render(({ propertyA, occursOnce }) => (
              <MockComponent onOccursOnce={occursOnce}>{propertyA}</MockComponent>
            ))}
        </AnuxSelector>
      </AnuxStoresProvider>
    ));
    expect(MockComponent.prototype.render).to.have.been.called.exactly(1);
    await delay(10);
    expect(MockComponent.prototype.render).to.have.been.called.exactly(2);
    expect(actionCalled).to.be.true;
  });

  it('can create an arrow function action and a state change does not cause a re-render', () => {
    const stores = new AnuxStores();
    const mockStore = stores.get(MockStore);
    let timesCalled = 0;
    mount((
      <AnuxStoresProvider stores={stores}>
        <AnuxSelector>
          {from => from(MockStore)
            .actions(() => {
              timesCalled += 1;
              return {
                occursOnce: () => void (0), // an arrow function which will be different each time this delegate is called.
              };
            })
            .render(({ occursOnce }) => (
              <MockComponent onOccursOnce={occursOnce} />
            ))}
        </AnuxSelector>
      </AnuxStoresProvider>
    ));
    expect(MockComponent.prototype.render).to.have.been.called.exactly(1);
    expect(timesCalled).to.be.eq(1);
    mockStore.setPropertyA('boo');
    expect(timesCalled).to.be.eq(2);
    expect(MockComponent.prototype.render).to.have.been.called.exactly(1);
  });

  it.only('re-render of the outer component causes a re-render of the inner component', () => {
    const stores = new AnuxStores();
    const component = mount((
      <AnuxStoresProvider stores={stores}>
        <AnuxSelector>
          {from => from(MockStore)
            .render(() => (
              <MockComponent />
            ))}
        </AnuxSelector>
      </AnuxStoresProvider>
    ));
    expect(MockComponent.prototype.render).to.have.been.called.exactly(1);
    component.first().instance().forceUpdate();
    expect(MockComponent.prototype.render).to.have.been.called.exactly(2);
  });

});
