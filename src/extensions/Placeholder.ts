import {EditorState} from 'prosemirror-state';
import {Decoration, DecorationSet} from 'prosemirror-view';
import {Extension, Plugin} from '../modules/Edtior';

export default class Placeholder extends Extension {
  get name() {
    return 'placeholder';
  }

  get defaultOptions() {
    return {
      emptyEditorClass: 'is-editor-empty',
      emptyNodeClass: 'is-empty',
      emptyNodeText: '请输入内容',
      showOnlyWhenEditable: true,
      /** 是否只在当前行加 data-empty-text */
      showOnlyCurrent: true,
    };
  }

  get plugins(): Plugin[] {
    return [
      new Plugin({
        props: {
          decorations: (state: EditorState) => {
            const {doc, plugins, selection} = state;
            const editablePlugin = plugins.find(plugin => (plugin as any).key.startsWith('editable$'));

            const editable =
              editablePlugin && editablePlugin.props.editable
                ? (editablePlugin.props as any).editable(state)
                : false;

            const active = editable || !this.options.showOnlyWhenEditable;
            const {anchor} = selection;
            const decorations: Decoration[] = [];
            const isEditorEmpty = doc.textContent.length === 0;

            if (!active) {
              return null;
            }

            doc.descendants((node, pos) => {
              const hasAnchor = anchor >= pos && anchor <= pos + node.nodeSize;
              const isNodeEmpty = node.content.size === 0;

              if ((hasAnchor || !this.options.showOnlyCurrent) && isNodeEmpty) {
                const classes = [this.options.emptyNodeClass];

                if (isEditorEmpty) {
                  classes.push(this.options.emptyEditorClass);
                }

                const decoration = Decoration.node(pos, pos + node.nodeSize, {
                  class: classes.join(' '),
                  'data-empty-text':
                    typeof this.options.emptyNodeText === 'function'
                      ? this.options.emptyNodeText(node)
                      : this.options.emptyNodeText,
                });
                decorations.push(decoration);
              }

              return null;
            });

            return DecorationSet.create(doc, decorations);
          },
        },
      }),
    ];
  }
}
