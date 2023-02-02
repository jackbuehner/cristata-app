import {
  TableCellsMerge20Regular,
  TableCellsSplit20Regular,
  TableDeleteColumn20Regular,
  TableDeleteRow20Regular,
  TableDismiss20Regular,
  TableFreezeColumn20Regular,
  TableMoveAbove20Regular,
  TableMoveBelow20Regular,
  TableMoveLeft20Regular,
  TableMoveRight20Regular,
} from '@fluentui/react-icons';
import type { Editor } from '@tiptap/react';
import { useDropdown } from '../../../../hooks/useDropdown';
import { Menu } from '../../../Menu';
import type { FieldY } from '../../hooks/useY';
import { ToolbarRow } from './ToolbarRow';
import { ToolbarRowButton } from './ToolbarRowButton';

interface TableToolbarRowProps {
  editor: Editor | null;
  isActive: boolean;
  isDisabled: boolean;
  y: FieldY;
}

function TableToolbarRow({ editor, isActive, ...props }: TableToolbarRowProps) {
  const [deleteDropdown] = useDropdown(
    (triggerRect, dropdownRef, _, { close }) => {
      return (
        <Menu
          ref={dropdownRef}
          onEscape={close}
          afterClick={close}
          pos={{
            top: triggerRect.bottom,
            left: triggerRect.left,
            width: 180,
          }}
          items={[
            {
              onClick: () => editor?.chain().focus().deleteTable().run(),
              label: 'Delete table',
              color: 'blue',
              icon: <TableDismiss20Regular />,
              disabled: !editor || props.isDisabled || !editor.can().deleteTable(),
            },
            {
              onClick: () => editor?.chain().focus().deleteColumn().run(),
              label: 'Delete column',
              color: 'blue',
              icon: <TableDeleteColumn20Regular />,
              disabled: !editor || props.isDisabled || !editor.can().deleteColumn(),
            },
            {
              onClick: () => editor?.chain().focus().deleteRow().run(),
              label: 'Delete row',
              color: 'blue',
              icon: <TableDeleteRow20Regular />,
              disabled: !editor || props.isDisabled || !editor.can().deleteRow(),
            },
          ]}
        />
      );
    },
    [],
    true,
    true
  );

  const [insertDropdown] = useDropdown(
    (triggerRect, dropdownRef, _, { close }) => {
      return (
        <Menu
          ref={dropdownRef}
          onEscape={close}
          afterClick={close}
          pos={{
            top: triggerRect.bottom,
            left: triggerRect.left,
            width: 180,
          }}
          items={[
            {
              onClick: () => editor?.chain().focus().addRowBefore().run(),
              label: 'Above',
              color: 'blue',
              icon: <TableMoveAbove20Regular />,
              disabled: !editor || props.isDisabled || !editor.can().addRowBefore(),
            },
            {
              onClick: () => editor?.chain().focus().addRowAfter().run(),
              label: 'Below',
              color: 'blue',
              icon: <TableMoveBelow20Regular />,
              disabled: !editor || props.isDisabled || !editor.can().addRowAfter(),
            },
            {
              onClick: () => editor?.chain().focus().addColumnBefore().run(),
              label: 'Left',
              color: 'blue',
              icon: <TableMoveLeft20Regular />,
              disabled: !editor || props.isDisabled || !editor.can().addColumnBefore(),
            },
            {
              onClick: () => editor?.chain().focus().addColumnAfter().run(),
              label: 'Right',
              color: 'blue',
              icon: <TableMoveRight20Regular />,
              disabled: !editor || props.isDisabled || !editor.can().addColumnAfter(),
            },
          ]}
        />
      );
    },
    [],
    true,
    true
  );

  const [headerDropdown] = useDropdown(
    (triggerRect, dropdownRef, _, { close }) => {
      return (
        <Menu
          ref={dropdownRef}
          onEscape={close}
          afterClick={close}
          pos={{
            top: triggerRect.bottom,
            left: triggerRect.left,
            width: 180,
          }}
          items={[
            {
              onClick: () => editor?.chain().focus().toggleHeaderRow().run(),
              label: 'Toggle header row',
              color: 'blue',
              disabled: !editor || props.isDisabled || !editor.can().toggleHeaderRow(),
            },
            {
              onClick: () => editor?.chain().focus().toggleHeaderColumn().run(),
              label: 'Toggle header column',
              color: 'blue',
              disabled: !editor || props.isDisabled || !editor.can().toggleHeaderColumn(),
            },
            {
              onClick: () => editor?.chain().focus().toggleHeaderCell().run(),
              label: 'Toggle header cell',
              color: 'blue',
              disabled: !editor || props.isDisabled || !editor.can().toggleHeaderCell(),
            },
          ]}
          noIcons
        />
      );
    },
    [],
    true,
    true
  );

  if (!editor) return <></>;

  return (
    <ToolbarRow isActive={isActive}>
      <ToolbarRowButton
        onClick={deleteDropdown}
        isActive={false}
        icon={<TableDismiss20Regular />}
        disabled={
          props.isDisabled ||
          (!editor.can().deleteTable() && !editor.can().deleteColumn() && !editor.can().deleteRow())
        }
        showChevron
      >
        Delete
      </ToolbarRowButton>
      <ToolbarRowButton
        onClick={insertDropdown}
        isActive={false}
        icon={<TableMoveAbove20Regular />}
        disabled={
          props.isDisabled ||
          (!editor.can().addRowBefore() &&
            !editor.can().addRowAfter() &&
            !editor.can().addColumnBefore() &&
            !editor.can().addColumnAfter())
        }
        showChevron
      >
        Insert
      </ToolbarRowButton>
      <ToolbarRowButton
        onClick={() => editor?.chain().focus().mergeCells().run()}
        isActive={false}
        icon={<TableCellsMerge20Regular />}
        disabled={props.isDisabled || !editor.can().mergeCells()}
      >
        Merge cells
      </ToolbarRowButton>
      <ToolbarRowButton
        onClick={() => editor?.chain().focus().splitCell().run()}
        isActive={false}
        icon={<TableCellsSplit20Regular />}
        disabled={props.isDisabled || !editor.can().splitCell()}
      >
        Split cells
      </ToolbarRowButton>
      <ToolbarRowButton
        onClick={headerDropdown}
        isActive={false}
        icon={<TableFreezeColumn20Regular />}
        disabled={
          props.isDisabled ||
          (!editor.can().toggleHeaderRow() &&
            !editor.can().toggleHeaderColumn() &&
            !editor.can().toggleHeaderCell())
        }
        showChevron
      >
        Header styles
      </ToolbarRowButton>
    </ToolbarRow>
  );
}

export { TableToolbarRow };
