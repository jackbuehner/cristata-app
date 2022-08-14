import { ApolloClient } from '@apollo/client';
import {
  isTypeTuple,
  MongooseSchemaType,
} from '@jackbuehner/cristata-api/dist/api/graphql/helpers/generators/genSchema';
import { get as getProperty, set as setProperty } from 'object-path';
import { z } from 'zod';
import fieldUtils from '../../../components/CollaborativeFields/utils';
import { EntryY } from '../../../components/Tiptap/hooks/useY';
import { DeconstructedSchemaDefType } from '../../../hooks/useCollectionSchemaConfig/useCollectionSchemaConfig';

function addToY(
  y: EntryY,
  schemaDef: DeconstructedSchemaDefType,
  client: ApolloClient<object>,
  inputData: any
) {
  const data = JSON.parse(JSON.stringify(inputData));

  const JSONFields = schemaDef.filter(([key, def]) => def.type === 'JSON').map(([key, def]) => key);

  JSONFields.forEach((key) => {
    data[key] = JSON.parse(getProperty(data, key));
  });

  schemaDef.forEach(([key, def]) => {
    if (!y.ydoc) return;

    const [schemaType, isArray] = (() => {
      const schemaType: MongooseSchemaType | 'DocArray' = isTypeTuple(def.type) ? def.type[1] : def.type;
      const isArrayType = Array.isArray(schemaType);

      if (isArrayType) return [schemaType[0], true];
      return [schemaType, false];
    })();

    const options = def.field?.options as unknown as
      | { value: string | number; label: string; disabled?: boolean }[]
      | undefined;

    const reference = def.field?.reference;

    if (schemaType === 'Boolean') {
      // arrays of booleans are not supported in the app
      if (isArray) return;

      const validator = z.boolean().optional().nullable();
      const validValue = validator.parse(getProperty(data, key));

      const boolean = new fieldUtils.shared.Boolean(y.ydoc);
      boolean.set(key, validValue);
    }

    if (schemaType === 'Date') {
      // arrays of dates are not supported in the app
      if (isArray) return;

      const validator = z.string().optional().nullable();
      const validValue = validator.parse(getProperty(data, key));

      const date = new fieldUtils.shared.Date(y.ydoc);
      date.set(key, validValue);
    }

    if (schemaType === 'DocArray') {
      const validator = z.record(z.any()).array();
      const validValue = validator.parse(getProperty(data, key));

      const array = new fieldUtils.shared.DocArray(y.ydoc);
      const [, generatedUuids] = array.set(key, validValue);

      // insert values into the fields of each doc
      // by running each field through this function
      // after injecting the field data into the
      // data object with the correct key
      if (def.docs) {
        generatedUuids.forEach((uuid, index) => {
          const namedSubdocSchemas = def.docs
            .filter(([docKey]) => !docKey.includes('#'))
            .map(([docKey, docDef]): typeof def.docs[0] => {
              const valueKey = docKey.replace(key, `${key}.${index}`);
              const docArrayKey = docKey.replace(key, `__docArray.${key}.${uuid}`);

              const value = getProperty(data, valueKey);
              setProperty(data, docArrayKey, value);

              return [docArrayKey, docDef];
            });
          addToY(y, namedSubdocSchemas, client, data);
        });
      }
    }

    if (schemaType === 'Float') {
      const float = new fieldUtils.shared.Float(y.ydoc);
      const validator = z.union([z.number().optional().nullable().array(), z.number().optional().nullable()]);
      const validValue = validator.parse(getProperty(data, key));

      if (Array.isArray(validValue) || options) {
        // if it is not an array, but there are options, stick
        // the value in an array since the SelectOne field
        // requires the value to be in an array
        float.set(key, Array.isArray(validValue) ? validValue : [validValue], options);
      } else {
        float.set(key, validValue);
      }
    }

    if (schemaType === 'JSON') {
      // Nothing should reach here
      // because JSON fields are converted
      // to the fields they actualy represent.
      // If a value reaches here, do nothing.
      // The UI will show it as uneditable JSON.
    }

    if (schemaType === 'Number') {
      const integer = new fieldUtils.shared.Integer(y.ydoc);
      const validator = z.union([z.number().optional().nullable().array(), z.number().optional().nullable()]);
      const validValue = validator.parse(getProperty(data, key));

      if (Array.isArray(validValue) || options) {
        // if it is not an array, but there are options, stick
        // the value in an array since the SelectOne field
        // requires the value to be in an array
        integer.set(key, Array.isArray(validValue) ? validValue : [validValue], options);
      } else {
        integer.set(key, validValue);
      }
    }

    if (schemaType === 'ObjectId') {
      const validator = z.union([
        z.string().optional().nullable().array().optional().nullable(),
        z.object({ _id: z.string(), name: z.string().optional() }).passthrough().array(),
      ]);
      const validValue = validator.parse(isArray ? getProperty(data, key) : [getProperty(data, key)]);

      const reference = new fieldUtils.shared.Reference(y.ydoc);

      reference.set(key, validValue, client, {
        ...def.field?.reference,
        collection: def.field?.reference?.collection || def.type[0].replace('[', '').replace(']', ''),
      });
    }

    if (schemaType === 'String') {
      const string = new fieldUtils.shared.String(y.ydoc);
      const validator = z.union([z.string().optional().nullable().array(), z.string().optional().nullable()]);
      const validValue = validator.parse(getProperty(data, key));

      if (Array.isArray(validValue) || options || reference) {
        // if it is not an array, but there are options (or a reference config), stick
        // the value in an array since the SelectOne and ReferenceOne fields
        // require the value to be in an array
        string.set(key, Array.isArray(validValue) ? validValue : [validValue], options);
      } else {
        string.set(key, validValue, !!def.field?.tiptap);
      }
    }
  });

  console.log(y.ydoc?.toJSON());
}

export { addToY };
