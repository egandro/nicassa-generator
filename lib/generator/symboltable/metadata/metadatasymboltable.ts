import { ControllerSymbol } from './controllersymbol';
import { ReferenceTypeSymbol } from './referencetypesymbol';

export interface MetadataSymbolTable {
    controllers: ControllerSymbol[];
    referenceTypes: ReferenceTypeSymbol[];
}
