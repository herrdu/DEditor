import {MarkType, MarkSpec} from 'prosemirror-model';
import {Mark} from '../modules/Edtior';
import {toggleAndUpdateMark} from '@/modules/Edtior/Command/toggleAndUdpateMark';

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
    return (attrs: {[key: string]: any}) => {
      if (attrs.fontSize === type.attrs.fontSize.default) {
        return toggleAndUpdateMark(type, {});
      }
      return toggleAndUpdateMark(type, attrs);
    };
  }
}
