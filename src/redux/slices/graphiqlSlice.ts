import type { PayloadAction } from '@reduxjs/toolkit';
import * as toolkitRaw from '@reduxjs/toolkit';
import type { GraphQLSchema } from 'graphql';
const { createSlice } = ((toolkitRaw as any).default ?? toolkitRaw) as typeof toolkitRaw;
export interface GraphiQLState {
  query?: string;
  explorerIsOpen: boolean;
  schema?: GraphQLSchema;
}

const initialState: GraphiQLState = {
  query: undefined,
  explorerIsOpen: false,
  schema: undefined,
};

export const graphiqlSlice = createSlice({
  name: 'graphiql',
  initialState,
  reducers: {
    setQuery: (state, action: PayloadAction<string | undefined>) => {
      state.query = action.payload;
    },
    setExplorerIsOpen: (state, action: PayloadAction<boolean>) => {
      state.explorerIsOpen = action.payload;
    },
    setSchema: (state, action: PayloadAction<GraphQLSchema | undefined>) => {
      //@ts-expect-error ignore readonly rule
      state.schema = action.payload;
    },
  },
});

export const { setQuery, setExplorerIsOpen, setSchema } = graphiqlSlice.actions;

export default graphiqlSlice.reducer;
