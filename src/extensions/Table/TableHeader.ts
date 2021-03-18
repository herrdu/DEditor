import {Node} from '../../modules/Edtior';
import TableNodes from './TableNodes';

export class TableHeader extends Node {
  get name() {
    return 'table_header';
  }

  get schema() {
    return TableNodes.table_header;
  }
}
