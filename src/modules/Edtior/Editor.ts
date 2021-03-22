/* eslint-disable @typescript-eslint/no-empty-function */
import {EditorState, Plugin, PluginKey, TextSelection, Transaction} from 'prosemirror-state';
import {EditorView, EditorProps} from 'prosemirror-view';
import {Schema, DOMParser, DOMSerializer, Slice, ParseOptions, MarkType, NodeType} from 'prosemirror-model';
import {dropCursor} from 'prosemirror-dropcursor';
import {gapCursor} from 'prosemirror-gapcursor';
import {keymap} from 'prosemirror-keymap';
import {baseKeymap} from 'prosemirror-commands';
import {inputRules, undoInputRule, InputRule} from 'prosemirror-inputrules';
import {markIsActive, nodeIsActive, getMarkAttrs, getNodeAttrs, Extension} from './Utils';
import {camelCase, Emitter, ExtensionManager, ComponentView, minMax} from './Utils';
import {Doc, Paragraph, Text} from './Nodes';
import {Nodes, Marks, Commands} from './Utils/ExtensionManager';

type Position = null | 'start' | 'end' | number | boolean;

interface IOptions {
  tabIndex: number | string;
  purpose?: 'compose';
  editorProps: EditorProps;
  autoFocus: Position;
  useBuiltInExtensions: boolean;
  extensions: Extension[];
  editable: boolean;
  disableInputRules: any[] | boolean;
  disablePasteRules: any[] | boolean;
  content: string;
  topNode: string;
  parseOptions: ParseOptions;
  emptyDocument: {
    type: string;
    content: [
      {
        type: string;
      }
    ];
  };
  injectCSS: boolean;
  dropCursor?: {
    color?: string | null;
    width?: number | null;
  };
  enableDropCursor: boolean;
  enableGapCursor: boolean;
  onInit: () => void;
  onTransaction: () => void;
  onUpdate: () => void;
  onFocus: () => void;
  onBlur: () => void;
  onPaste: (...args: [EditorView, ClipboardEvent, Slice]) => void;
  onDrop: (view: EditorView, event: Event, slice: Slice, moved: boolean) => void;
  onKeydown: (...args: [EditorView, KeyboardEvent, Slice]) => void;
}

const defaultOptions: IOptions = {
  tabIndex: 0,
  editorProps: {},
  editable: true,
  autoFocus: null,
  extensions: [],
  content: '',
  topNode: 'doc',
  emptyDocument: {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
      },
    ],
  },
  useBuiltInExtensions: true,
  disableInputRules: false,
  disablePasteRules: false,
  dropCursor: {},
  enableDropCursor: true,
  enableGapCursor: true,
  parseOptions: {},
  injectCSS: true,
  onInit: () => {},
  onTransaction: () => {},
  onUpdate: () => {},
  onFocus: () => {},
  onBlur: () => {},
  onPaste: () => {},
  onDrop: () => {},
  onKeydown: () => {},
};

const EmitEvents: ['init', 'transaction', 'update', 'focus', 'blur', 'paste', 'drop'] = [
  'init',
  'transaction',
  'update',
  'focus',
  'blur',
  'paste',
  'drop',
];

export class Editor extends Emitter {
  events = EmitEvents;
  focused = false;

  selection: {from: number; to: number} = {from: 0, to: 0};
  element: HTMLDivElement = document.createElement('div');

  extensions!: ExtensionManager;
  options!: IOptions;

  nodes!: Nodes;
  marks!: Marks;
  schema!: Schema;
  view!: EditorView;
  plugins!: Plugin[];
  keymaps!: Plugin[];
  inputRules!: InputRule[];
  pasteRules!: Plugin[];

  commands!: Commands;

  activeMarks: {[key: string]: () => (state: EditorState, type: MarkType) => boolean} | {} = {};
  activeNodes: {[key: string]: () => (state: EditorState, type: NodeType) => boolean} | {} = {};
  activeMarkAttrs: {[key: string]: any} = {};

