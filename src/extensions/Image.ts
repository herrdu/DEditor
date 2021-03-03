import {EditorState, Transaction, TextSelection} from 'prosemirror-state';
import {Node as TipTapNode, Plugin} from 'tiptap';
import {NodeType, NodeSpec, Schema, Node as ProsemirrorNode} from 'prosemirror-model';
import {EditorView} from 'prosemirror-view';

/**
 * Matches following attributes in Markdown-typed image: [, alt, src, title]
 *
 * Example:
 * ![Lorem](image.jpg) -> [, "Lorem", "image.jpg"]
 * ![](image.jpg "Ipsum") -> [, "", "image.jpg", "Ipsum"]
 * ![Lorem](image.jpg "Ipsum") -> [, "Lorem", "image.jpg", "Ipsum"]
 */
// const IMAGE_INPUT_REGEX = /!\[(.+|:?)\]\((\S+)(?:(?:\s+)["'](\S+)["'])?\)/;

export default class Image extends TipTapNode {
  get name() {
    return 'image';
  }

  get schema(): NodeSpec {
    return {
      inline: true,
      attrs: {
        src: {
          default: null,
        },
        alt: {
          default: null,
        },
        thumbnail: {
          default: null,
        },
      },
      group: 'inline',
      draggable: true,
      parseDOM: [
        {
          tag: 'img[src]',
          getAttrs: dom => {
            if (dom instanceof HTMLElement) {
              return {
                src: dom.getAttribute('src'),
                alt: dom.getAttribute('alt'),
                thumbnail: dom.getAttribute('thumbnail'),
              };
            } else {
              return null;
            }
          },
        },
      ],
      toDOM: (node: ProsemirrorNode) => {
        return [
          'img',
          {
            ...node.attrs,
            style: 'max-width:100%',
            // contenteditable: 'true',
          },
        ];
      },
    };
  }

  commands({type, schema}: {type: NodeType; schema: Schema}) {
    return (attrs: {[key: string]: any}) => (state: EditorState, dispatch: (tr: Transaction) => void) => {
      const selection = state.selection as TextSelection;
      const position = selection.$cursor ? selection.$cursor.pos : selection.$to.pos;

      const node = type.create(attrs);

      /**
       * @see {@link http://www.fileformat.info/info/unicode/char/200b/index.htm}
       */
      const textNode = schema.text('\u200B');
      const transaction = state.tr.insert(position, node);

      transaction.insert(position + node.nodeSize, textNode);

      dispatch(transaction);
    };
  }

  // @Override
  // inputRules({type}: {type: NodeType}) {
  //   return [
  //     nodeInputRule(IMAGE_INPUT_REGEX, type, (match: string[]) => {
  //       const [, alt, src, title] = match;

  //       return {
  //         src,
  //         alt,
  //         title,
  //       };
  //     }),
  //   ];
  // }

  get plugins() {
    return [
      new Plugin({
        props: {
          handleDOMEvents: {
            drop(view: EditorView, event: Event): boolean {
              if (!(event instanceof DragEvent)) {
                return false;
              }
              const hasFiles =
                event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length;

              if (!hasFiles || event.dataTransfer === null) {
                return false;
              }

              const images = Array.from(event.dataTransfer.files).filter(file => /image/i.test(file.type));

              if (images.length === 0) {
                return false;
              }

              event.preventDefault();

              const {schema} = view.state;

              const coordinates = view.posAtCoords({
                left: event.clientX,
                top: event.clientY,
              });

              images.forEach(image => {
                const reader = new FileReader();
                reader.onload = readerEvent => {
                  if (readerEvent.target === null || !coordinates) {
                    return;
                  }

                  const node = schema.nodes.image.create({
                    src: readerEvent.target.result,
                  });

                  const transaction = view.state.tr.insert(coordinates.pos, node);
                  view.dispatch(transaction);
                };
                reader.readAsDataURL(image);
              });
              return true;
            },
          },
        },
      }),
    ];
  }
}
