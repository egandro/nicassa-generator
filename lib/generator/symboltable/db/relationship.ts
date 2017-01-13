import { TableSymbol } from './tablesymbol';
import { ColumnSymbol } from './columnsymbol';

export interface RelationshipSymbol {
    table: TableSymbol;
    source: ColumnSymbol;
    destination: ColumnSymbol;
}