  constructor(options = {}) {
    super();

    this.init(options);
  }

  init(options = {}) {
    this.setOptions({
      ...defaultOptions,
      ...options,
    });

    this.extensions = this.createExtensions();
    this.nodes = this.createNodes();
    this.marks = this.createMarks();
    this.schema = this.createSchema();
    this.plugins = this.createPlugins();
    this.keymaps = this.createKeymaps();
    this.inputRules = this.createInputRules();
    this.pasteRules = this.createPasteRules();
    this.view = this.createView();
    this.commands = this.createCommands();
    this.setActiveNodesAndMarks();

    // if (this.options.injectCSS) {
    //   injectCSS(css);
    // }

    if (this.options.autoFocus !== null) {
      this.focus(this.options.autoFocus);
    }

    this.events.forEach(name => {
      this.on(name, this.options[camelCase(`on ${name}`) as 'onFocus'] || (() => {}));
    });

    this.emit('init', {
      view: this.view,
      state: this.state,
    });

    // give extension manager access to our view
    this.extensions.view = this.view;
  }

  setOptions(options: IOptions) {
    this.options = {
      ...this.options,
      ...options,
    };

    if (this.view && this.state) {
      this.view.updateState(this.state);
    }
  }

  get builtInExtensions() {
    if (!this.options.useBuiltInExtensions) {
      return [];
    }

    return [new Doc(), new Text(), new Paragraph()];
  }

  get state() {
    return this.view ? this.view.state : null;
  }

  createExtensions() {
    return new ExtensionManager([...this.builtInExtensions, ...this.options.extensions], this);
  }

  createPlugins() {
    return this.extensions.plugins;
  }

  createKeymaps() {
    return this.extensions.keymaps({
      schema: this.schema,
    });
  }

  createInputRules() {
    return this.extensions.inputRules({
      schema: this.schema,
      excludedExtensions: this.options.disableInputRules,
    });
  }

  createPasteRules() {
    return this.extensions.pasteRules({
      schema: this.schema,
      excludedExtensions: this.options.disablePasteRules,
    });
  }

  createCommands() {
    return this.extensions.commands({
      schema: this.schema,
      view: this.view,
    });
  }

  createNodes() {
    return this.extensions.nodes;
  }

  createMarks() {
    return this.extensions.marks;
  }

  createSchema() {
    return new Schema({
      topNode: this.options.topNode,
      nodes: this.nodes,
      marks: this.marks,
    });
  }

  createState() {
    return EditorState.create({
      schema: this.schema,
      doc: this.createDocument(this.options.content),
      plugins: [
        ...this.plugins,
        inputRules({
          rules: this.inputRules,
        }),
        ...this.pasteRules,
        ...this.keymaps,
        keymap({
          Backspace: undoInputRule,
        }),
        keymap(baseKeymap),
        ...(this.options.enableDropCursor ? [dropCursor(this.options.dropCursor)] : []),
        ...(this.options.enableGapCursor ? [gapCursor()] : []),
        new Plugin({
          key: new PluginKey('editable'),
          props: {
            editable: () => this.options.editable,
          },
        }),
        new Plugin({
          props: {
            attributes: {
              tabindex: 0 as any,
            },
            handleDOMEvents: {
              focus: (view, event) => {
                this.focused = true;
                this.emit('focus', {
                  event,
                  state: view.state,
                  view,
                });

                if (this.state) {
                  const transaction = this.state.tr.setMeta('focused', true);
                  this.view.dispatch(transaction);
                }
                return false;
              },
              blur: (view, event) => {
                console.log(this.state?.selection.from);
                this.focused = false;
                this.emit('blur', {
                  event,
                  state: view.state,
                  view,
                });

                if (this.state) {
                  const transaction = this.state.tr.setMeta('focused', false);
                  this.view.dispatch(transaction);
                }

                return false;
              },
            },
          },
        }),
        new Plugin({
          props: this.options.editorProps,
        }),
      ],
    });
  }

