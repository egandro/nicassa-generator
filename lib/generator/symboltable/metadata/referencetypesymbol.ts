import { TypeSymbol } from './typesymbol';
import { PropertySymbol } from './propertysymbol';

export interface ReferenceTypeSymbol extends TypeSymbol {
    description: string;
    name: string;
    properties: PropertySymbol[];
}
