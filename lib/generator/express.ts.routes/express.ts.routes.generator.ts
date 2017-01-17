const fs = require('fs');
const process = require('process');

import { GeneratorConfigBasic } from '../../persistance/generatorconfig.basic';
import { GeneratorConfigExpressTSRoutes, ExpressTSRoutesFilter} from '../../persistance/generatorconfig.express.ts.routes';
import { GeneratorConfigSequelizeTSDal } from '../../persistance/generatorconfig.sequelize.ts.dal';

import { BaseGenerator } from '../basegenerator';
import { RenderTemplate } from '../rendertemplate';

import { MetadataSymbolTable } from '../symboltable/metadata/metadatasymboltable';
import { ControllerSymbol } from '../symboltable/metadata/controllersymbol';
import { ReferenceTypeSymbol } from '../symboltable/metadata/referencetypesymbol';
import { MetadataSymbolTableReader } from '../symboltable/metadata/metadatasymboltable.reader';

import { DBSymbolTable } from '../symboltable/db/dbsymboltable';
import { DBSymbolTableReader } from '../symboltable/db/dbsymboltable.reader';
import { SequelizeTsDalTypeMapper } from '../sequelize.ts.dal/sequelize.ts.dal.typemapper.class';
import { SequelizeTypescriptMapping } from '../sequelize.ts.dal/sequelize.typescript.mapping';

export class ExpressTSRoutesGenerator extends BaseGenerator {
    protected generatorConfig: GeneratorConfigExpressTSRoutes;
    protected metadataSymbolTable: MetadataSymbolTable;
    protected dbSymbolTable: DBSymbolTable;

    constructor(generatorConfigBasic: GeneratorConfigBasic, nicassaJson: string) {
        super(generatorConfigBasic, nicassaJson);
        this.generatorConfig = <GeneratorConfigExpressTSRoutes>generatorConfigBasic;
        if (this.generatorConfig !== undefined && this.generatorConfig !== null) {
            if (this.generatorConfig.filter === undefined || this.generatorConfig.filter === null) {
                let defaultCfg = this.getDefaultConfig('');
                this.generatorConfig.filter = defaultCfg.filter;
            }
        }
        this.templateDir = __dirname + '/templates';
    }

    public getDefaultConfig(name: string): GeneratorConfigExpressTSRoutes {
        let expressTSRoutesFilter: ExpressTSRoutesFilter = {
            exculdeEntity: [],
            exculdeController: [],
            onlyEntity: [],
            onlyController: []
        }

        let type = "express.ts.routes";

        let result: GeneratorConfigExpressTSRoutes = {
            name: name,
            type: type,
            active: true,
            targetDir: './src',
            nicassaParserDBFile: <any>null,
            nicassaParserDBGeneratorName: <any>null,
            filter: expressTSRoutesFilter
        };

        return result;
    }

    protected async generateCode(): Promise<boolean> {
        this.metadataSymbolTable = MetadataSymbolTableReader.readFromJsonString(this.nicassaJson);
        this.setLengthToMetaData();

        let controllers = this.applyControllerFilter(<any>this.generatorConfig.filter, this.metadataSymbolTable.controllers);
        let referenceTypes = this.applyReferenceTypeFilter(<any>this.generatorConfig.filter, this.metadataSymbolTable.referenceTypes);

        let data = {
            controllers: controllers,
            referenceTypes: referenceTypes,
        };

        await RenderTemplate.renderTemplate(true, this, 'routes.ts.ejs', data);

        return await true;
    }

    protected applyControllerFilter(filter: ExpressTSRoutesFilter, controllers: ControllerSymbol[]): ControllerSymbol[] {
        if (filter === undefined || filter === null) {
            return controllers;
        }

        if (controllers === undefined || controllers === null || controllers.length === 0) {
            return controllers;
        }

        let exculdeController: string[] = <any>filter.exculdeController;
        let only: string[] = <any>filter.onlyController;

        if (exculdeController === undefined || exculdeController === null) {
            exculdeController = [];
        }
        if (only === undefined || only === null) {
            only = [];
        }

        let result: ControllerSymbol[] = [];
        for (let k = 0; k < controllers.length; k++) {
            let ctrl = controllers[k];
            // excluded
            if (only.length == 0 && exculdeController.indexOf(ctrl.name) != -1) {
                continue;
            }
            if (only.length > 0 && only.indexOf(ctrl.name) == -1) {
                continue;
            }
            result.push(ctrl);
        }

        return result;
    }

