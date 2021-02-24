import { MarkSpec, MarkType } from 'prosemirror-model';
import { Mark } from 'tiptap';
import { toggleMark } from 'tiptap-commands';

export default class Underline extends Mark {
  get name() {
    return 'underline';
  }

  get schema(): MarkSpec {
    return {
      parseDOM: [
        {
          tag: 'u',
        },
        {
          style: 'text-decoration',
          getAttrs: value => {
            if (typeof value === 'string' && value === 'underline') {
              return {};
            }
            return null;
          },
        },
      ],
      toDOM: () => ['u', 0],
    };
  }

  keys({type}: {type: MarkType}) {
    return {
      'Mod-u': toggleMark(type),
    };
  }

  commands({type}: {type: MarkType}) {
    return () => toggleMark(type);
  }
}