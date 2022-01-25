import { Editor } from '@tiptap/react';
import { tiptapOptions } from '../../../../../config';
import { useDropdown } from '../../../../../hooks/useDropdown';
import { Menu } from '../../../../Menu';

interface FontFamilyDropdownProps {
  editor: Editor | null;
  fontFamilies: tiptapOptions['features']['fontFamilies'];
}

/**
 * Use a dropdown for setting the font family of a tiptap editor.
 */
function useFontFamilyDropdown({ editor, ...props }: FontFamilyDropdownProps) {
  const [showDropdown, hideDropDown] = useDropdown(
    (triggerRect, dropdownRef) => {
      if (!editor) return <></>;
      return (
        <Menu
          ref={dropdownRef}
          pos={{
            top: triggerRect.bottom,
            left: triggerRect.left,
            width: 240,
          }}
          items={
            props.fontFamilies?.map((family) => {
              return {
                onClick: () => {
                  return editor.chain().focus().setFontFamily(family.name).run();
                },
                label: family.label || family.name,
                color: 'neutral',
                disabled: family.disabled,
              };
            }) || []
          }
          noIcons
        />
      );
    },
    [editor, props.fontFamilies],
    true,
    true
  );

  return [showDropdown, hideDropDown];
}

export { useFontFamilyDropdown };