    protected applyReferenceTypeFilter(filter: ExpressTSRoutesFilter, referenceTypes: ReferenceTypeSymbol[]): ReferenceTypeSymbol[] {
        if (referenceTypes === undefined || referenceTypes === null || referenceTypes.length === 0) {
            return referenceTypes;
        }

        let exculdeEntity: string[] = <any>filter.exculdeEntity;
        let only: string[] = <any>filter.onlyEntity;

        if (exculdeEntity === undefined || exculdeEntity === null) {
            exculdeEntity = [];
        }
        if (only === undefined || only === null) {
            only = [];
        }

        let result: ReferenceTypeSymbol[] = [];
        for (let k = 0; k < referenceTypes.length; k++) {
            let entity = referenceTypes[k];
            // excluded
            if (only.length == 0 && exculdeEntity.indexOf(entity.name) != -1) {
                continue;
            }
            if (only.length > 0 && only.indexOf(entity.name) == -1) {
                continue;
            }
            result.push(entity);
        }

        return result;
    }

    protected setLengthToMetaData() {
        if (this.generatorConfig.nicassaParserDBFile === undefined || this.generatorConfig.nicassaParserDBFile === null) {
            return;
        }

        if (!fs.existsSync(this.generatorConfig.nicassaParserDBFile)) {
            console.error('error: can\'t find nicassaParserDBFile: ' + this.generatorConfig.nicassaParserDBFile + '\'');
            process.exit(-1);
        }

        let json = null;
        try {
            json = fs.readFileSync(this.generatorConfig.nicassaParserDBFile);
        } catch (err) {
            console.error('error: can\'t read nicassaParserDBFile: ' + this.generatorConfig.nicassaParserDBFile + '\'');
            process.exit(-1);
        }

        if (this.generatorConfig.nicassaParserDBGeneratorName === undefined || this.generatorConfig.nicassaParserDBGeneratorName === null) {
            console.error('error: can\'t find nicassaParserDBGeneratorName for the nicassaParserDBFile: ' + this.generatorConfig.nicassaParserDBFile + '\'');
            process.exit(-1);
        }

        // we need the config...
        let gen: GeneratorConfigSequelizeTSDal = <any>BaseGenerator.getGeneratorByName
            (this.generatorConfig.nicassaParserDBFile, <any>this.generatorConfig.nicassaParserDBGeneratorName);

        if (gen === undefined || gen === null) {
            console.error('error: can\'t find generator with name ' +
                this.generatorConfig.nicassaParserDBGeneratorName + ' for the nicassaParserDBFile: ' + this.generatorConfig.nicassaParserDBFile + '\'');
            process.exit(-1);
        }

        // .. to map with the settings
        let dataTypeMapping = SequelizeTypescriptMapping.dataTypeMapping;
        let typeMapper: SequelizeTsDalTypeMapper = new SequelizeTsDalTypeMapper(gen, dataTypeMapping);

        this.dbSymbolTable = DBSymbolTableReader.readFromJsonString(json, <any>gen.filter, typeMapper);
        this.updateMetaSymbolTableLengthFromDbSymbolTable(this.metadataSymbolTable, this.dbSymbolTable);
    }

    protected updateMetaSymbolTableLengthFromDbSymbolTable(meta: MetadataSymbolTable, db: DBSymbolTable) {
        if (db.entities === undefined || db.entities === null || db.entities.length === 0) {
            return;
        }

        if (meta.referenceTypes === undefined || meta.referenceTypes === null || meta.referenceTypes.length === 0) {
            return;
        }

        // create the map
        let entityColumnMap: any = {};
        for (let i = 0; i < db.entities.length; i++) {
            let entity = db.entities[i];
            entityColumnMap[entity.getMappedName('TypeScript')] = {};
            for (let k = 0; k < entity.columns.length; k++) {
                let column = entity.columns[k];
                if (column.length === undefined || column.length === null || column.length < 0) {
                    continue;
                }
                entityColumnMap[entity.getMappedName('TypeScript')][column.getMappedName('TypeScript')] = column.length;
            }
        }

        for (let i = 0; i < meta.referenceTypes.length; i++) {
            let ref = meta.referenceTypes[i];
            if (!entityColumnMap.hasOwnProperty(ref.name)) {
                continue;
            }
            for (let k = 0; k < ref.properties.length; k++) {
                let prop = ref.properties[k];
                if (!entityColumnMap[ref.name].hasOwnProperty(prop.name)) {
                    continue;
                }
                prop.length = entityColumnMap[ref.name][prop.name];
            }
        }
    }
}

