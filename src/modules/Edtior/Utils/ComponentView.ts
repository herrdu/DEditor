import Vue from 'vue';

import {getMarkRange} from '../Utils';
import {Editor} from '../Editor';
import {EditorView, DecorationSet} from 'prosemirror-view';

export default class ComponentView {
  component: Vue;
  editor: Editor;
  extension: any;
  view: EditorView;
  decorations: any;
  isNode: boolean;
  isMark: boolean;
  getPos: () => any;

  captureEvents: boolean;
  node: any;
  parent: any;
  vm: any;
  dom: Element;
  contentDOM: HTMLDivElement;
  setSelection: any;

  constructor(
    component: any,
    {
      editor,
      extension,
      parent,
      node,
      view,
      decorations,
      getPos,
    }: {
      editor: Editor;
      extension: any;
      parent: any;
      node: any;
      view: EditorView;
      decorations: DecorationSet;
      getPos: any;
    }
  ) {
    this.component = component;
    this.editor = editor;
    this.extension = extension;
    this.parent = parent;
    this.node = node;
    this.view = view;
    this.decorations = decorations;
    this.isNode = !!this.node.marks;
    this.isMark = !this.isNode;
    this.getPos = this.isMark ? this.getMarkPos : getPos;
    this.captureEvents = true;
    this.dom = this.createDOM();
    this.contentDOM = this.vm.$refs.content;
  }

  createDOM() {
    const Component = Vue.extend(this.component);
    const props = {
      editor: this.editor,
      node: this.node,
      view: this.view,
      getPos: () => this.getPos(),
      decorations: this.decorations,
      selected: false,
      options: this.extension.options,
      updateAttrs: (attrs: {[key: string]: any}) => this.updateAttrs(attrs),
    };

    if (typeof this.extension.setSelection === 'function') {
      this.setSelection = this.extension.setSelection;
    }

    if (typeof this.extension.update === 'function') {
      this.update = this.extension.update;
    }

    this.vm = new Component({
      parent: this.parent,
      propsData: props,
    }).$mount();

    return this.vm.$el;
  }

  update(node: any, decorations: any) {
    if (node.type !== this.node.type) {
      return false;
    }

    if (node === this.node && this.decorations === decorations) {
      return true;
    }

    this.node = node;
    this.decorations = decorations;

    this.updateComponentProps({
      node,
      decorations,
    });

    return true;
  }

  updateComponentProps(props: {[key: string]: any}) {
    if (!this.vm._props) {
      return;
    }

    // Update props in component
    // TODO: Avoid mutating a prop directly.
    // Maybe there is a better way to do this?
    const originalSilent = Vue.config.silent;
    Vue.config.silent = true;

    Object.entries(props).forEach(([key, value]) => {
      this.vm._props[key] = value;
    });
    // this.vm._props.node = node
    // this.vm._props.decorations = decorations
    Vue.config.silent = originalSilent;
  }

  updateAttrs(attrs: {[key: string]: any}) {
    if (!this.view.editable) {
      return;
    }

    const {state} = this.view;
    const {type} = this.node;
    const pos = this.getPos();
    const newAttrs = {
      ...this.node.attrs,
      ...attrs,
    };
    const transaction = this.isMark
      ? state.tr.removeMark(pos.from, pos.to, type).addMark(pos.from, pos.to, type.create(newAttrs))
      : state.tr.setNodeMarkup(pos, undefined, newAttrs);

    this.view.dispatch(transaction);
  }

  // prevent a full re-render of the vue component on update
  // we'll handle prop updates in `update()`
  ignoreMutation(mutation: any) {
    // allow leaf nodes to be selected
    if (mutation.type === 'selection') {
      return false;
    }

    if (!this.contentDOM) {
      return true;
    }
    return !this.contentDOM.contains(mutation.target);
  }

  // disable (almost) all prosemirror event listener for node views
  stopEvent(event: any) {
    if (typeof this.extension.stopEvent === 'function') {
      return this.extension.stopEvent(event);
    }

    const draggable = !!this.extension.schema.draggable;

    // support a custom drag handle
    if (draggable && event.type === 'mousedown') {
      const dragHandle = event.target.closest && event.target.closest('[data-drag-handle]');
      const isValidDragHandle = dragHandle && (this.dom === dragHandle || this.dom.contains(dragHandle));

      if (isValidDragHandle) {
        this.captureEvents = false;
        document.addEventListener(
          'dragend',
          () => {
            this.captureEvents = true;
          },
          {once: true}
        );
      }
    }

    const isCopy = event.type === 'copy';
    const isPaste = event.type === 'paste';
    const isCut = event.type === 'cut';
    const isDrag = event.type.startsWith('drag') || event.type === 'drop';

    if ((draggable && isDrag) || isCopy || isPaste || isCut) {
      return false;
    }

    return this.captureEvents;
  }

  selectNode() {
    this.updateComponentProps({
      selected: true,
    });
  }

  deselectNode() {
    this.updateComponentProps({
      selected: false,
    });
  }

  getMarkPos() {
    const pos = this.view.posAtDOM(this.dom, 0);
    const resolvedPos = this.view.state.doc.resolve(pos);
    const range = getMarkRange(resolvedPos, this.node.type);
    return range;
  }

  destroy() {
    this.vm.$destroy();
  }
}
