import { TableSymbol } from './tablesymbol';

export interface ColumnSymbol {
    table: TableSymbol;
    name: string;
    dataType: string;
    nullable: boolean;
    defaultValue: string;
    length: number;
    precision: string;
    pk: boolean;
    referencedTableName: string;
    referencedColumnName: string;
    getMappedDataType(kind: string): string;
    getMappedName(kind: string): string;
}
