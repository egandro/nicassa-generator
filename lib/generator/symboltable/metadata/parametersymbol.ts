import { ControllerSymbol } from './controllersymbol';
import { MethodSymbol } from './methodsymbol';
import { TypeSymbol } from './typesymbol';
import { InjectTypeSymbol } from './injecttypesymbol';

export interface ParameterSymbol {
    controller: ControllerSymbol;
    method: MethodSymbol
    description: string;
    in: string;
    name: string;
    required: boolean;
    type: TypeSymbol;
    injected?: InjectTypeSymbol;
}
