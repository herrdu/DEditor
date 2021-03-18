import {NodeSpec, NodeType, Schema} from 'prosemirror-model';

import {setBlockType, toggleBlockType} from 'tiptap-commands';
import {Node} from '../modules/Edtior';

type LEVEL = 1 | 2 | 3 | 4 | 5 | 6;

export default class Heading extends Node {
  options!: {
    levels: LEVEL[];
  };

  get name() {
    return 'heading';
  }

  get defaultOptions(): {
    levels: LEVEL[];
  } {
    return {
      levels: [1, 2, 3, 4, 5, 6],
    };
  }

  get schema(): NodeSpec {
    return {
      attrs: {
        level: {
          default: 1,
        },
        style: {
          default: 'margin:0;',
        },
      },
      content: 'inline*',
      group: 'block',
      defining: true,
      draggable: false,
      parseDOM: this.options.levels.map(level => ({
        tag: `h${level}`,
        getAttrs(dom) {
          if (dom instanceof HTMLHeadingElement) {
            dom.style.removeProperty('display');
            dom.style.removeProperty('font-weight');
            dom.style.removeProperty('font-size');
            dom.style.removeProperty('color');
            dom.style.removeProperty('background-color');
            dom.style.removeProperty('text-align');
            dom.style.removeProperty('font-family');

            let style = dom.getAttribute('style');

            if (style === null) {
              style = 'margin:0;';
            } else if (style.indexOf('margin:') < 0) {
              style = 'margin:0;' + style;
            }

            return {style, level};
          }
          return false;
        },
      })),
      toDOM: node => {
        return [`h${node.attrs.level}`, {style: node.attrs.style}, 0];
      },
    };
  }

  commands({type, schema}: {type: NodeType; schema: Schema}) {
    return (attrs: any) => toggleBlockType(type, schema.nodes.paragraph, attrs);
  }

  keys({type}: {type: NodeType}) {
    return this.options.levels.reduce(
      (items, level) => ({
        ...items,
        ...{
          [`Shift-Ctrl-${level}`]: setBlockType(type, {level}),
        },
      }),
      {}
    );
  }
}
