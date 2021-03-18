import {NodeSpec, NodeType, Schema} from 'prosemirror-model';

import {Node as TipTapNode} from '../modules/Edtior';
import {toggleList, wrappingInputRule} from 'tiptap-commands';

export default class BulletList extends TipTapNode {
  get name() {
    return 'bullet_list';
  }

  get schema(): NodeSpec {
    return {
      content: 'list_item+',
      group: 'block',
      parseDOM: [
        {
          tag: 'ul',
        },
      ],
      toDOM: () => ['ul', 0],
    };
  }

  commands({type, schema}: {type: NodeType; schema: Schema}) {
    return () => {
      return toggleList(type, schema.nodes.list_item);
    };
  }

  keys({type, schema}: {type: NodeType; schema: Schema}) {
    return {
      'Shift-Ctrl-8': toggleList(type, schema.nodes.list_item),
    };
  }

  inputRules({type}: {type: NodeType}) {
    return [wrappingInputRule(/^\s*([-+*])\s$/, type)];
  }
}
