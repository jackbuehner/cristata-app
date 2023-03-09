import '@emotion/react';
import type { themeType } from './utils/theme/theme';

declare module '@emotion/react' {
  export interface Theme extends themeType {}
}

declare module '@tanstack/table-core' {
  interface TableMeta<TData extends RowData> {
    compactMode: boolean;
    noWrap: boolean;
  }
}
