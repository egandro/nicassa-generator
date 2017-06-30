import { TypeMapping } from '../type.mapping';

export type TypeNames = ''
    | 'int32'
    | 'int64'
    | 'string'
    | 'float'
    | 'double'
    | 'date'
    | 'boolean'
    | 'enum'
    | 'base64'
    | 'complex';

export type getMappedTypeHandler = (kind: string) => string;

export class PropertyType {
    get isComplexType(): boolean {
        return !this.isPrimitive;
    }
    isPrimitive: boolean = false;
    isReference: boolean = false;
    isRequired: boolean = false;
    isScalar: boolean = true;
    isMap: boolean = false;
    isArray: boolean = false;
    isEnum: boolean = false;
    type: TypeNames = '';
    name: string = '';
    enums: string[] = [];

    getMappedType: getMappedTypeHandler = (kind: string) => {
        let type = this.type.toLowerCase();
        if (TypeMapping.dataTypeMapping.hasOwnProperty(kind)) {
            if (TypeMapping.dataTypeMapping[kind].hasOwnProperty(type)) {
                return TypeMapping.dataTypeMapping[kind][type];
            }
        }
        return this.type;
    }

    // reference type - this needs to be resolved later
    $ref: string;

    public static createRefMap(ref: string, name?: string, isRequiredArr?: string[]): PropertyType {
        let result: PropertyType = new PropertyType();
        if (name != null) {
            result.name = name;
            if (isRequiredArr != null) {
                if (isRequiredArr.indexOf(name) > -1) {
                    result.isRequired = true;
                }
            }
        }
        result.$ref = ref;
        result.isMap = true;
        result.type = 'complex';
        result.isReference = true;
        return result;
    }

    public static createRef(ref: string, name?: string, isRequiredArr?: string[]): PropertyType {
        return PropertyType.createRefFromType(new PropertyType(), ref, name, isRequiredArr);
    }

    protected static createRefFromType(result: PropertyType, ref: string, name?: string, isRequiredArr?: string[]): PropertyType {
        if (name != null) {
            result.name = name;
            if (isRequiredArr != null) {
                if (isRequiredArr.indexOf(name) > -1) {
                    result.isRequired = true;
                }
            }
        }
        result.$ref = ref;
        result.type = 'complex';
        result.isReference = true;
        return result;
    }

    public static createStringMap(): PropertyType {
        let result: PropertyType = new PropertyType();
        result.type = 'string';
        result.isMap = true;
        return result;
    }

    public static createFromType(entityName: string, data: any, name?: string, isRequiredArr?: string[]): PropertyType {
        // we have a .type node
        if (data === null || data.type === null || data.type === undefined) {
            console.log(data, name);
            throw 'createFromType: type property not found';
        }
        return PropertyType.fillDataFromType(new PropertyType(), entityName, data, name, isRequiredArr);
    }

    protected static fillDataFromType(result: PropertyType, entityName: string, data: any, name?: string, isRequiredArr?: string[]): PropertyType {
        if (name != null) {
            result.name = name;
            if (isRequiredArr != null) {
                if (isRequiredArr.indexOf(name) > -1) {
                    result.isRequired = true;
                }
            }
        }
        switch (data.type) {
            case 'integer':
                result.type = 'int32';
                if (data.format != null && data.format != null) {
                    if (data.format == 'int32') {
                        result.type = 'int32';
                    } else if (data.format == 'int64') {
                        result.type = 'int64';
                    } else {
                    throw 'createFromType: unknwon format ' + data.format;
                    }
                }
                break;
            case 'number':
                result.type = 'double';
                if (data.format != null && data.format != null) {
                    if (data.format == 'float') {
                        result.type = 'float';
                    } else if (data.format == 'double') {
                        result.type = 'double';
                    } else {
                        throw 'createFromType: unknwon format ' + data.format;
                    }
                }
                break;
            case 'string':
                result.type = 'string';
                if (data.format != null && data.format != null) {
                    if (data.format == 'date') {
                        result.type = 'date';
                    } else if (data.format == 'date-time') {
                        result.type = 'date';
                    } else if (data.format == 'base64') {
                        result.type = 'base64';
                    } else {
                        throw 'createFromType: unknwon format ' + data.format;
                    }
                }
                if (data.enum != null && data.enum != null) {
                    result.type = 'enum';
                    result.isEnum = true;
                    for (let k = 0; k < data.enum.length; k++){
                        let enumData = data.enum[k];
                        result.enums.push(String(enumData));
                    }
                }
                break;
            case 'boolean':
                result.type = 'boolean';
                break;
            case 'array':
                if (data.items === null || data.items === undefined) {
                    throw 'createFromType: array type needs items';
                }
                if (data.items.$ref !== null && data.items.$ref !== undefined) {
                    result.$ref = data.items.$ref;
                    result.type = 'complex';
                    result.isScalar = false;
                    result.isArray = true;
                    result.isReference = true;
                } else if (data.items.type !== null && data.items.type !== undefined) {
                    // console.log('recursive call...');
                    result = PropertyType.createFromType(entityName, data.items);
                    result.isScalar = false;
                    result.isArray = true;
                    if (name != null) {
                        result.name = name;
                        if (isRequiredArr != null) {
                            if (isRequiredArr.indexOf(name) > -1) {
                                result.isRequired = true;
                            }
                        }
                    }
                } else {
                    throw 'createFromType: unsupported array type';
                }
                break;
            case 'object':
                console.log(`notice: type '${entityName}' property '${name}' has object type - treating as string`);
                result.type = 'string';
                break;
            default:
                throw 'createFromType: unknown data type ' + data.type;
        }
        // console.log(result);
        return result;
    }
}
