import {NodeType, NodeSpec} from 'prosemirror-model';

import {chainCommands, exitCode} from 'tiptap-commands';
import {Node} from '../modules/Edtior';

export default class HardBreak extends Node {
  get name() {
    return 'hard_break';
  }

  get schema(): NodeSpec {
    return {
      inline: true,
      group: 'inline',
      selectable: false,
      parseDOM: [{tag: 'br'}],
      toDOM: () => ['br'],
    };
  }

  keys({type}: {type: NodeType}) {
    const command = chainCommands(exitCode, (state: any, dispatch: any) => {
      if (dispatch) {
        dispatch(state.tr.replaceSelectionWith(type.create()).scrollIntoView());
      }
      return true;
    });
    return {
      'Mod-Enter': command,
      'Shift-Enter': command,
    };
  }
}
