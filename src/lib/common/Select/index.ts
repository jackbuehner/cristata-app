export { default as SelectMany } from './SelectMany.svelte';

export type Option = {
  label?: string;
  _id: string;
  disabled?: boolean;
  reason?: string;
  isDndShadowItem?: boolean;
};
