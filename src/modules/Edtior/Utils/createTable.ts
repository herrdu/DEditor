import createCell from './createCell';
import getTableNodeTypes from './getTableNodeTypes';
import {Schema, Node as ProseMirrorNode} from 'prosemirror-model';

export default function createTable(
  schema: Schema,
  rowsCount: number = 3,
  colsCount: number = 3,
  withHeaderRow: boolean = true,
  cellContent: ProseMirrorNode | null = null
) {
  const types = getTableNodeTypes(schema);

  const headerCells = [];
  const cells = [];

  for (let index = 0; index < colsCount; index += 1) {
    const cell = createCell(types.cell, cellContent);

    if (cell) {
      cells.push(cell);
    }

    if (withHeaderRow) {
      const headerCell = createCell(types.header_cell, cellContent);

      if (headerCell) {
        headerCells.push(headerCell);
      }
    }
  }

  const rows = [];

  for (let index = 0; index < rowsCount; index += 1) {
    rows.push(types.row.createChecked(null, withHeaderRow && index === 0 ? headerCells : cells));
  }

  return types.table.createChecked(null, rows);
}
