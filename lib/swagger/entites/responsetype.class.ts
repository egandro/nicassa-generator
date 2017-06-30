import { PropertyType } from './propertytype.class';

export class ResponseType extends PropertyType {
    statusCode: string = "200";
    isVoid: boolean = false;

    public static createFromResponse(data: any): ResponseType {
        let result: ResponseType = new ResponseType();
        if (data.schema === null || data.schema === undefined) {
            console.log(`notice: response type has no schema - treating as void`);
            result.type = <any>'void';
            result.isVoid = true;
        } else if (data.schema.$ref !== null && data.schema.$ref !== undefined) {
            result = <ResponseType>PropertyType.createRefFromType(result, data.schema.$ref);
        } else {
            result = <ResponseType>PropertyType.fillDataFromType(result, '', data.schema);
        }
        return result;
    }
}
