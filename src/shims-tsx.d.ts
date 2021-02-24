import { Editor } from "tiptap";
import Vue, { VNode } from "vue";

declare global {
  namespace JSX {
    // tslint:disable no-empty-interface
    interface Element extends VNode {}
    // tslint:disable no-empty-interface
    interface ElementClass extends Vue {}
    interface IntrinsicElements {
      [elem: string]: any;
    }

    // ** Add the following lines to solve the issue **
    interface ElementAttributesProperty{
      $props: {}
    }
  }
}
