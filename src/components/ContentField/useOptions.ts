import { gql, useApolloClient } from '@apollo/client';
import { FieldDef } from '@jackbuehner/cristata-api/dist/api/graphql/helpers/generators/genSchema';
import { jsonToGraphQLQuery } from 'json-to-graphql-query';
import { merge } from 'merge-anything';
import { get as getProperty } from 'object-path';
import pluralize from 'pluralize';
import { SetStateAction, useEffect, useState, Dispatch } from 'react';
import { deepen } from '../../pages/CMS/CollectionItemPage/useFindDoc';
import { uncapitalize } from '../../utils/uncapitalize';

type Option = { value: string; label: string; disabled?: boolean; reason?: string };

type UseOptions = [
  /**
   * The current text value used to search for options.
   */
  string,
  /**
   * Function to update the text value used to search for options.
   */
  Dispatch<SetStateAction<string>>,
  {
    /**
     * The options found with the provided text value.
     */
    options: Option[];
    /**
     * Whether the newest array of options is being fetched from the server.
     */
    loading: boolean;
  }
];

/**
 * Generates options for a select dropdown based on the provided text value.
 *
 * @param collection the collection in which this hook searches for options
 * @param reference the reference definition, if available
 */
function useOptions(collection: string, reference?: FieldDef['reference']): UseOptions {
  const client = useApolloClient();
  const [textValue, setTextValue] = useState<string>('');
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    // we only want to execute the query if textValue is truthy
    if (textValue) {
      // mark it as loading and clear the existing values
      // so the select knows to tell the user that it is
      // currently loading
      setLoading(true);
      setOptions([]);

      // create an obersevable query to the collection
      // that allows us to listen for when a response
      // arrives or cancel a response before it arrives
      const query = client.watchQuery<{
        result: { docs: { value: string; label: string; disabled?: boolean; reason?: string }[] };
      }>({
        query: gql(
          jsonToGraphQLQuery({
            query: {
              result: {
                // we alias to "result" so the accessor for the data is always the same
                __aliasFor: uncapitalize(pluralize(collection)),
                __args: {
                  // limit to 6 because it shows enough options while also keeping responses fast
                  limit: 6,
                  // search for a character match in the name field, but not other fields
                  filter: JSON.stringify({
                    [reference?.fields?.name || 'name']: { $regex: textValue, $options: 'i' },
                    ...(reference?.filter || {}),
                  }),
                },
                docs: merge(
                  {
                    // alias the _id field to value because the select element needs a value field
                    value: { __aliasFor: reference?.fields?._id || '_id' },
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
        // do not cache so that the options in the query always reflect the latest data
        // (useful when the user makes a change to a reference in another tab)
        fetchPolicy: 'no-cache',
      });

      // do this once the query has resolved some data
      const observable = query.subscribe(({ data }) => {
        // the resulting docs can be used as the options for the reference
        let options = data.result.docs;

        // these field names need to be present and truthy in the option
        // for it to be selectable
        const requiredFieldNames = reference?.require;

        // for each option, confirm that it has the required fields
        // and disable the option if it is missing a required field
        options.forEach((option) => {
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
        setOptions(options);
        setLoading(false);
      });

      // destroy the observation in case the query has not finished
      // so that we do not have pending queries that will not
      // be used
      return () => observable.unsubscribe();
    } else {
      setOptions([]);
    }
  }, [
    client,
    collection,
    reference?.fields?._id,
    reference?.fields?.name,
    reference?.filter,
    reference?.forceLoadFields,
    reference?.require,
    textValue,
  ]);

  return [textValue, setTextValue, { options, loading }];
}

export type { Option };
export { useOptions };
