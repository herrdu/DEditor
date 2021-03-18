import Extension from './Extension';
import {MarkSpec} from 'prosemirror-model';

export default class Mark extends Extension {
  constructor(options = {}) {
    super(options);
  }

  get type() {
    return 'mark';
  }

  get view() {
    return null;
  }

  get schema(): MarkSpec | null {
    return null;
  }

  command() {
    return () => {};
  }
}
