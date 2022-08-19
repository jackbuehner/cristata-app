import { CollaborativeFieldWrapperProps } from './CollaborativeFieldWrapper';

interface CollaborativeFieldProps extends Omit<Omit<CollaborativeFieldWrapperProps, 'label'>, 'children'> {
  label?: string;
}

export { CollaborativeCheckbox } from './CollaborativeCheckbox';
export { CollaborativeCode } from './CollaborativeCode';
export { CollaborativeCombobox } from './CollaborativeCombobox';
export { CollaborativeDateTime } from './CollaborativeDateTime';
export { CollaborativeDocArray } from './CollaborativeDocArray';
export { CollaborativeFieldWrapper } from './CollaborativeFieldWrapper';
export { CollaborativeNumberField } from './CollaborativeNumberField';
export { CollaborativeReferenceMany } from './CollaborativeReferenceMany';
export { CollaborativeReferenceOne } from './CollaborativeReferenceOne';
export { CollaborativeSelectMany } from './CollaborativeSelectMany';
export { CollaborativeSelectOne } from './CollaborativeSelectOne';
export { CollaborativeTextField } from './CollaborativeTextField';
export type { CollaborativeFieldProps };
