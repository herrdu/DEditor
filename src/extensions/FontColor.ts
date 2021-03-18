import {MarkType, MarkSpec} from 'prosemirror-model';
import {updateMark} from 'tiptap-commands';
import {Mark} from '../modules/Edtior';

export default class FontColor extends Mark {
  get name() {
    return 'fontColor';
  }

  get schema(): MarkSpec {
    return {
      group: 'inline',
      attrs: {color: {default: ''}},
      parseDOM: [
        {
          style: 'color',
          getAttrs: value => {
            if (typeof value === 'string') {
              return {color: value};
            } else {
              return false;
            }
          },
        },
      ],
      toDOM: mark => {
        return ['span', {style: `color: ${mark.attrs.color}`}, 0];
      },
    };
  }

  commands({type}: {type: MarkType}) {
    return (attrs: any) => {
      return updateMark(type, attrs);
    };
  }
}
