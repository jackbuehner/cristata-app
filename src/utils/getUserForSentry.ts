import { BasicProfileMe, type BasicProfileMeQuery } from '$graphql/graphql';
import { getQueryStore } from '$graphql/query';
import { authCache } from '$stores/authCache';
import type { User as SentryUser } from '@sentry/svelte';
import { getOperationAST } from 'graphql';
import { get as getStoreValue } from 'svelte/store';

export function getUserForSentry(): SentryUser | null {
  const authUser = getStoreValue(authCache)?.authUser;
  if (!authUser) return null;

  const meOperation = getOperationAST(BasicProfileMe);
  const meOperationName = (meOperation && meOperation.name && meOperation.name.value) || undefined;
  if (meOperationName) {
    const meStore = getQueryStore<BasicProfileMeQuery>({ queryName: meOperationName, tenant: authUser.tenant });
    const meData = getStoreValue(meStore).data?.user;
    if (meData) {
      return {
        id: `${authUser.tenant}.users.${authUser._id.toHexString()}`,
        username: authUser.name,
        email: meData.email || undefined,
        segment: authUser.tenant,
        ip_address: '{{auto}}',
      };
    }
  }

  return {
    id: `${authUser.tenant}.users.${authUser._id.toHexString()}`,
    username: authUser.name,
    segment: authUser.tenant,
    ip_address: '{{auto}}',
  };
}
