import { ControllerSymbol } from './controllersymbol';
import { ParameterSymbol } from './parametersymbol';
import { TypeSymbol } from './typesymbol';

export interface MethodSymbol {
    controller: ControllerSymbol;
    description: string;
    example: any;
    method: string;
    name: string;
    parameters: ParameterSymbol[];
    path: string;
    type: TypeSymbol;
    tags: string[];
    bodyParamName?: string;
    getPath(): string;
}
