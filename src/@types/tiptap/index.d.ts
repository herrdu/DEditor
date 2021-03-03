declare module 'tiptap' {
  import Vue from 'vue';
  import {EditorState, PluginSpec} from 'prosemirror-state';
  import {EditorView} from 'prosemirror-view';

  class EditorContent extends Vue {
    editor(editor: Editor): void;
  }
  class EditorMenuBar extends Vue {}
  class EditorMenuBubble extends Vue {}
  class Emitter {
    on(event: any, fn: Function): Emitter;
    emit(event: any, ...args: any[]): Emitter;
    off(event: any, fn: Function): Emitter;
  }

  interface IEmptyDocument {
    type: string;
    content: any[];
  }

  interface EditorSettings {
    editorProps?: object;
    editable?: boolean;
    autoFocus?: any;
    extensions?: any[];
    content?: string;
    emptyDocument?: IEmptyDocument;

    useBuiltInExtensions?: boolean;
    disableInputRules?: boolean;
    disablePasteRules?: boolean;
    dropCursor?: object;
    parseOptions?: object;
    injectCSS?: boolean;
    onInit?: () => void;
    onTransaction?: () => void;
    onUpdate?: () => void;
    onSave?: () => void;
    onFocus?: () => void;
    onBlur?: () => void;
    onPaste?: (...args: [EditorView, ClipboardEvent, Slice]) => void;
    onDrop?: () => void;
    onKeydown?: (...args: [EditorView, KeyboardEvent, Slice]) => void;
  }

  class Editor extends Emitter {
    constructor(settings: EditorSettings);
    destroy(): void;

    focused: boolean;
    state: EditorState;
    view: EditorView;
    commands: any;
    get isActive(): any;

    focus(): void;
    blur(): void;
    getJSON(): any;
    getHTML(): any;
    setContent(content: any = {}, emitUpdate = false, parseOptions: any);
  }

  class Extension {
    options: {[key: string]: any};
    editor: Editor | null;

    setSelection: any;

    constructor(options = {});

    init();

    bindEditor(editor: Editor | null = null);

    get type(): string;

    get name(): string;

    get view(): EditorView | null;

    get defaultOptions(): any;

    get plugins(): Plugin[];

    get schema(): NodeSpec | MarkSpec | null;

    // TODO
    inputRules(_payload: {schema?: Schema; type?: NodeType | MarkType}): any[];
    pasteRules(_payload: {schema?: Schema; type?: NodeType | MarkType}): any[];
    keys(_payload: {schema?: Schema; type?: NodeType | MarkType}): any;
    commands(_payload: {schema?: Schema; type?: NodeType | MarkType}): any;
  }

  class Mark extends Extension {
    constructor(options = {});
  }

  class Node extends Extension {
    constructor(options = {});
  }

  export class Plugin<T = any, S extends Schema = any> {
    /**
     * Create a plugin.
     */
    constructor(spec: PluginSpec<T, S>);
    /**
     * The [props](#view.EditorProps) exported by this plugin.
     */
    props: EditorProps<Plugin<T, S>, S>;
    /**
     * The plugin's [spec object](#state.PluginSpec).
     */
    spec: PluginSpec<T, S>;
    /**
     * Extract the plugin's state field from an editor state.
     */
    getState(state: EditorState<S>): T;
  }

  export {Editor, EditorContent, EditorMenuBar, EditorMenuBubble, EditorSettings, Extension, Mark, Node};
}
