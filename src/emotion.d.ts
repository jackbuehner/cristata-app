import '@emotion/react';
import { themeType } from './utils/theme/theme';

declare module '@emotion/react' {
  export interface Theme extends themeType {}
}
