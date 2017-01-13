import { ControllerSymbol } from './controllersymbol';
import { ParameterSymbol } from './parametersymbol';
import { MethodSymbol } from './methodsymbol';

export interface TypeSymbol {
    controller?: ControllerSymbol;
    method?: MethodSymbol;
    parameter?: ParameterSymbol;
    isPrimitive: boolean;
    isArray: boolean;
    isReferenceType: boolean;
}
