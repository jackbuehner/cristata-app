import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import mongoose from 'mongoose';
import { isObjectId } from '../../utils/isObjectId';

export interface AuthUserState {
  email: string;
  provider: string;
  teams: string[]; // hex respresentations of ObjectIds
  name: string;
  username: string;
  _id: string; // hex respresentations of ObjectIds
}

interface constantcontact {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

const initialState: AuthUserState = {
  email: '',
  provider: '',
  teams: [],
  name: '',
  username: '',
  _id: '000000000000000000000000',
};

export const authUserSlice = createSlice({
  name: 'authUser',
  initialState,
  reducers: {
    /**
     * Stores the authenticated user's email.
     */
    setEmail: (state, action: PayloadAction<string>) => {
      state.email = action.payload;
    },
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
     * Stores the authenticated user's username.
     */
    setUsername: (state, action: PayloadAction<string>) => {
      state.username = action.payload;
    },
    /**
     * Stores the authenticated user's teams.
     */
    setTeams: (state, action: PayloadAction<string[]>) => {
      state.teams = action.payload;
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

export const { setEmail, setAuthProvider, setName, setUsername, setTeams, setObjectId } = authUserSlice.actions;

export default authUserSlice.reducer;
