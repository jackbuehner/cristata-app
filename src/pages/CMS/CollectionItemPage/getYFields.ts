import {
  isTypeTuple,
  MongooseSchemaType,
} from '@jackbuehner/cristata-api/dist/api/graphql/helpers/generators/genSchema';
import { get as getProperty, set as setProperty } from 'object-path';
import fieldUtils from '../../../components/CollaborativeFields/utils';
import { EntryY } from '../../../components/Tiptap/hooks/useY';
import {
  DeconstructedSchemaDefType,
  parseSchemaDefType,
} from '../../../hooks/useCollectionSchemaConfig/useCollectionSchemaConfig';

interface GetYFieldsOptions {
  retainReferenceObjects?: boolean;
  keepJsonParsed?: boolean;
}

async function getYFields(y: EntryY, _schemaDef: DeconstructedSchemaDefType, opts?: GetYFieldsOptions) {
  const schemaDef = JSON.parse(JSON.stringify(_schemaDef)) as DeconstructedSchemaDefType;
  const data: any = {};

  const JSONFields = schemaDef.filter(([key, def]) => def.type === 'JSON');

  await Promise.all(
    schemaDef.map(async ([key, def]) => {
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

        const boolean = new fieldUtils.shared.Boolean(y.ydoc);
        setProperty(data, key, boolean.get(key));
      }

      if (schemaType === 'Date') {
        // arrays of dates are not supported in the app
        if (isArray) return;

        const date = new fieldUtils.shared.Date(y.ydoc);
        setProperty(data, key, date.get(key));
      }

      if (schemaType === 'DocArray') {
        const array = new fieldUtils.shared.DocArray(y.ydoc);

        // get the value of the shared type as an array of objects
        let arrayValue: Record<string, unknown>[] = [];
        if (def.docs) {
          const namedSubdocSchemas = def.docs.filter(([docKey]) => !docKey.includes('#'));
          arrayValue = await array.get(key, { y, opts, schema: namedSubdocSchemas });
        } else {
          arrayValue = await array.get(key);
        }

        // remove the uuid
        arrayValue = arrayValue.map(({ __uuid, ...rest }) => rest);

        // insert the value of this field into the data object that
        // is returned by this function
        setProperty(data, key, arrayValue);
      }

      if (schemaType === 'Float') {
        const float = new fieldUtils.shared.Float(y.ydoc);
        if (isArray || options || reference) {
          const ids = float.get(key, true).map(({ value }) => value);
          setProperty(data, key, isArray ? ids : ids[0]);
        } else {
          setProperty(data, key, float.get(key, false));
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
        if (isArray || options || reference) {
          const ids = integer.get(key, true).map(({ value }) => value);
          setProperty(data, key, isArray ? ids : ids[0]);
        } else {
          setProperty(data, key, integer.get(key, false));
        }
      }

      if (schemaType === 'ObjectId') {
        const reference = new fieldUtils.shared.Reference(y.ydoc);
        const values = reference.get(key);
        if (opts?.retainReferenceObjects) {
          setProperty(data, key, isArray ? values : values[0]);
        } else {
          const ids = values.map(({ value }) => value);
          setProperty(data, key, isArray ? ids : ids[0]);
        }
      }

      if (schemaType === 'String') {
        const string = new fieldUtils.shared.String(y.ydoc);
        if (isArray || options || reference) {
          const ids = (await string.get(key, true, false, false)).map(({ value }) => value);
          setProperty(data, key, isArray ? ids : ids[0]);
        } else if (def.field?.markdown) {
          setProperty(data, key, await string.get(key, false, false, true));
        } else {
          setProperty(data, key, await string.get(key, false, !!def.field?.tiptap, false));
        }
      }
    })
  );

  await Promise.all(
    JSONFields.map(async ([key, def]) => {
      // find the set of fields that are meant for this specific document
      // by finding a matching name or name === 'default'
      const match =
        def.field?.custom?.find(({ name }) => name === data['name']) || // TODO: support any name field
        def.field?.custom?.find(({ name }) => name === 'default');

      // push the matching subfields onto the schemaDef variable
      // so that they can have a shared type created
      if (match) {
        const defs = parseSchemaDefType(match.fields, key);
        const values = await getYFields(y, defs, opts);
        defs.forEach(([key]) => {
          // set the data for each key
          setProperty(data, key, getProperty(values, key));
        });
      }

      // stringify the JSON field values
      if (!opts?.keepJsonParsed) setProperty(data, key, JSON.stringify(getProperty(data, key)));
    })
  );

  return data;
}

export { getYFields };
export type { GetYFieldsOptions };
