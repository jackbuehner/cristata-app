import { CreateToken, type CreateTokenMutation, type CreateTokenMutationVariables } from '$graphql/graphql';
import { server } from '$utils/constants';
import { print } from 'graphql';
import type { PageLoad } from './$types';

export const load = (async ({ params, fetch }) => {
  const createToken = async (variables: CreateTokenMutationVariables) => {
    return await fetch(`${server.location}/v3/${params.tenant}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: print(CreateToken),
        variables,
      }),
    })
      .then((res) => {
        return res.json();
      })
      .then(({ data, errors }: { data: CreateTokenMutation; errors: any }) => {
        if (errors) throw Error(JSON.stringify(errors));
        return data;
      });
  };

  return { createToken };
}) satisfies PageLoad;
