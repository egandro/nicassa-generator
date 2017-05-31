export class AndroidRetrofitJavaMapping {
    public static dataTypeMapping: { [mappings: string]: { [dbtype: string]: string } } = {
        "Java": {
            number: "Integer",
            boolean: "Boolean",
            string: "String"
        }
    }
}
