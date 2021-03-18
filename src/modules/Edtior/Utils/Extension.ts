import {Editor} from '../Editor';
import {NodeSpec, MarkSpec, Schema, NodeType, MarkType} from 'prosemirror-model';
import {InputRule} from 'prosemirror-inputrules';
import {EditorView} from 'prosemirror-view';
import {Plugin} from 'prosemirror-state';

export default class Extension {
  editor: Editor | null = null;
  options: {[key: string]: any};

  constructor(options = {}) {
    this.options = {
      ...this.defaultOptions,
      ...options,
    };
  }

  init() {
    return null;
  }

  bindEditor(editor: Editor | null = null) {
    this.editor = editor;
  }

  get name(): string {
    return '';
  }

  get view(): EditorView | null {
    return null;
  }

  get type() {
    return 'extension';
  }

  get defaultOptions() {
    return {};
  }

  get plugins(): Plugin[] {
    return [];
  }

  get schema(): NodeSpec | MarkSpec | null {
    return null;
  }

  inputRules(_payload: {schema?: Schema; type?: NodeType | MarkType}): InputRule[] {
    return [];
  }

  pasteRules(_payload: {schema?: Schema; type?: NodeType | MarkType}) {
    return [];
  }

  keys(_payload: {schema?: Schema; type?: NodeType | MarkType}) {
    return {};
  }

  commands(_payload: {schema?: Schema; type?: NodeType | MarkType}) {
    return {};
  }
}
