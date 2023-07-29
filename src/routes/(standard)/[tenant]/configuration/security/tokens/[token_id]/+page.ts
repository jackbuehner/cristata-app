import { ModifyToken, type ModifyTokenMutation, type ModifyTokenMutationVariables } from '$graphql/graphql';
import { server } from '$utils/constants';
import { print } from 'graphql';
import type { PageLoad } from './$types';

export const load = (async ({ params, fetch }) => {
  const modifyToken = async (variables: ModifyTokenMutationVariables) => {
    return await fetch(`${server.location}/v3/${params.tenant}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: print(ModifyToken),
        variables,
      }),
    })
      .then((res) => {
        return res.json();
      })
      .then(({ data, errors }: { data: ModifyTokenMutation; errors: any }) => {
        if (errors) throw Error(JSON.stringify(errors));
        return data;
      });
  };

  return { modifyToken, params };
}) satisfies PageLoad;
