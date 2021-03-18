import {Node as ProseMirrorNode} from 'prosemirror-model';

export default function createCell(cellType: any, cellContent: ProseMirrorNode | null = null) {
  if (cellContent) {
    return cellType.createChecked(null, cellContent);
  }

  return cellType.createAndFill();
}
