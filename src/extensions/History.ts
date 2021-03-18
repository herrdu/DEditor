import {history, undo, redo, undoDepth, redoDepth} from 'prosemirror-history';
import {Extension} from '../modules/Edtior';

export default class History extends Extension {
  get name() {
    return 'history';
  }

  get defaultOptions() {
    return {
      depth: '',
      newGroupDelay: '',
    };
  }

  keys() {
    return {
      'Mod-z': undo,
      'Mod-y': redo,
      'Shift-Mod-z': redo,
    };
  }

  get plugins() {
    return [
      history({
        depth: this.options.depth,
        newGroupDelay: this.options.newGroupDelay,
      }),
    ];
  }

  commands() {
    return {
      undo: () => undo,
      redo: () => redo,
      undoDepth: () => undoDepth,
      redoDepth: () => redoDepth,
    };
  }
}
