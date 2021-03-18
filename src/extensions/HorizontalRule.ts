import {NodeType, NodeSpec} from 'prosemirror-model';
import {EditorState, Transaction} from 'prosemirror-state';
import {nodeInputRule} from 'tiptap-commands';
import {Node} from '../modules/Edtior';

export default class HorizontalRule extends Node {
  get name() {
    return 'horizontal_rule';
  }

  get schema(): NodeSpec {
    return {
      group: 'block',
      parseDOM: [{tag: 'hr'}],
      toDOM: () => ['hr'],
    };
  }

  commands({type}: {type: NodeType}) {
    return () => (state: EditorState, dispatch: (tr: Transaction) => void) =>
      dispatch(state.tr.replaceSelectionWith(type.create()));
  }

  inputRules({type}: {type: NodeType}) {
    return [nodeInputRule(/^(?:---|___\s|\*\*\*\s)$/, type)];
  }
}
