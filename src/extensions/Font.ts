import {MarkType, MarkSpec} from 'prosemirror-model';
import {updateMark} from 'tiptap-commands';
import {Mark} from '../modules/Edtior';

/** font tag size 对照 fontsize 的值 */
const fontSizeMap: {[key: number]: string} = {
  1: '12px',
  2: '13px',
  3: '16px',
  4: '18px',
  5: '24px',
  6: '32px',
  7: '48px',
};

export default class Font extends Mark {
  get name() {
    return 'font';
  }

  get schema(): MarkSpec {
    return {
      group: 'inline',
      attrs: {color: {default: ''}, fontSize: {default: ''}},
      parseDOM: [
        {
          tag: 'font',
          getAttrs: dom => {
            if (dom instanceof HTMLElement) {
              const color = dom.getAttribute('color');
              const size = dom.getAttribute('size');
              if (color) {
                return {color, fontSize: fontSizeMap[size as any] || false};
              } else {
                return false;
              }
            }
            return false;
          },
        },
      ],
      toDOM: mark => {
        const styles = [];
        if (mark.attrs.color) {
          styles.push(`color: ${mark.attrs.color}`);
        }
        if (mark.attrs.fontSize) {
          styles.push(`font-size:${mark.attrs.fontSize}`);
        }

        return ['span', {style: styles.join(';')}, 0];
      },
    };
  }

  commands({type}: {type: MarkType}) {
    return (attrs: any) => {
      return updateMark(type, attrs);
    };
  }
}
