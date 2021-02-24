import { NodeType, Schema, NodeSpec } from 'prosemirror-model';
import { Node } from 'tiptap'
import { toggleWrap } from 'tiptap-commands';

export default class Blockquote extends Node {
  get name() {
    return 'blockquote';
  }

  get schema(): NodeSpec {
    return {
      attrs: {
        class: {
          default: null,
        },
        style: {
          default: null,
        },
      },
      content: 'block*',
      group: 'block',
      defining: true,
      draggable: false,
      parseDOM: [
        {
          tag: 'blockquote',
        },
      ],
      toDOM: () => ['blockquote', 0],
    };
  }

  commands({type}: {type: NodeType; schema: Schema}) {
    return () => toggleWrap(type);
  }

  keys({type}: {type: NodeType}) {
    return {
      'Ctrl->': toggleWrap(type),
    };
  }
}
