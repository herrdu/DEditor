import { NodeType, NodeSpec } from 'prosemirror-model';
import { Node as TipTapNode } from 'tiptap';
import { splitListItem, liftListItem, sinkListItem } from 'tiptap-commands';

export default class ListItem extends TipTapNode {
  get name() {
    return 'list_item';
  }

  get schema(): NodeSpec {
    return {
      content: 'paragraph block*',
      defining: true,
      draggable: false,
      parseDOM: [{tag: 'li'}],
      toDOM: () => ['li', 0],
    };
  }

  keys({type}: {type: NodeType}) {
    return {
      Enter: splitListItem(type),
      Tab: sinkListItem(type),
      'Shift-Tab': liftListItem(type),
    };
  }
}