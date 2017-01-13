import { TypeSymbol } from './typesymbol';

export interface ArrayTypeSymbol extends TypeSymbol {
    elementType: TypeSymbol;
}
