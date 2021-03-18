import Extension from './Extension';
import {Schema, NodeType, NodeSpec} from 'prosemirror-model';

export default class Node extends Extension {
  constructor(options = {}) {
    super(options);
  }

  get type() {
    return 'node';
  }

  get view() {
    return null;
  }

  get schema(): NodeSpec | null {
    return null;
  }

  commands(_payload: {schema?: Schema; type?: NodeType}) {
    return {};
  }
}
