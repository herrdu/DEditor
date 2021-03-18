import {MarkType, MarkSpec} from 'prosemirror-model';
import {updateMark, toggleMark} from 'tiptap-commands';
import {Mark} from '../modules/Edtior';

export default class FontSize extends Mark {
  get name() {
    return 'fontSize';
  }

  get schema(): MarkSpec {
    return {
      group: 'inline',
      attrs: {fontSize: {default: '17px'}},
      parseDOM: [
        {
          style: 'font-size',
          getAttrs: value => {
            if (typeof value === 'string') {
              return {fontSize: value};
            } else {
              return false;
            }
          },
        },
      ],
      toDOM: mark => {
        return ['span', {style: `font-size: ${mark.attrs.fontSize}`}, 0];
      },
    };
  }

  commands({type}: {type: MarkType}) {
    return (attrs: any) => {
      if (attrs.toggle) {
        return toggleMark(type, attrs);
      } else {
        return updateMark(type, attrs);
      }
    };
  }
}
