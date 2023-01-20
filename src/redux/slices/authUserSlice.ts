import type { PayloadAction } from '@reduxjs/toolkit';
import * as toolkitRaw from '@reduxjs/toolkit';
import mongoose from 'mongoose';
import { isObjectId } from '../../utils/isObjectId';
const { createSlice } = ((toolkitRaw as any).default ?? toolkitRaw) as typeof toolkitRaw;
export interface AuthUserState {
  provider: string;
  name: string;
  _id: string; // hex respresentations of ObjectIds
  otherUsers: Array<{
    tenant: string;
    _id: string;
    name: string;
  }>;
}

const initialState: AuthUserState = {
  provider: '',
  name: '',
  _id: '000000000000000000000000',
  otherUsers: [],
};

export const authUserSlice = createSlice({
  name: 'authUser',
  initialState,
  reducers: {
    /**
     * Stores the authenticated user's auth provider.
     */
    setAuthProvider: (state, action: PayloadAction<string>) => {
      state.provider = action.payload;
    },
    /**
     * Stores the authenticated user's name.
     */
    setName: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
    },
    /**
     * Stores the authenticated user's teams.
     */
    setObjectId: (state, action: PayloadAction<string | mongoose.Types.ObjectId>) => {
      if (isObjectId(action.payload)) {
        state._id = new mongoose.Types.ObjectId(action.payload).toHexString();
      } else {
        console.error('invalid id', action.payload);
        throw new Error(`cannot use invalid object id for auth user id`);
      }
    },
    /**
     * Stores the other authenticated users
     */
    setOtherUsers: (state, action: PayloadAction<AuthUserState['otherUsers']>) => {
      state.otherUsers = action.payload;
    },
  },
});

export const { setAuthProvider, setName, setObjectId, setOtherUsers } = authUserSlice.actions;

export default authUserSlice.reducer;
