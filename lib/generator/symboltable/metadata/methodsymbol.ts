import { ParameterSymbol } from './parametersymbol';
import { TypeSymbol } from './typesymbol';

export interface MethodSymbol {
    description: string;
    example: any;
    method: string;
    name: string;
    parameters: ParameterSymbol[];
    path: string;
    type: TypeSymbol;
    tags: string[];
    bodyParamName?: string;
    getPath(kind: string): string;
    needsBody(): boolean;
}
