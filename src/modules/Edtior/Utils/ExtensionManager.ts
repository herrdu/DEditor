import {keymap} from 'prosemirror-keymap';

import {Editor} from '../Editor';
import {Extension, Node as TiptapNode, Mark as TiptapMark} from '../Utils';
import {EditorView} from 'prosemirror-view';
import {Plugin, EditorState, Transaction} from 'prosemirror-state';
import {Schema} from 'prosemirror-model';

export type Nodes = {[key: string]: TiptapNode};
export type Marks = {[key: string]: TiptapMark};
export type Commands = {[key: string]: (attrs: {[key: string]: any}) => any};

export default class ExtensionManager {
  extensions: Extension[];
  view?: EditorView = undefined;

  constructor(extensions: Extension[] = [], editor: Editor) {
    extensions.forEach(extension => {
      extension.bindEditor(editor);
      extension.init();
    });
    this.extensions = extensions;
  }

  get nodes(): Nodes {
    return this.extensions
      .filter(extension => extension.type === 'node')
      .reduce(
        (nodes, {name, schema}) => ({
          ...nodes,
          [name]: schema,
        }),
        {}
      );
  }

  get options() {
    const {view} = this;
    return this.extensions.reduce(
      (nodes, extension) => ({
        ...nodes,
        [extension.name]: new Proxy(extension.options, {
          set(obj, prop, value) {
            const changed = obj[prop as string] !== value;

            Object.assign(obj, {[prop]: value});

            if (changed) {
              view?.updateState(view.state);
            }

            return true;
          },
        }),
      }),
      {}
    );
  }

  get marks(): Marks {
    return this.extensions
      .filter(extension => extension.type === 'mark')
      .reduce(
        (marks, {name, schema}) => ({
          ...marks,
          [name]: schema,
        }),
        {}
      );
  }

  get plugins(): Plugin[] {
    return this.extensions
      .filter(extension => extension.plugins)
      .reduce((allPlugins, {plugins}) => [...allPlugins, ...plugins], []);
  }

  keymaps({schema}: {schema: Schema}) {
    const extensionKeymaps = this.extensions
      .filter(extension => ['extension'].includes(extension.type))
      .filter(extension => extension.keys)
      .map(extension => extension.keys({schema}));

    const nodeMarkKeymaps = this.extensions
      .filter(extension => ['node', 'mark'].includes(extension.type))
      .filter(extension => extension.keys)
      .map(extension =>
        extension.keys({
          type: schema[`${extension.type}s` as 'nodes' | 'marks'][extension.name],
          schema,
        })
      );

    return [...extensionKeymaps, ...nodeMarkKeymaps].map(keys => keymap(keys));
  }

  inputRules({schema, excludedExtensions}: {schema: Schema; excludedExtensions: any[] | boolean}) {
    if (!(excludedExtensions instanceof Array) && excludedExtensions) return [];

    const allowedExtensions =
      excludedExtensions instanceof Array
        ? this.extensions.filter(extension => !excludedExtensions.includes(extension.name))
        : this.extensions;

    const extensionInputRules = allowedExtensions
      .filter(extension => ['extension'].includes(extension.type))
      .filter(extension => extension.inputRules)
      .map(extension => extension.inputRules({schema}));

    const nodeMarkInputRules = allowedExtensions
      .filter(extension => ['node', 'mark'].includes(extension.type))
      .filter(extension => extension.inputRules)
      .map(extension =>
        extension.inputRules({
          type: schema[`${extension.type}s` as 'nodes' | 'marks'][extension.name],
          schema,
        })
      );

    return [...extensionInputRules, ...nodeMarkInputRules].reduce(
      (allInputRules, inputRules) => [...allInputRules, ...inputRules],
      []
    );
  }

  pasteRules({schema, excludedExtensions}: {schema: Schema; excludedExtensions: any[] | boolean}): Plugin[] {
    if (!(excludedExtensions instanceof Array) && excludedExtensions) return [];

    const allowedExtensions =
      excludedExtensions instanceof Array
        ? this.extensions.filter(extension => !excludedExtensions.includes(extension.name))
        : this.extensions;

    const extensionPasteRules = allowedExtensions
      .filter(extension => ['extension'].includes(extension.type))
      .filter(extension => extension.pasteRules)
      .map(extension => extension.pasteRules({schema}));

    const nodeMarkPasteRules = allowedExtensions
      .filter(extension => ['node', 'mark'].includes(extension.type))
      .filter(extension => extension.pasteRules)
      .map(extension =>
        extension.pasteRules({
          type: schema[`${extension.type}s` as 'nodes' | 'marks'][extension.name],
          schema,
        })
      );

    return [...extensionPasteRules, ...nodeMarkPasteRules].reduce(
      (allPasteRules, pasteRules) => [...allPasteRules, ...pasteRules],
      []
    );
  }

  commands({schema, view}: {schema: Schema; view: EditorView}): Commands {
    return this.extensions
      .filter(extension => extension.commands)
      .reduce((allCommands, extension) => {
        const {name, type} = extension;
        const commands: {[key: string]: any} = {};
        const value = extension.commands({
          schema,
          ...(['node', 'mark'].includes(type)
            ? {
                type: schema[`${type}s` as 'nodes' | 'marks'][name],
              }
            : {}),
        });

        const apply = (
          cb: (attr: {
            [key: string]: any;
          }) => (state: EditorState, dispatch: (tr: Transaction) => void, view: EditorView) => void,
          attrs: {[key: string]: any}
        ) => {
          if (!view.editable) {
            return false;
          }
          view.focus();
          return cb(attrs)(view.state, view.dispatch, view);
        };

        const handle = (_name: any, _value: any) => {
          if (Array.isArray(_value)) {
            commands[_name] = (attrs: {[key: string]: any}) =>
              _value.forEach(callback => apply(callback, attrs));
          } else if (typeof _value === 'function') {
            commands[_name] = (attrs: {[key: string]: any}) => apply(_value, attrs);
          }
        };

        if (typeof value === 'object') {
          Object.entries(value).forEach(([commandName, commandValue]) => {
            handle(commandName, commandValue);
          });
        } else {
          handle(name, value);
        }

        return {
          ...allCommands,
          ...commands,
        };
      }, {});
  }
}
