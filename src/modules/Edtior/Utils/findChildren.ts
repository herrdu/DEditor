import flatten from './flatten';
import {Predicate} from 'prosemirror-utils';
import {Node as ProsemirrorNode} from 'prosemirror-model';

export default function findChildren(node: ProsemirrorNode, predicate: Predicate, descend?: boolean) {
  if (!node) {
    throw new Error('Invalid "node" parameter');
  } else if (!predicate) {
    throw new Error('Invalid "predicate" parameter');
  }
  return flatten(node, descend).filter(child => predicate(child.node));
}
