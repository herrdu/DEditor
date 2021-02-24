import { MarkType, MarkSpec } from 'prosemirror-model';
import { toggleMark } from 'tiptap-commands';
import { Mark } from 'tiptap';

export default class Bold extends Mark {
  get name() {
    return 'bold';
  }

  // TODO  to declare node type
  get schema(): MarkSpec {
    return {
      group: 'inline',
      parseDOM: [
        {tag: 'strong'},
        {
          tag: 'b',
          getAttrs: (node: any) => {
            if (node instanceof HTMLElement && node.style.fontWeight === 'normal') {
              return false;
            } else {
              return null;
            }
          },
        },
        {
          style: 'font-weight',
          getAttrs: (value: any) => {
            return /^(bold(er)?|[5-9]\d{2,})$/.test(value) && null;
          },
        },
      ],
      toDOM: () => ['strong', 0],
    };
  }

  keys({type}: {type: MarkType}) {
    return {
      'Mod-b': toggleMark(type),
    };
  }

  commands({type}: {type: MarkType}) {
    return () => toggleMark(type);
  }

}
