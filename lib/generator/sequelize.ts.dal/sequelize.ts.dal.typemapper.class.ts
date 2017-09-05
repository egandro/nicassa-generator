import { GeneratorConfigSequelizeTSDal, CustomJSDocDecorator } from '../../persistance/generatorconfig.sequelize.ts.dal';

import { TypeMapper } from '../symboltable/db/typemapper.class';

import { TableSymbol } from '../symboltable/db/tablesymbol';
import { ColumnSymbol } from '../symboltable/db/columnsymbol';

import { TableNameEnum } from './enums/tablename.enum'
import { ColumnNameEnum } from './enums/columname.enum'

import { SymbolNameMapper } from '../symbolnamemapper'

export class SequelizeTsDalTypeMapper extends TypeMapper {
    private customDecoratorsMap: { [key: string]: CustomJSDocDecorator } = <any>null;

    constructor(protected generatorConfig: GeneratorConfigSequelizeTSDal, dataTypeMapping: { [mappings: string]: { [dbtype: string]: string } }) {
        super(dataTypeMapping);
    }

    private parseCustomDJSDocDecorators(data: CustomJSDocDecorator[]) {
        this.customDecoratorsMap = {};
        for (let item of data) {
            const key = item.entity.toLowerCase();
            this.customDecoratorsMap[key] = item;
        }
    }

    public columnDataTypeMapper(table: TableSymbol, column: ColumnSymbol, kind: string): any {
        // TODO -> custom mappings from this.generator.dataTypeMapping
        let type = column.dataType.toLowerCase();
        let result: any = this.dataTypeMapping[kind][type];

        if (kind == 'TypeScriptDecorator') {
            result = [];
            if (!this.generatorConfig.createJSDocDecorators) {
                // jsDoc decorators must be enabled to create them
                return result;
            }

            let type = result;
            let hasType = false;
            if (type && type.length > 0) {
                hasType = true;
                result.push('@is' + type);
            }

            let hasMaxLength = false;
            if (column.length !== null && column.length !== undefined) {
                hasMaxLength = true;
                result.push('@maxLength ' + column.length);
            }

            if (this.generatorConfig.customDJSDocDecorators && this.customDecoratorsMap == null) {
                // create dictionary if needed
                this.parseCustomDJSDocDecorators(this.generatorConfig.customDJSDocDecorators);
            }

            const key = table.name.toLowerCase() + '.' + column.name.toLowerCase();
            if (this.customDecoratorsMap.hasOwnProperty(key)) {
                const item = this.customDecoratorsMap[key];
                if (item.enabled !== null && item.enabled !== undefined && item.enabled == false) {
                    return []; // disabled from user
                }

                if (item.decorator !== null && item.decorator !== undefined) {
                    // allow overwrite
                    if (hasType) {
                        for (const decorator of item.decorator) {
                            if (decorator.startsWith('@is')) {
                                for (const oldType of result) {
                                    if (oldType.startsWith('@is')) {
                                        result.splice(result.indexOf(oldType), 1);
                                        break;
                                    }
                                }
                                break;
                            }
                        }
                    }
                    if (hasMaxLength) {
                        for (const decorator of item.decorator) {
                            if (decorator.startsWith('@maxLength')) {
                                for (const oldType of result) {
                                    if (oldType.startsWith('@maxLength')) {
                                        result.splice(result.indexOf(oldType), 1);
                                        break;
                                    }
                                }
                                break;
                            }
                        }
                    }
                    for (const decorator of item.decorator) {
                        result.push(decorator);
                    }
                }
            }

        }

        return result;
    }


    public /*override*/ tableNameMapper(table: TableSymbol, kind: string): string {
        let tableName: TableNameEnum = <TableNameEnum>kind;
        let map = table.name;

        switch (tableName) {
            case TableNameEnum.None:
                // nop
                break;
            case TableNameEnum.TypeScriptInstance:
                map = this.tableNameMapper(table, TableNameEnum.TypeScript);
                map += 'Instance';
                break;
            case TableNameEnum.TypeScriptModel:
                map = this.tableNameMapper(table, TableNameEnum.TypeScript);
                map += 'Model';
                break;
            case TableNameEnum.TypeScript:
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
            case ColumnNameEnum.TypeScript:
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

