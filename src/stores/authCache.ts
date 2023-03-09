import mongoose from 'mongoose';
import { writable } from 'svelte/store';
import { z } from 'zod';

export type AuthUserType = z.infer<typeof authUserValidator>;

export const authCache = writable<{ last: Date; authUser: AuthUserType }>();

export const userValidator = z.object({
  _id: z.string().transform((hexId) => new mongoose.Types.ObjectId(hexId)),
  name: z.string(),
  provider: z.string(),
  tenant: z.string(),
});

export const authUserValidator = userValidator.extend({
  otherUsers: userValidator.array().default([]),
});
