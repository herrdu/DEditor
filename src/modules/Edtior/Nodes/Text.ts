import Node from '../Utils/Node';
import {NodeSpec} from 'prosemirror-model';

export default class Text extends Node {
  get name() {
    return 'text';
  }

  get schema(): NodeSpec {
    return {
      group: 'inline',
    };
  }
}
