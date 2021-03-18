import findChildren from './findChildren';
import {Node as ProsemirrorNode} from 'prosemirror-model';

export default function findBlockNodes(node: ProsemirrorNode, descend?: boolean) {
  return findChildren(node, child => child.isBlock, descend);
}
