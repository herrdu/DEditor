import {EditorState} from 'prosemirror-state';
import {MarkType} from 'prosemirror-model';

export default function getMarkAttrs(state: EditorState, type: MarkType) {
  const {from, to} = state.selection;
  let marks: any[] = [];

  state.doc.nodesBetween(from, to, node => {
    marks = [...marks, ...node.marks];
  });

  const mark = marks.find(markItem => markItem.type.name === type.name);

  if (mark) {
    return mark.attrs;
  }

  return {};
}
