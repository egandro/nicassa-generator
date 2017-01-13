import { TableSymbol } from '../../symboltable/db/tablesymbol';
import { ColumnSymbol } from '../../symboltable/db/columnsymbol';

export class TypeMapper {

    constructor(protected dataTypeMapping: { [mappings: string]: { [dbtype: string]: string } }) {

    }

    public columnDataTypeMapper(table: TableSymbol, column: ColumnSymbol, kind: string): string {
        // TODO -> custom mappings from this.generator.dataTypeMapping
        let type = column.dataType.toLowerCase();
        return this.dataTypeMapping[kind][type];
    }

    public /*virtual*/ tableNameMapper(table: TableSymbol, kind: string): string {
        return table.name;
    }

    public /*virtual*/ columnNameMapper(column: ColumnSymbol, kind: string): string {
        return column.name;
    }
}

