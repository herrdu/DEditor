import {MarkType, MarkSpec} from 'prosemirror-model';
import {updateMark} from 'tiptap-commands';
import {Mark} from '../modules/Edtior';

export default class BGColor extends Mark {
  get name() {
    return 'BGColor';
  }

  get schema(): MarkSpec {
    return {
      group: 'inline',
      attrs: {backgroundColor: {default: null}},
      parseDOM: [
        {
          style: 'background-color',
          getAttrs: value => {
            if (typeof value === 'string') {
              if (value === '#000000' || value === 'rgb(255, 255, 255)') {
                return false;
              }

              return {backgroundColor: value};
            } else {
              return false;
            }
          },
        },
      ],
      toDOM: mark => {
        return ['span', {style: `background-color: ${mark.attrs.backgroundColor}`}, 0];
      },
    };
  }

  commands({type}: {type: MarkType}) {
    return (attrs: any) => {
      return updateMark(type, attrs);
    };
  }
}
