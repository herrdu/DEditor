import {MarkType} from 'prosemirror-model';
import {EditorState, Transaction} from 'prosemirror-state';

export function toggleAndUpdateMark(type: MarkType, attrs: {[key: string]: any}) {
  return (state: EditorState, dispatch: (tr: Transaction) => void) => {
    const {tr, selection, doc} = state;

    const {empty} = selection;
    if (empty) {
      const attrsKeys = Object.keys(attrs);

      if (state.storedMarks && type.isInSet(state.storedMarks)) {
        dispatch(state.tr.removeStoredMark(type));
        if (attrsKeys.length > 0) {
          return dispatch(state.tr.addStoredMark(type.create(attrs)));
        }
      } else {
        if (attrsKeys.length > 0) {
          return dispatch(state.tr.addStoredMark(type.create(attrs)));
        }
      }
    } else {
      const {from, to} = selection;

      const hasMark = doc.rangeHasMark(from, to, type);

      if (hasMark) {
        tr.removeMark(from, to, type);
      }

      tr.addMark(from, to, type.create(attrs));

      return dispatch(tr.scrollIntoView());
    }
  };
}
