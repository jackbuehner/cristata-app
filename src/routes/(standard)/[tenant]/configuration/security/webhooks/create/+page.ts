import { CreateWebhook, type CreateWebhookMutation } from '$graphql/graphql';
import { server } from '$utils/constants';
import { print } from 'graphql';
import type { PageLoad } from './$types';

interface CreateVariables {
  name: string;
  url: string;
  verb: string;
  collections: string[];
  triggers: string[];
}

export const load = (async ({ params, fetch }) => {
  const createWebhook = async (variables: CreateVariables) => {
    return await fetch(`${server.location}/v3/${params.tenant}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: print(CreateWebhook),
        variables,
      }),
    })
      .then((res) => {
        return res.json();
      })
      .then(({ data, errors }: { data: CreateWebhookMutation; errors: any }) => {
        if (errors) throw Error(JSON.stringify(errors));
        return data;
      });
  };

  return { createWebhook };
}) satisfies PageLoad;