  createDocument(content: null | {[key: string]: any} | string, parseOptions = this.options.parseOptions) {
    if (content === null) {
      return this.schema.nodeFromJSON(this.options.emptyDocument);
    }

    if (typeof content === 'object') {
      try {
        return this.schema.nodeFromJSON(content);
      } catch (error) {
        console.warn('[tiptap warn]: Invalid content.', 'Passed value:', content, 'Error:', error);
        return this.schema.nodeFromJSON(this.options.emptyDocument);
      }
    }

    if (typeof content === 'string') {
      const htmlString = `<div>${content}</div>`;
      const parser = new window.DOMParser();
      const element = parser.parseFromString(htmlString, 'text/html').body.firstElementChild;

      if (!element) {
        return element;
      }

      return DOMParser.fromSchema(this.schema).parse(element, parseOptions);
    }

    return undefined;
  }

  createView() {
    return new EditorView(this.element, {
      state: this.createState(),
      handlePaste: (...args) => {
        this.emit('paste', ...args);
        return false;
      },
      handleDrop: (...args) => {
        this.emit('drop', ...args);
        return false;
      },
      dispatchTransaction: this.dispatchTransaction.bind(this),
    });
  }

  setParentComponent(component: Vue | null = null) {
    if (!component) {
      return;
    }

    this.view.setProps({
      nodeViews: this.initNodeViews({
        parent: component,
        extensions: [...this.builtInExtensions, ...this.options.extensions],
      }),
    });
  }

  initNodeViews({parent, extensions}: {parent: Vue; extensions: Extension[]}) {
    return extensions
      .filter(extension => ['node', 'mark'].includes(extension.type))
      .filter(extension => extension.view)
      .reduce((nodeViews, extension) => {
        const nodeView = (node: any, view: EditorView, getPos: any, decorations: any) => {
          const component = extension.view;

          return new ComponentView(component, {
            editor: this,
            extension,
            parent,
            node,
            view,
            getPos,
            decorations,
          });
        };

        return {
          ...nodeViews,
          [extension.name]: nodeView,
        };
      }, {});
  }

  dispatchTransaction(transaction: Transaction) {
    if (this.state === null) {
      return;
    }
    const newState = this.state.apply(transaction);
    this.view.updateState(newState);
    this.selection = {
      from: this.state.selection.from,
      to: this.state.selection.to,
    };
    this.setActiveNodesAndMarks();

    this.emit('transaction', {
      getHTML: this.getHTML.bind(this),
      getJSON: this.getJSON.bind(this),
      state: this.state,
      transaction,
    });

    if (!transaction.docChanged || transaction.getMeta('preventUpdate')) {
      return;
    }

    this.emitUpdate(transaction);
  }

  emitUpdate(transaction: Transaction) {
    this.emit('update', {
      getHTML: this.getHTML.bind(this),
      getJSON: this.getJSON.bind(this),
      state: this.state,
      transaction,
    });
  }

  resolveSelection(position: Position = null) {
    if (this.selection && position === null) {
      return this.selection;
    }

    if (position === 'start' || position === true) {
      return {
        from: 0,
        to: 0,
      };
    }

    if (position === 'end') {
      if (!this.state) {
        return {
          from: 0,
          to: 0,
        };
      }
      const {doc} = this.state;
      return {
        from: doc.content.size,
        to: doc.content.size,
      };
    }

    return {
      from: position as number,
      to: position as number,
    };
  }

  focus(position: Position = null) {
    if ((this.view.hasFocus() && position === null) || position === false) {
      return;
    }

    const {from, to} = this.resolveSelection(position);

    this.setSelection(from, to);
    setTimeout(() => this.view.focus(), 10);
  }

