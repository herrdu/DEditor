import {NodeSelection, Selection} from 'prosemirror-state';

export default function isNodeSelection(selection: Selection) {
  return selection instanceof NodeSelection;
}
