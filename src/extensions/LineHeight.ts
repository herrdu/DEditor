import {MarkType, MarkSpec} from 'prosemirror-model';
import {updateMark} from 'tiptap-commands';
import {Mark} from 'tiptap';

export default class LineHeight extends Mark {
  get name() {
    return 'lineHeight';
  }

  get schema(): MarkSpec {
    return {
      attrs: {lineHeight: {default: 1.5}},
      group: 'inline',
      parseDOM: [
        {
          style: 'line-height',
          getAttrs: value => {
            if (typeof value === 'string') {
              return {lineHeight: value};
            } else {
              return null;
            }
          },
        },
      ],
      toDOM: mark => {
        return ['span', {style: `line-height: ${mark.attrs.lineHeight}`}, 0];
      },
    };
  }

  commands({type}: {type: MarkType}) {
    return (attrs: any) => {
      return updateMark(type, attrs);
    };
  }
}
