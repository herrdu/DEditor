import {MarkType, MarkSpec, ResolvedPos} from 'prosemirror-model';
import {EditorState, Transaction} from 'prosemirror-state';
import {Mark, Plugin} from 'tiptap';
import {removeMark} from 'tiptap-commands';

function getMarkAttrs(state: EditorState, type: MarkType) {
  const {from, to} = state.selection;

  let marks: any[] = [];

  state.doc.nodesBetween(from, to, node => {
    marks = [...marks, ...node.marks];
  });

  const mark = marks.find(markItem => markItem.type.name === type.name);

  if (mark) {
    return mark.attrs;
  }
  return {};
}

function getCloseMarkRange($pos: ResolvedPos, type: any = null) {
  if (!$pos || !type) {
    return false;
  }

  const start = $pos.parent.childAfter($pos.parentOffset);

  if (!start.node) {
    return false;
  }

  const link = start.node.marks.find(mark => mark.type === type);

  if (!link) {
    return false;
  }

  const startPos = $pos.start() + start.offset;

  const endPos = startPos + start.node.nodeSize;

  return {from: startPos, to: endPos};
}

function updateLink(type: MarkType, attrs: {href: string; text?: string}) {
  return (state: EditorState, dispatch: (tr: Transaction) => void) => {
    const text = attrs?.text || attrs.href;
    const href = attrs.href;
    if (!text) {
      return;
    }

    const {tr, selection, doc} = state;

    let {from, to} = selection;

    const {$from, empty} = selection;
    const range = getCloseMarkRange($from, type);

    if (empty) {
      if (range) {
        from = range.from;
        to = range.to;
      } else {
        const node = state.schema.text(text, [state.schema.marks.link.create({href})]);
        tr.replaceSelectionWith(node, false);
        return dispatch(tr.scrollIntoView());
      }
    }

    const contentText = doc.textBetween(from, to);

    if (text !== contentText) {
      const node = state.schema.text(text, [state.schema.marks.link.create({href})]);
      tr.replaceSelectionWith(node, false);
      return dispatch(tr.scrollIntoView());
    }

    const hasMark = doc.rangeHasMark(from, to, type);
    if (hasMark) {
      tr.removeMark(from, to, type);
    }

    tr.addMark(from, to, type.create(attrs));

    return dispatch(tr.scrollIntoView());
  };
}

export default class Link extends Mark {
  get name() {
    return 'link';
  }

  get defaultOptions() {
    return {
      openOnClick: false,
    };
  }

  get schema(): MarkSpec {
    return {
      attrs: {
        href: {
          default: null,
        },
        style: {
          default: null,
        },
      },
      inclusive: false,
      parseDOM: [
        {
          tag: 'a:not([href^="wmimage://"])',
          priority: 99,
          getAttrs: dom => {
            if (dom instanceof HTMLElement) {
              dom.style.removeProperty('display');
              dom.style.removeProperty('font-weight');
              dom.style.removeProperty('font-size');
              dom.style.removeProperty('color');
              dom.style.removeProperty('background-color');
              dom.style.removeProperty('text-align');
              dom.style.removeProperty('font-family');

              if (dom.style.fontStyle === 'italic') {
                dom.style.removeProperty('font-style');
              }

              const style = dom.getAttribute('style');
              return {
                href: dom.getAttribute('href'),
                style,
              };
            } else {
              return false;
            }
          },
        },
      ],
      toDOM: node => [
        'a',
        {
          ...node.attrs,
          rel: 'noopener noreferrer nofollow',
        },
        0,
      ],
    };
  }

  commands({type}: {type: MarkType}) {
    return (attrs: {href: string; text: string}) => {
      if (attrs.href) {
        return updateLink(type, attrs);
      }
      return removeMark(type);
    };
  }

  // @Override
  // pasteRules({type}: {type: MarkType}) {
  //   return [
  //     pasteRule(
  //       /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-zA-Z]{2,}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/g,
  //       type,
  //       (url: string) => ({href: url})
  //     ),
  //   ];
  // }

  get plugins() {
    if (!this.options.openOnClick) {
      return [];
    }
    return [
      new Plugin({
        props: {
          handleClick: (view, _pos, event) => {
            const {schema} = view.state;
            const attrs = getMarkAttrs(view.state, schema.marks.link);

            if (attrs.href && event.target instanceof HTMLAnchorElement) {
              event.stopPropagation();
              window.open(attrs.href);
            }
            return true;
          },
        },
      }),
    ];
  }
}
