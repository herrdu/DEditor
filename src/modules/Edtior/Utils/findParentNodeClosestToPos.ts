import {ResolvedPos} from 'prosemirror-model';
import {Predicate} from 'prosemirror-utils';

// eslint-disable-next-line
export default function findParentNodeClosestToPos($pos: ResolvedPos, predicate: Predicate) {
  for (let i = $pos.depth; i > 0; i -= 1) {
    const node = $pos.node(i);

    if (predicate(node)) {
      return {
        pos: i > 0 ? $pos.before(i) : 0,
        start: $pos.start(i),
        depth: i,
        node,
      };
    }
  }
}
