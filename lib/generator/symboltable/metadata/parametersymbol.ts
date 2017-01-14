import { TypeSymbol } from './typesymbol';
import { InjectTypeSymbol } from './injecttypesymbol';

export interface ParameterSymbol {
    description: string;
    in: string;
    name: string;
    required: boolean;
    type: TypeSymbol;
    injected?: InjectTypeSymbol;
}
