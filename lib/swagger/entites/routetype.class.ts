import { ParameterType, InType } from './parametertype.class';
import { ResponseType } from './responsetype.class';

export class RouteType {
    path: string;
    verb: string;
    operationId: string;
    parameter: ParameterType[] = [];
    response: ResponseType[] = [];

    getBodyParameter(): ParameterType | null {
        for (let parameter of this.parameter) {
            if (parameter.in == 'body') {
                return parameter;
            }
        }
        return null;
    }

    // attention - in angular some verbs has automaticually a body type
    hasParameterType(type: InType): boolean {
        for (let parameter of this.parameter) {
            if (parameter.in == type) {
                return true;
            }
        }
        return false;
    }
}
