import { PropertySymbol } from './propertysymbol';
import { TypeSymbol } from './typesymbol';

export interface PropertySymbol {
    description: string;
    name: string;
    length: number;
    type: TypeSymbol;
    required: boolean;
}
