import {EditorState} from 'prosemirror-state';
import {NodeType, Node as PMNode} from 'prosemirror-model';

export default function getNodeAttrs(state: EditorState, type: NodeType) {
  const {from, to} = state.selection;
  let nodes: PMNode[] = [];

  state.doc.nodesBetween(from, to, node => {
    nodes = [...nodes, node];
  });

  const node = nodes.reverse().find(nodeItem => nodeItem.type.name === type.name);

  if (node) {
    return node.attrs;
  }

  return {};
}
