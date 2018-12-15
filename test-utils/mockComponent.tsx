import { Component } from 'react';

interface IProps {
  onOccursOnce?(): void;
}

export class MockComponent extends Component<IProps> {
  constructor(props: IProps, context) {
    super(props, context);
    this.timers = [];
  }

  private timers: number[];

  public render() {
    const { children } = this.props;

    return children || null;
  }

  public componentDidMount(): void {
    const { onOccursOnce = () => void (0) } = this.props;
    this.timers.push(window.setTimeout(onOccursOnce, 5));
  }

  public componentWillUnmount(): void {
    this.timers.forEach(window.clearTimeout);
  }

}
