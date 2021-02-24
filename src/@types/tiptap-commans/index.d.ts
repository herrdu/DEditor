declare module "tiptap-commands" {
  // import Vue from 'vue';
  // import { Plugin } from 'prosemirror-commands';

  export function toggleMark<S extends Schema = any>(
    markType: MarkType<S>,
    attrs?: { [key: string]: any }
  ): (
    state: EditorState<S>,
    dispatch?: (tr: Transaction<S>) => void
  ) => boolean;

  export function toggleWrap(
    type: NodeType
  ): (
    state: EditorState<S>,
    dispatch?: (tr: Transaction<S>) => void
  ) => boolean;
  export function toggleList(
    listType: NodeType,
    itemType: any
  ): (
    state: EditorState<S>,
    dispatch?: (tr: Transaction<S>) => void
  ) => boolean;

  export function wrappingInputRule<S extends Schema = any>(
    regexp: RegExp,
    nodeType: NodeType<S>,
    getAttrs?:
      | { [key: string]: any }
      | ((p: string[]) => { [key: string]: any } | null | undefined),
    joinPredicate?: (p1: string[], p2: ProsemirrorNode<S>) => boolean
  ): InputRule<S>;

  export function chainCommands<S extends Schema = any>(
    ...commands: Array<Command<S>>
  ): Command<S>;
  export function exitCode<S extends Schema = any>(
    state: EditorState<S>,
    dispatch?: (tr: Transaction<S>) => void
  ): boolean;

  export function setBlockType<S extends Schema = any>(
    nodeType: NodeType<S>,
    attrs?: { [key: string]: any }
  ): (
    state: EditorState<S>,
    dispatch?: (tr: Transaction<S>) => void
  ) => boolean;

  export function toggleBlockType<S extends Schema = any>(
    type: NodeType,
    toggleType: NodeType,
    attrs: any = {}
  ): (
    state: EditorState<S>,
    dispatch?: (tr: Transaction<S>) => void
  ) => boolean;

  export function splitListItem<S extends Schema = any>(
    itemType: NodeType<S>
  ): (
    state: EditorState<S>,
    dispatch?: (tr: Transaction<S>) => void
  ) => boolean;

  export function liftListItem<S extends Schema = any>(
    itemType: NodeType<S>
  ): (
    state: EditorState<S>,
    dispatch?: (tr: Transaction<S>) => void
  ) => boolean;

  export function sinkListItem<S extends Schema = any>(
    itemType: NodeType<S>
  ): (
    state: EditorState<S>,
    dispatch?: (tr: Transaction<S>) => void
  ) => boolean;

  export function nodeInputRule<S extends Schema = any>(
    regexp: RegExp,
    type: NodeType,
    getAttrs?: any
  ): Transaction<S>;

  export function updateMark(type: MarkType, attrs: any);
  export function removeMark(type: MarkType);
}
