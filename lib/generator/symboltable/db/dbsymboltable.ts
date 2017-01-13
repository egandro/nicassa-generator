import { TableSymbol } from './tablesymbol';
import { ColumnSymbol } from './columnsymbol';
import { RelationshipSymbol } from './relationship';

export interface DBSymbolTable {
    tables: TableSymbol[];
    views: TableSymbol[];
    entities: TableSymbol[];
    columns: ColumnSymbol[];
    relations: RelationshipSymbol[];
}
