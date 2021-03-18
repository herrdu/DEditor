import findParentNodeClosestToPos from './findParentNodeClosestToPos';
import {Predicate} from 'prosemirror-utils';
import {Selection} from 'prosemirror-state';

export default function findParentNode(predicate: Predicate) {
  return (selection: Selection) => findParentNodeClosestToPos(selection.$from, predicate);
}
