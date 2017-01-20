import { GeneratorConfigAndroidORMLiteDal } from '../../persistance/generatorconfig.android.ormlite.dal';

import { TypeMapper } from '../symboltable/db/typemapper.class';

import { TableSymbol } from '../symboltable/db/tablesymbol';
import { ColumnSymbol } from '../symboltable/db/columnsymbol';

import { TableNameEnum } from './enums/tablename.enum'
import { ColumnNameEnum } from './enums/columname.enum'

import { SymbolNameMapper } from '../symbolnamemapper'

export class AndroidOrmliteDalTypeMapper extends TypeMapper {

    constructor(protected generatorConfig: GeneratorConfigAndroidORMLiteDal, dataTypeMapping: { [mappings: string]: { [dbtype: string]: string } }) {
        super(dataTypeMapping);
    }

    public columnDataTypeMapper(table: TableSymbol, column: ColumnSymbol, kind: string): string {
        // TODO -> custom mappings from this.generator.dataTypeMapping
        let type = column.dataType.toLowerCase();
        return this.dataTypeMapping[kind][type];
    }

    public /*override*/ tableNameMapper(table: TableSymbol, kind: string): string {
        let tableName: TableNameEnum = <TableNameEnum>kind;
        let map = table.name;

        switch (tableName) {
            case TableNameEnum.None:
                // nop
                break;
            case TableNameEnum.Java:
                if (this.generatorConfig.modelNaming.entityNaming.removeInvalidCharacters) {
                    map = SymbolNameMapper.titleCase(map);
                    map = SymbolNameMapper.removeWhitespace(map);
                    map = SymbolNameMapper.identifierfy(map);
                }

                if (this.generatorConfig.modelNaming.entityNaming.removeUnderscore) {
                    map = SymbolNameMapper.removeUnderscore(map);
                }
                map = SymbolNameMapper.pascal(map);
                break;
            default:
                console.log('error: can\'t map table name with type: ' + kind + ' maybe a typo in your template?');
                process.exit(-1);
                break;
        }

        return map;
    }

    public /*override*/ columnNameMapper(column: ColumnSymbol, kind: string): string {
        let columnNameEnum: ColumnNameEnum = <ColumnNameEnum>kind;
        let map = column.name;

        switch (columnNameEnum) {
            case ColumnNameEnum.None:
                // nop
                break;
            case ColumnNameEnum.Java:
                if (this.generatorConfig.modelNaming.propertyNaming.removeInvalidCharacters) {
                    map = SymbolNameMapper.titleCase(map);
                    map = SymbolNameMapper.removeWhitespace(map);
                    map = SymbolNameMapper.identifierfy(map);
                }

                if (this.generatorConfig.modelNaming.propertyNaming.removeUnderscore) {
                    map = SymbolNameMapper.removeUnderscore(map);
                }
                map = SymbolNameMapper.camel(map);
                break;
            default:
                console.log('error: can\'t map column name with type: ' + kind + ' maybe a typo in your template?');
                process.exit(-1);
                break;
        }

        return map;
    }
}

