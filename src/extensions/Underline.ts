import {MarkSpec, MarkType} from 'prosemirror-model';
import {toggleMark} from 'tiptap-commands';
import {Mark} from '../modules/Edtior';

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
            return false;
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
