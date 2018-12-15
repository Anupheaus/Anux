import { AnuxStore } from '../stores';

export type ReadonlyStateOf<TStore extends AnuxStore> = TStore['state'];
