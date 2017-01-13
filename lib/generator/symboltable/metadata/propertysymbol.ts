import { ReferenceTypeSymbol } from './referencetypesymbol';
import { PropertySymbol } from './propertysymbol';
import { TypeSymbol } from './typesymbol';

export interface PropertySymbol {
    reference: ReferenceTypeSymbol;
    description: string;
    name: string;
    length: number;
    type: TypeSymbol;
    required: boolean;
}
