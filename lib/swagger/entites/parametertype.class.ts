import { PropertyType } from './propertytype.class';

export type InType = '' | 'body' | 'query';

export class ParameterType extends PropertyType {
    in: InType = '';

    public static createFromParameter(data: any): ParameterType {
        // we have a .type node
        if (data == null || data.in === null || data.in === undefined) {
            console.log(data);
            throw 'createFromParameter: parameter has no "in" type';
        }
        if (data.name == null || data.name === undefined) {
            console.log(data);
            throw 'createFromParameter: parameter has no name';
        }
        let result: ParameterType = new ParameterType();
        result.name = data.name;
        result.in = data.in;
        if (data.required != null && data.required !== undefined) {
           result.isRequired = data.required;
        }
        if (result.in == 'body') {
            if (data.schema === null || data.schema === undefined) {
                throw 'createFromParameter: body type without schema';
            }
            if (data.schema.$ref !== null && data.schema.$ref !== undefined) {
                result = <ParameterType>PropertyType.createRefFromType(result, data.schema.$ref);
            } else {
                throw 'body parameters are only supported with schemas containing a $ref';
            }
        } else {
            result = <ParameterType>PropertyType.fillDataFromType(result, '', data);
        }
        return result;
    }

}
