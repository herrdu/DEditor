import { Node } from 'tiptap';
import TableNodes from './TableNodes';

export class TableCell extends Node {
  get name() {
    return 'table_cell';
  }

  get schema() {
    return TableNodes.table_cell;
  }
}