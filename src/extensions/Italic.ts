import { MarkSpec, MarkType } from 'prosemirror-model';
import { Mark } from 'tiptap';
import { toggleMark } from 'tiptap-commands';

export default class Italic extends Mark {
  get name() {
    return 'italic';
  }

  get schema(): MarkSpec {
    return {
      group: 'inline',
      parseDOM: [{tag: 'i'}, {tag: 'em'}, {style: 'font-style=italic'}],
      toDOM: () => ['em', 0],
    };
  }

  keys({type}: {type: MarkType}) {
    return {
      'Mod-i': toggleMark(type),
    };
  }

  commands({type}: {type: MarkType}) {
    return () => toggleMark(type);
  }

}
