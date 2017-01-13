import { Filter, Schema, NicassaParserDB } from 'nicassa-parser-db';
import { DBSymbolTable } from './dbsymboltable';

import { TopLevel } from '../../../persistance/toplevel';

import { TableSymbol } from './tablesymbol';
import { ColumnSymbol } from './columnsymbol';
import { RelationshipSymbol } from './relationship';

import { TypeMapper } from './typemapper.class';

export class DBSymbolTableReader {
    public static readFromJsonString(json: string, filter: Filter, typeMapper: TypeMapper): DBSymbolTable {
        let schema: Schema = DBSymbolTableReader.readSchema(json);
        let result = DBSymbolTableReader.createSymbolTable(schema, filter, typeMapper);
        return result;
    }

    protected static readSchema(json: string): Schema {
        let toplevel: TopLevel = JSON.parse(json);
        let nicassaParserDB: NicassaParserDB = <NicassaParserDB>toplevel.nicassaParserDB;
        if (nicassaParserDB === undefined || nicassaParserDB.schema === undefined) {
            return <any>null;
        }

        return <Schema>nicassaParserDB.schema;
    }

    protected static createSymbolTable(schema: Schema, filter: Filter, typeMapper: TypeMapper): DBSymbolTable {
        let result: DBSymbolTable = {
            tables: [],
            views: [],
            entities: [],
            columns: [],
            relations: []
        }

        if (schema === undefined || schema === null) {
            return result;
        }

        if (filter === undefined || filter === null) {
            filter = {
                excludeTables: false,
                excludeViews: false,
                exculdeColumns: [],
                exculde: [],
                only: []
            }
        }

        let excludeTables: boolean = false;
        let excludeViews: boolean = false;
        let exculdeColumns = DBSymbolTableReader.createExculdeColumnsFromFilter(filter);
        let exculdes = DBSymbolTableReader.createExculdesFromFilter(filter);
        let only = DBSymbolTableReader.createOnlyItemsFromFilter(filter);

        if (filter !== undefined || filter !== null) {
            if (filter.excludeTables) {
                excludeTables = true;
            }
            if (filter.excludeViews) {
                excludeViews = true;
            }
        }

        let names: string[] = [];

        if (schema.tables !== undefined && !excludeTables) {
            for (let i = 0; i < schema.tables.length; i++) {
                let t = schema.tables[i];

                // excluded
                if (only.length == 0 && exculdes.indexOf(t.name) != -1) {
                    continue;
                }
                if (only.length > 0 && only.indexOf(t.name) == -1) {
                    continue;
                }

                names.push(t.name);
                let tableSymbol: TableSymbol = {
                    name: t.name,
                    columns: [],
                    isView: false,
                    hasPKs: false,
                    getMappedName: (kind: string) => {
                        return typeMapper.tableNameMapper(tableSymbol, kind);
                    }
                }
                result.tables.push(tableSymbol);
                result.entities.push(tableSymbol);

                if (t.columns === undefined || t.columns === null) {
                    continue;
                }

                for (let k = 0; k < t.columns.length; k++) {
                    let col = t.columns[k];

                    // excluded
                    if (exculdeColumns.indexOf(col.name) != -1) {
                        continue;
                    }
                    if (exculdeColumns.indexOf(t.name + '.' + col.name) != -1) {
                        continue;
                    }

                    let columnSymbol: ColumnSymbol = {
                        table: tableSymbol,
                        name: col.name,
                        dataType: col.dataType,
                        nullable: col.nullable,
                        defaultValue: col.defaultValue,
                        length: col.length,
                        precision: col.precision,
                        pk: col.pk,
                        referencedTableName: col.referencedTableName,
                        referencedColumnName: col.referencedColumnName,
                        getMappedDataType: (kind: string) => {
                            return typeMapper.columnDataTypeMapper(tableSymbol, columnSymbol, kind);
                        },
                        getMappedName: (kind: string) => {
                            return typeMapper.columnNameMapper(columnSymbol, kind);
                        }
                    }
                    // the table has at least one primary key
                    if (col.pk) {
                        tableSymbol.hasPKs = true;
                    }

                    result.columns.push(columnSymbol);
                    tableSymbol.columns.push(columnSymbol);
                }

            }
        }

        if (schema.views !== undefined && !excludeViews) {
            for (let i = 0; i < schema.views.length; i++) {
                let v = schema.views[i];

                // excluded
                if (only.length == 0 && exculdes.indexOf(v.name) != -1) {
                    continue;
                }
                if (only.length > 0 && only.indexOf(v.name) == -1) {
                    continue;
                }

                let tableSymbol: TableSymbol = {
                    name: v.name,
                    columns: [],
                    isView: true,
                    hasPKs: false,
                    getMappedName: (kind: string) => {
                        return typeMapper.tableNameMapper(tableSymbol, kind);
                    }
                }
                result.views.push(tableSymbol);
                result.entities.push(tableSymbol);

                if (v.columns === undefined || v.columns === null) {
                    continue;
                }

                for (let k = 0; k < v.columns.length; k++) {
                    let col = v.columns[k];

                    // excluded
                    if (exculdeColumns.indexOf(col.name) != -1) {
                        continue;
                    }
                    if (exculdeColumns.indexOf(v.name + '.' + col.name) != -1) {
                        continue;
                    }

                    let columnSymbol: ColumnSymbol = {
                        table: tableSymbol,
                        name: col.name,
                        dataType: col.dataType,
                        nullable: col.nullable,
                        defaultValue: col.defaultValue,
                        length: col.length,
                        precision: col.precision,
                        pk: col.pk,
                        referencedTableName: col.referencedTableName,
                        referencedColumnName: col.referencedColumnName,
                        getMappedDataType: (kind: string) => {
                            return typeMapper.columnDataTypeMapper(tableSymbol, columnSymbol, kind);
                        },
                        getMappedName: (kind: string) => {
                            return typeMapper.columnNameMapper(columnSymbol, kind);
                        }
                    }

                    result.columns.push(columnSymbol);
                    tableSymbol.columns.push(columnSymbol);
                }

            }
        }

        for (let i = 0; i < result.columns.length; i++) {
            let col = result.columns[i];
            if (col.referencedTableName === undefined || col.referencedTableName === null) {
                continue;
            }
            if (names.indexOf(col.referencedTableName) != -1) {
                continue;
            }
            // the referenced table has been filtered
            col.referencedTableName = <any>null;
            col.referencedColumnName = <any>null;
        }

        this.updateAssociations(result, schema);

        // sort tables & views - they are in random order anyway
        // note! we want to keep the columns in database order
        let nameSorter: Function = (a: any, b: any) => {
            var x = a['name'];
            var y = b['name'];
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        }
        result.tables.sort(<any>nameSorter);
        result.views.sort(<any>nameSorter);
        result.entities.sort(<any>nameSorter);

        return result;
    }

