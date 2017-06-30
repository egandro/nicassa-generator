import { ParameterType } from './parametertype.class';
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
}
