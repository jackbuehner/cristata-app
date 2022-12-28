import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import mongoose from 'mongoose';
import { isObjectId } from '../../utils/isObjectId';

export interface AuthUserState {
  provider: string;
  name: string;
  _id: string; // hex respresentations of ObjectIds
}

interface constantcontact {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

const initialState: AuthUserState = {
  provider: '',
  name: '',
  _id: '000000000000000000000000',
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
  },
});

export const { setAuthProvider, setName, setObjectId } = authUserSlice.actions;

export default authUserSlice.reducer;
