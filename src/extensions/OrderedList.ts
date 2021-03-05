import {NodeSpec, NodeType, Schema} from 'prosemirror-model';
import {wrappingInputRule} from 'prosemirror-inputrules';
import {Node as TipTapNode} from 'tiptap';
import {toggleList} from 'tiptap-commands';

export default class OrderedList extends TipTapNode {
  get name() {
    return 'ordered_list';
  }

  get schema(): NodeSpec {
    return {
      attrs: {
        order: {
          default: 1,
        },
      },
      content: 'list_item+',
      group: 'block',
      parseDOM: [
        {
          tag: 'ol',
          getAttrs: dom => {
            if (dom instanceof HTMLElement) {
              const start = dom.getAttribute('start');
              return {
                order: start ? +start : 1,
              };
            } else {
              return false;
            }
          },
        },
      ],
      toDOM: node => (node.attrs.order === 1 ? ['ol', 0] : ['ol', {start: node.attrs.order}, 0]),
    };
  }

  commands({type, schema}: {type: NodeType; schema: Schema}) {
    return () => toggleList(type, schema.nodes.list_item);
  }

  keys({type, schema}: {type: NodeType; schema: Schema}) {
    return {
      'Shift-Ctrl-9': toggleList(type, schema.nodes.list_item),
    };
  }

  inputRules({type}: {type: NodeType}) {
    return [
      wrappingInputRule(
        /^(\d+)\.\s$/,
        type,
        match => ({order: +match[1]}),
        (match, node) => node.childCount + node.attrs.order === +match[1]
      ),
    ];
  }
}
