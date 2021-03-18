import isNodeSelection from './isNodeSelection';
import equalNodeType from './equalNodeType';
import {NodeType} from 'prosemirror-model';
import {Selection, NodeSelection} from 'prosemirror-state';

export default function findSelectedNodeOfType(nodeType: NodeType | NodeType[]) {
  // eslint-disable-next-line
  return function(selection: Selection) {
    if (isNodeSelection(selection)) {
      const {node} = selection as NodeSelection;
      const {$from} = selection;

      if (equalNodeType(nodeType, node)) {
        return {node, pos: $from.pos, depth: $from.depth};
      }
    }
  };
}
