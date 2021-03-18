import Node from '../Utils/Node';
import {NodeSpec} from 'prosemirror-model';

export default class Doc extends Node {
  get name() {
    return 'doc';
  }

  get schema(): NodeSpec {
    return {
      content: 'block+',
    };
  }
}
