import {Node} from '../../modules/Edtior';
import TableNodes from './TableNodes';

export class TableRow extends Node {
  get name() {
    return 'table_row';
  }

  get schema() {
    return TableNodes.table_row;
  }
}
