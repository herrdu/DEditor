import { MarkType, MarkSpec } from 'prosemirror-model';
import { updateMark } from 'tiptap-commands';
import { Mark } from 'tiptap';

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
                return null;
              }

              return {backgroundColor: value};
            } else {
              return null;
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
