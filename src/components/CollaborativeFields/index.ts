import { FieldProps } from '../ContentField/Field';
import { FieldY } from '../Tiptap/hooks/useY';

interface CollaborativeFieldProps extends Omit<Omit<FieldProps, 'label'>, 'children'> {
  y: FieldY;
  label?: string;
}

export { CollaborativeCheckbox } from './CollaborativeCheckbox';
export { CollaborativeCode } from './CollaborativeCode';
export { CollaborativeCombobox } from './CollaborativeCombobox';
export { CollaborativeDateTime } from './CollaborativeDateTime';
export { CollaborativeNumberField } from './CollaborativeNumberField';
export { CollaborativeTextField } from './CollaborativeTextField';
export type { CollaborativeFieldProps };
