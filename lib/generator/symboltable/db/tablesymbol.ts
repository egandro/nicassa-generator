import { ColumnSymbol } from './columnsymbol';

export interface TableSymbol {
    name: string;
    columns: ColumnSymbol[];
    isView: boolean;
    hasPKs: boolean;
    getMappedName(kind: string): string;
}
