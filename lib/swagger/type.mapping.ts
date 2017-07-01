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
        },
        "JavaRequired": {
            int32: "int",
            int64: "long",
            string: "String",
            float: "float",
            double: "double",
            date: "java.util.Date",
            boolean: "boolean",
            enum: "String",
            base64: "byte[]"
        },
        "JavaNotRequired": {
            int32: "Integer",
            int64: "Long",
            string: "String",
            float: "Float",
            double: "Double",
            date: "java.util.Date",
            boolean: "Boolean",
            enum: "String",
            base64: "byte[]"
        }
    }
}
