import { FieldProps } from '../ContentField/Field';
import { FieldY } from '../Tiptap/hooks/useY';

interface CollaborativeFieldProps extends Omit<Omit<FieldProps, 'label'>, 'children'> {
  y: FieldY;
  label?: string;
}

export { CollaborativeTextField } from './CollaborativeTextField';
export { CollaborativeNumberField } from './CollaborativeNumberField';
export type { CollaborativeFieldProps };
