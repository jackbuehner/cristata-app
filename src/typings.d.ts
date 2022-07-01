import '@emotion/react';
import { themeType } from './utils/theme/theme';

declare module 'react-use-dimensions' {
  var useDimensions: any;
  export = useDimensions;
}

declare module 'graphiql-explorer' {
  var GraphiQLExplorer: any;
  export = GraphiQLExplorer;
}

declare module '@emotion/react' {
  export interface Theme extends themeType {}
}
