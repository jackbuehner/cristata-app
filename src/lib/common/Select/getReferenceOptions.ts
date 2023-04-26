import { query } from '$graphql/query';
import { deepen } from '$utils/deepen';
import { hasKey } from '$utils/hasKey';
import { getProperty } from '$utils/objectPath';
import type { FieldDef } from '@jackbuehner/cristata-generator-schema';
import { notEmpty, uncapitalize } from '@jackbuehner/cristata-utils';
import gql from 'graphql-tag';
import { jsonToGraphQLQuery } from 'json-to-graphql-query';
import { merge } from 'merge-anything';
import pluralize from 'pluralize';
import { writable } from 'svelte/store';
import type { Option } from '.';

function getReferenceOptions(tenant: string, reference?: FieldDef['reference'] & { collection: string }) {
  const searchValue = writable('');
  const options = writable<Option[]>([]);
  const loading = writable(false);
  const error = writable('');

  // return early if reference not provided
  if (!reference) return { searchValue, options, loading, error };

  // re-query the data when the search string changes
  let controller = new AbortController();
  searchValue.subscribe((newSearchValue) => {
    error.set('');

    // abort observors for the last abort controller and create a new one
    // so that there will never multiples of this query running at once
    controller.abort();
    controller = new AbortController();

    // we only want to execute the query if the search value is not empty
    if (newSearchValue) {
      // mark it as loading and clear the existing values
      // so the select knows to tell the user that it is
      // currently loading
      loading.set(true);
      options.set([]);

      // create an abortable query to the collection
      // that allows us to listen for when a response
      // arrives or cancel a response before it arrives
      query<{ result?: { docs: { _id: string; label: string; disabled?: boolean; reason?: string }[] } }>({
        fetch,
        signal: controller.signal,
        tenant,
        query: gql(
          jsonToGraphQLQuery({
            query: {
              result: {
                // we alias to "result" so the accessor for the data is always the same
                __aliasFor: uncapitalize(pluralize(reference.collection)),
                __args: {
                  // limit to 6 because it shows enough options while also keeping responses fast
                  limit: 6,
                  // search for a character match in the name field, but not other fields
                  filter: JSON.stringify({
                    [reference?.fields?.name || 'name']: { $regex: newSearchValue, $options: 'i' },
                    ...(reference?.filter || {}),
                  }),
                },
                docs: merge(
                  {
                    // alias the _id field to value because the select element needs a value field
                    _id: { __aliasFor: reference?.fields?._id || '_id' },
                    // alias the name field to label because the select element needs a label field
                    label: { __aliasFor: reference?.fields?.name || 'name' },
                  },
                  ...(reference?.require?.map((requiredField, index) => {
                    // also receive the fields that are required so we can detect if they are present
                    return deepen({ [requiredField]: true });
                  }) || []),
                  // get the fields that are forced by the config
                  ...(reference?.forceLoadFields || []).map((field) => deepen({ [field]: true }))
                ),
              },
            },
          })
        ),
        useCache: false,
      })
        .then((res) => {
          if (res?.errors) {
            if (Array.isArray(res.errors) && hasKey(res.errors[0], 'message')) {
              throw new Error(`GQL: ${res.errors[0].message}`);
            } else {
              throw new Error(`Unexpected error(s): ${JSON.stringify(res.errors)}`);
            }
          }

          // the resulting docs can be used as the options for the reference
          let foundOptions = res?.data?.result?.docs?.filter(notEmpty);
          if (!foundOptions) throw new Error('No reference docs array found');

          // these field names need to be present and truthy in the option
          // for it to be selectable
          const requiredFieldNames = reference?.require;

          // for each option, confirm that it has the required fields
          // and disable the option if it is missing a required field
          foundOptions.forEach((option) => {
            // find the names of the fields that have falsy values
            const falsyFieldNames =
              requiredFieldNames?.filter((requiredFieldName) => !getProperty(option, requiredFieldName)) || [];

            // if the option is missing some fields,
            // disable the option so it cannot be selected
            // and provide a reason so the user knows
            // why the option is disabled
            if (falsyFieldNames.length > 0) {
              option.disabled = true;
              option.reason = `This document cannot be selected because it is missing the following required fields: ${falsyFieldNames.join(
                ', '
              )}`;
            }
          });

          // set the options and present them to the user
          options.set(foundOptions);
          loading.set(false);
        })
        .catch((err) => {
          console.error(err);
          if (err instanceof Error) {
            error.set(err.message);
          } else {
            error.set('Unexpected error');
          }
        });
    } else {
      loading.set(false);
    }
  });

  return { searchValue, options, loading, error };
}

export { getReferenceOptions };
