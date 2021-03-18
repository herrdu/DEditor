import {setBlockType} from 'tiptap-commands';
import Node from '../Utils/Node';
import {NodeType, NodeSpec} from 'prosemirror-model';

export default class Paragraph extends Node {
  get name() {
    return 'paragraph';
  }

  get schema(): NodeSpec {
    return {
      content: 'inline*',
      group: 'block',
      draggable: false,
      parseDOM: [
        {
          tag: 'p',
        },
      ],
      toDOM: () => ['p', 0],
    };
  }

  commands({type}: {type: NodeType}) {
    return () => setBlockType(type);
  }
}
