const fs = require('fs');
const process = require('process');

import { GeneratorConfigBasic } from '../../persistance/generatorconfig.basic';
import { GeneratorConfigExpressTSRoutes } from '../../persistance/generatorconfig.express.ts.routes';
import { GeneratorConfigSequelizeTSDal } from '../../persistance/generatorconfig.sequelize.ts.dal';

import { BaseGenerator } from '../basegenerator';
import { RenderTemplate } from '../rendertemplate';

import { MetadataSymbolTable } from '../symboltable/metadata/metadatasymboltable';
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
        this.templateDir = __dirname + '/templates';
    }

    public getDefaultConfig(name: string): GeneratorConfigExpressTSRoutes {
        let type = "express.ts.routes";

        let result: GeneratorConfigExpressTSRoutes = {
            name: name,
            type: type,
            active: true,
            targetDir: './src',
            nicassaParserDBFile: <any>null,
            nicassaParserDBGeneratorName: <any>null,
        };

        return result;
    }

    protected async generateCode(): Promise<boolean> {
        this.metadataSymbolTable = MetadataSymbolTableReader.readFromJsonString(this.nicassaJson);
        this.setLengthToMetaData();

        let data = {
            controllers: this.metadataSymbolTable.controllers,
            referenceTypes: this.metadataSymbolTable.referenceTypes,
        };

        await RenderTemplate.renderTemplate(true, this, 'routes.ts.ejs', data);

        return await true;
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

        // .. to mapp with the settings
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

