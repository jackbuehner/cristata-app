import {
  ModifyWebhook,
  Webhook,
  type CristataWebhookModifyInput,
  type WebhookQuery,
  type WebhookQueryVariables,
} from '$graphql/graphql';
import { queryWithStore } from '$graphql/query';
import { server } from '$utils/constants';
import { print } from 'graphql';
import type { PageLoad } from './$types';

export const load = (async ({ params, fetch }) => {
  const webhook = queryWithStore<WebhookQuery, WebhookQueryVariables>({
    fetch,
    tenant: params.tenant,
    query: Webhook,
    variables: {
      _id: params.webhook_id,
    },
  });

  const saveChanges = async (_id: string, input: CristataWebhookModifyInput) => {
    return await fetch(`${server.location}/v3/${params.tenant}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: print(ModifyWebhook),
        variables: { _id, input },
      }),
    });
  };

  return {
    webhook,
    saveWebhookChanges: saveChanges,
  };
}) satisfies PageLoad;
