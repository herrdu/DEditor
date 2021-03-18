import {Node} from '../../modules/Edtior';

import {
  tableEditing,
  goToNextCell,
  addColumnBefore,
  addColumnAfter,
  deleteColumn,
  addRowBefore,
  addRowAfter,
  deleteRow,
  deleteTable,
  mergeCells,
  splitCell,
  toggleHeaderColumn,
  toggleHeaderRow,
  toggleHeaderCell,
  setCellAttr,
  fixTables,
} from 'prosemirror-tables';

import {Schema} from 'prosemirror-model';
import {EditorState, Transaction, TextSelection} from 'prosemirror-state';
import {createTable} from 'prosemirror-utils';
import TableNodes from './TableNodes';

export class Table extends Node {
  get name() {
    return 'table';
  }

  get defaultOptions() {
    return {
      resizable: false,
    };
  }

  get schema() {
    return TableNodes.table;
  }

  commands({schema}: {schema: Schema}) {
    return {
      createTable: ({
        rowsCount,
        colsCount,
        withHeaderRow,
      }: {
        rowsCount: number;
        colsCount: number;
        withHeaderRow: boolean;
      }) => (state: EditorState, dispatch: (tr: Transaction) => void) => {
        const offset = state.tr.selection.anchor + 1;

        const nodes = createTable(schema, rowsCount, colsCount, withHeaderRow);
        const tr = state.tr.replaceSelectionWith(nodes).scrollIntoView();
        const resolvedPos = tr.doc.resolve(offset);

        tr.setSelection(TextSelection.near(resolvedPos));

        dispatch(tr);
      },
      addColumnBefore: () => addColumnBefore,
      addColumnAfter: () => addColumnAfter,
      deleteColumn: () => deleteColumn,
      addRowBefore: () => addRowBefore,
      addRowAfter: () => addRowAfter,
      deleteRow: () => deleteRow,
      deleteTable: () => deleteTable,
      toggleCellMerge: () => (state: EditorState, dispatch?: (tr: Transaction) => void) => {
        if (mergeCells(state, dispatch)) {
          return;
        }
        splitCell(state, dispatch);
      },
      mergeCells: () => mergeCells,
      splitCell: () => splitCell,
      toggleHeaderColumn: () => toggleHeaderColumn,
      toggleHeaderRow: () => toggleHeaderRow,
      toggleHeaderCell: () => toggleHeaderCell,
      setCellAttr: () => setCellAttr,
      fixTables: () => fixTables,
    };
  }

  keys() {
    return {
      Tab: goToNextCell(1),
      'Shift-Tab': goToNextCell(-1),
    };
  }

  get plugins() {
    // 暂时解决table复制时，创建的tableView去掉样式的问题
    // return [...(this.options.resizable ? [columnResizing({})] : []), tableEditing()];
    return [...(this.options.resizable ? [] : []), tableEditing()];
  }
}
