import {Editor} from '../Editor';
import {NodeSpec, MarkSpec, Schema, NodeType, MarkType} from 'prosemirror-model';
import {InputRule} from 'prosemirror-inputrules';
import {EditorView} from 'prosemirror-view';

export default class Extension {
  editor: Editor | null = null;
  options: {[key: string]: any};

  view: EditorView | null = null;

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

  get type() {
    return 'extension';
  }

  get defaultOptions() {
    return {};
  }

  get plugins() {
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