  setSelection(from: number = 0, to: number = 0) {
    if (!this.state) {
      return null;
    }

    const {doc, tr} = this.state;
    const resolvedFrom = minMax(from, 0, doc.content.size);
    const resolvedEnd = minMax(to, 0, doc.content.size);
    const selection = TextSelection.create(doc, resolvedFrom, resolvedEnd);
    const transaction = tr.setSelection(selection);

    this.view.dispatch(transaction);
  }

  blur() {
    (this.view.dom as HTMLElement).blur();
  }

  getSchemaJSON() {
    return JSON.parse(
      JSON.stringify({
        nodes: this.extensions.nodes,
        marks: this.extensions.marks,
      })
    );
  }

  getHTML() {
    if (this.state === null) {
      return '';
    }

    const div = document.createElement('div');
    const fragment = DOMSerializer.fromSchema(this.schema).serializeFragment(this.state.doc.content);

    div.appendChild(fragment);

    return div.innerHTML;
  }

  getJSON() {
    return this.state?.doc.toJSON() || {};
  }

  setContent(content = {}, emitUpdate = false, parseOptions?: ParseOptions) {
    if (this.state === null) {
      return;
    }

    const {doc, tr} = this.state;
    const document = this.createDocument(content, parseOptions);
    if (!document) {
      return;
    }
    const selection = TextSelection.create(doc, 0, doc.content.size);
    const transaction = tr
      .setSelection(selection)
      .replaceSelectionWith(document, false)
      .setMeta('preventUpdate', !emitUpdate);

    this.view.dispatch(transaction);
  }

  clearContent(emitUpdate = false) {
    this.setContent(this.options.emptyDocument, emitUpdate);
  }

  setActiveNodesAndMarks() {
    const state = this.state;

    if (!state) {
      return;
    }

    this.activeMarks = Object.entries(this.schema.marks).reduce(
      (marks, [name, mark]) => ({
        ...marks,
        [name]: (attrs: {[key: string]: any} = {}) => markIsActive(state, mark, attrs),
      }),
      {}
    );

    this.activeMarkAttrs = Object.entries(this.schema.marks).reduce(
      (marks, [name, mark]) => ({
        ...marks,
        [name]: getMarkAttrs(state, mark),
      }),
      {}
    );

    this.activeNodes = Object.entries(this.schema.nodes).reduce(
      (nodes, [name, node]) => ({
        ...nodes,
        [name]: (attrs: {[key: string]: any} = {}) => nodeIsActive(state, node, attrs),
      }),
      {}
    );
  }

  getMarkAttrs(type: any = null) {
    return this.activeMarkAttrs[type];
  }

  getNodeAttrs(type: any = null) {
    if (!this.state) {
      return {};
    }

    return {
      ...getNodeAttrs(this.state, this.schema.nodes[type]),
    };
  }

  get isActive(): {[key: string]: () => boolean} {
    return Object.entries({
      ...this.activeMarks,
      ...this.activeNodes,
    }).reduce(
      (types, [name, value]: [string, any]) => ({
        ...types,
        [name]: (attrs: {[key: string]: any} = ({} = {})) => value(attrs),
      }),
      {}
    );
  }

  registerPlugin(plugin: Plugin | null = null, handlePlugins?: any) {
    if (!plugin || this.state === null) {
      return;
    }

    const plugins =
      typeof handlePlugins === 'function'
        ? handlePlugins(plugin, this.state.plugins)
        : [plugin, ...this.state.plugins];
    const newState = this.state.reconfigure({plugins});
    this.view.updateState(newState);
  }

  unregisterPlugin(name = null) {
    if (!name || !this.view.docView || this.state === null) {
      return;
    }

    const newState = this.state.reconfigure({
      plugins: this.state.plugins.filter(plugin => !plugin.key.startsWith(`${name}$`)),
    });
    this.view.updateState(newState);
  }

  destroy() {
    if (!this.view) {
      return;
    }

    this.view.destroy();
  }
}
