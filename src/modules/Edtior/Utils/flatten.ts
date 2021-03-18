import {Node as ProsemirrorNode} from 'prosemirror-model';
import {NodeWithPos} from 'prosemirror-utils';

export default function flatten(node: ProsemirrorNode, descend?: boolean) {
  // eslint-disable-next-line
  descend = descend !== undefined ? descend : true;

  if (!node) {
    throw new Error('Invalid "node" parameter');
  }
  const result: NodeWithPos[] = [];
  node.descendants((child, pos) => {
    result.push({node: child, pos});
    if (!descend) {
      return false;
    }
  });
  return result;
}
