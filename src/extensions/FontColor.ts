import {MarkType, MarkSpec} from 'prosemirror-model';
import {Mark} from '../modules/Edtior';
import {toggleAndUpdateMark} from '@/modules/Edtior/Command/toggleAndUdpateMark';

export default class FontColor extends Mark {
  get name() {
    return 'fontColor';
  }

  get schema(): MarkSpec {
    return {
      group: 'inline',
      attrs: {color: {default: '#111112'}},
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
      if (attrs.color === type.attrs.color.default) {
        return toggleAndUpdateMark(type, {});
      }
      return toggleAndUpdateMark(type, attrs);
    };
  }
}