    protected static createExculdeColumnsFromFilter(filter: Filter): string[] {
        let columns: any = [];

        if (filter === undefined || filter === null || filter.exculdeColumns === undefined ||
            filter.exculdeColumns === null || filter.exculdeColumns.length < 0) {
            return columns;
        }
        columns = filter.exculdeColumns;
        return columns;
    }

    protected static createExculdesFromFilter(filter: Filter): string[] {
        let excludes: any = [];

        if (filter === undefined || filter === null || filter.exculde === undefined ||
            filter.exculde === null || filter.exculde.length < 0) {
            return excludes;
        }

        excludes = filter.exculde;
        return excludes;
    }

    protected static createOnlyItemsFromFilter(filter: Filter): string[] {
        let onlyItems: any = [];

        if (filter === undefined || filter === null || filter.only === undefined ||
            filter.only === null || filter.only.length < 0) {
            return onlyItems;
        }

        onlyItems = filter.only;
        return onlyItems;
    }


    protected static updateAssociations(symbolTable: DBSymbolTable, schema: Schema) {
        let tblColMap: { [key: string]: ColumnSymbol } = {};

        for (let i = 0; i < symbolTable.columns.length; i++) {
            let col = symbolTable.columns[i];
            let key = col.table.name + '.' + col.name;
            tblColMap[key] = col;
        }

        for (let i = 0; i < symbolTable.tables.length; i++) {
            let t = symbolTable.tables[i];

            for (let k = 0; k < t.columns.length; k++) {
                let col = t.columns[k];

                if (col.referencedTableName === undefined || col.referencedTableName === null) {
                    continue;
                }

                let key = col.referencedTableName + '.' + col.referencedColumnName;
                let refCol = tblColMap[key];

                if (refCol === undefined || refCol === null) {
                    let err = col.table.name + '.' + col.name + ' -> ' + key;
                    console.error('error: invalid relation found ' + err);
                    process.exit(-1);
                }

                // console.log('relation:' + col.table.name + '.' + col.name + ' -> ' + key);

                let r: RelationshipSymbol = {
                    table: t,
                    source: col,
                    destination: refCol
                }
                symbolTable.relations.push(r);
            }
        }
    }

}
