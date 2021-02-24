import { MarkType, MarkSpec } from 'prosemirror-model';
import { updateMark } from 'tiptap-commands';
import { Mark } from 'tiptap';

export default class FontFamily extends Mark {
  get name() {
    return 'fontFamily';
  }

  get schema(): MarkSpec {
    return {
      group: 'inline',
      attrs: {fontFamily: {default: null}},
      parseDOM: [
        {
          style: 'font-family',
          getAttrs: value => {
            if (typeof value === 'string') {
              return {fontFamily: value};
            } else {
              return null;
            }
          },
        },
      ],
      toDOM: mark => {
        return ['span', {style: `font-family: ${mark.attrs.fontFamily}`}, 0];
      },
    };
  }

  commands({type}: {type: MarkType}) {
    return (attrs: any) => {
      return updateMark(type, attrs);
    };
  }
}
