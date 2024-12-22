import Ajv from "https://cdn.skypack.dev/ajv@8.13.0";
import addFormats from "https://cdn.skypack.dev/ajv-formats@2.1.1";

const loadSchema = async (filePath: string): Promise<object> => {
  const data = await Deno.readTextFile(filePath);
  return JSON.parse(data);
}

const loadSchemas = async (folderPath: string): Promise<Record<string, object>> => {
  const schemas: Record<string, object> = {};
  for await (const dirEntry of Deno.readDir(folderPath)) {
    if (dirEntry.isFile && dirEntry.name.endsWith(".json")) {
      const schemaPath = `${folderPath}/${dirEntry.name}`;;
      const schema = await loadSchema(schemaPath);
      schemas[dirEntry.name] = schema;
    }
  }
  return schemas;
}

export const loadAjvSchemas = async (path: string): Promise<typeof Ajv> => {
  const ajv = new Ajv({ allErrors: true });
  addFormats(ajv);

  const schemas = await loadSchemas(path);

  // Register schemas in AJV
  for (const [name, schema] of Object.entries(schemas)) {
    ajv.addSchema(schema, name);
  }

  return ajv;
}