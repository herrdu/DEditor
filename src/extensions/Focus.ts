import {Plugin} from 'prosemirror-state';
import {Decoration, DecorationSet} from 'prosemirror-view';
import {Extension} from '../modules/Edtior';

export default class Focus extends Extension {
  get name() {
    return 'focus';
  }

  get defaultOptions() {
    return {
      className: 'has-focus',
      nested: false,
    };
  }

  get plugins() {
    return [
      new Plugin({
        props: {
          decorations: state => {
            const {doc, plugins, selection} = state;

            const editablePlugin = plugins.find(plugin => (plugin as any).key.startsWith('editable$'));

            if (!editablePlugin || !editablePlugin.props.editable || !this.editor) {
              return null;
            }

            const editable = (editablePlugin.props as any).editable(state);

            const active = editable && this.options.className;

            const {focused} = this.editor;
            const {anchor} = selection;

            const decorations: Decoration[] = [];

            if (!active || !focused) {
              return null;
            }

            doc.descendants((node, pos) => {
              const hasAnchor = anchor >= pos && anchor <= pos + node.nodeSize;

              if (hasAnchor && !node.isText) {
                const decoration = Decoration.node(pos, pos + node.nodeSize, {
                  class: this.options.className,
                });
                decorations.push(decoration);
              }

              return this.options.nested;
            });

            return DecorationSet.create(doc, decorations);
          },
        },
      }),
    ];
  }
}
