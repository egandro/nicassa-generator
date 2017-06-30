export class TypeMapping {
    public static dataTypeMapping: { [mappings: string]: { [dbtype: string]: string } } = {
        // we might need other types for required attributes
        // e.g. in java int <-> Integer
        "TypeScript": {
            int32: "number",
            int64: "number",
            string: "string",
            float: "number",
            double: "number",
            date: "Date",
            boolean: "boolean",
            enum: "string",
            base64: "Buffer"
        }
    }
}
