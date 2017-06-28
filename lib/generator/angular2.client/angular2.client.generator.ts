const fs = require('fs');
const process = require('process');

import { GeneratorConfigBasic } from '../../persistance/generatorconfig.basic';
import { GeneratorConfigExpressTSRoutes } from '../../persistance/generatorconfig.express.ts.routes';
import { GeneratorConfigSequelizeTSDal } from '../../persistance/generatorconfig.sequelize.ts.dal';
import { GeneratorConfigAngular2Client, Angular2ClientFilter } from '../../persistance/generatorconfig.angular2.client';

import { FileManger } from '../filemanager';
import { BaseGenerator } from '../basegenerator';
import { RenderTemplate } from '../rendertemplate';

import { MetadataSymbolTable } from '../symboltable/metadata/metadatasymboltable';
import { ControllerSymbol } from '../symboltable/metadata/controllersymbol';
import { ReferenceTypeSymbol } from '../symboltable/metadata/referencetypesymbol';
import { MetadataSymbolTableReader } from '../symboltable/metadata/metadatasymboltable.reader';

import { SymbolNameMapper } from '../symbolnamemapper';
import { DBSymbolTable } from '../symboltable/db/dbsymboltable';
import { DBSymbolTableReader } from '../symboltable/db/dbsymboltable.reader';
import { SequelizeTsDalTypeMapper } from '../sequelize.ts.dal/sequelize.ts.dal.typemapper.class';
import { SequelizeTypescriptMapping } from '../sequelize.ts.dal/sequelize.typescript.mapping';

export class Angular2ClientGenerator extends BaseGenerator {
    protected generatorConfig: GeneratorConfigAngular2Client;
    protected parentGeneratorConfig: GeneratorConfigExpressTSRoutes;
    protected metadataSymbolTable: MetadataSymbolTable;
    protected dbSymbolTable: DBSymbolTable;

    constructor(generatorConfigBasic: GeneratorConfigBasic, nicassaJson: string) {
        super(generatorConfigBasic, nicassaJson);
        this.generatorConfig = <GeneratorConfigAngular2Client>generatorConfigBasic;
        if (this.generatorConfig !== undefined && this.generatorConfig !== null) {
            if (this.generatorConfig.filter === undefined || this.generatorConfig.filter === null) {
                let defaultCfg = this.getDefaultConfig('');
                this.generatorConfig.filter = defaultCfg.filter;
            }
        }
        this.templateDir = __dirname + '/templates';
    }

    public getDefaultConfig(name: string): GeneratorConfigAngular2Client {
        let angular2ClientFilter: Angular2ClientFilter = {
            exculdeEntity: [],
            exculdeService: [],
            onlyEntity: [],
            onlyService: []
        }

        let type = "angular2.client";

        let result: GeneratorConfigAngular2Client = {
            name: name,
            type: type,
            active: true,
            customErrorHandler: false,
            targetDir: './angular2-client',
            parentServerGeneratorConfigName: 'express.ts.routes',
            cleanTargetDir: false,
            createProject: false,
            projectName: 'angular2-client',
            ngModuleName: 'Angular2Client',
            filter: angular2ClientFilter
        };

        return result;
    }

    protected async generateCode(): Promise<boolean> {
        this.parentGeneratorConfig = <any>BaseGenerator.getGeneratorByNameFromString
            (this.nicassaJson, this.generatorConfig.parentServerGeneratorConfigName);

        this.metadataSymbolTable = MetadataSymbolTableReader.readFromJsonString(this.nicassaJson);
        this.setLengthToMetaData();

        let createPackageJson: boolean = false;
        let createIndex: boolean = false;
        let createProject: boolean = this.generatorConfig.createProject;
        let createConfiguration: boolean = false;
        let createErrorReporter: boolean = false;
        let customErrorHandler: boolean = false;
        if (createProject) {
            createPackageJson = !FileManger.fileExistInProjectDir(this, 'package.json');
            createIndex = !FileManger.fileExistInProjectDir(this, 'index.ts');
            createConfiguration = !FileManger.fileExistInProjectDir(this, 'configuration.ts');
            createErrorReporter = !FileManger.fileExistInProjectDir(this, 'errorreporter.ts');
        }
        if (this.generatorConfig.customErrorHandler != null && this.generatorConfig.customErrorHandler !== undefined &&
            this.generatorConfig.customErrorHandler ==  true) {
            customErrorHandler = true;
        }
        let projectName = this.generatorConfig.projectName;
        if (projectName === undefined || projectName === null) {
            projectName = 'undefined';
        }
        projectName = SymbolNameMapper.titleCase(projectName);
        projectName = SymbolNameMapper.headerCase(projectName);
        projectName = SymbolNameMapper.lower(projectName);
        let ngModuleName = this.generatorConfig.ngModuleName;

        let controllers = this.applyControllerFilter(<any>this.generatorConfig.filter, this.metadataSymbolTable.controllers);
        let referenceTypes = this.applyReferenceTypeFilter(<any>this.generatorConfig.filter, this.metadataSymbolTable.referenceTypes);


        let data = {
            controllers: controllers,
            referenceTypes: referenceTypes,
            projectName: projectName,
            ngModuleName: ngModuleName,
            customErrorHandler: customErrorHandler
        };

        // idea from
        // https://offering.solutions/blog/articles/2016/02/01/consuming-a-rest-api-with-angular-http-service-in-typescript/

        await RenderTemplate.renderTemplate(true, this, 'entities.ts.ejs', data);
        await RenderTemplate.renderTemplate(true, this, 'services.ts.ejs', data);
        await RenderTemplate.renderTemplate(createPackageJson, this, 'package.json.ejs', data);
        await RenderTemplate.renderTemplate(createIndex, this, 'index.ts.ejs', data);
        await RenderTemplate.renderTemplate(createProject, this, 'generated.exports.ts.ejs', data);
        await RenderTemplate.renderTemplate(createConfiguration, this, 'configuration.ts.ejs', data);
        await RenderTemplate.renderTemplate(createErrorReporter, this, 'errorreporter.ts.ejs', data);
        await RenderTemplate.renderTemplate(true, this, 'ng.module.ts.ejs', data);

        return await true;
    }


    protected applyControllerFilter(filter: Angular2ClientFilter, controllers: ControllerSymbol[]): ControllerSymbol[] {
        if (filter === undefined || filter === null) {
            return controllers;
        }

        if (controllers === undefined || controllers === null || controllers.length === 0) {
            return controllers;
        }

        let exculdeController: string[] = <any>filter.exculdeService;
        let only: string[] = <any>filter.onlyService;

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

    protected applyReferenceTypeFilter(filter: Angular2ClientFilter, referenceTypes: ReferenceTypeSymbol[]): ReferenceTypeSymbol[] {
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
        if (this.parentGeneratorConfig.nicassaParserDBFile === undefined || this.parentGeneratorConfig.nicassaParserDBFile === null) {
            return;
        }

        if (!fs.existsSync(this.parentGeneratorConfig.nicassaParserDBFile)) {
            console.error('error: can\'t find nicassaParserDBFile: ' + this.parentGeneratorConfig.nicassaParserDBFile + '\'');
            process.exit(-1);
        }

        let json = null;
        try {
            json = fs.readFileSync(this.parentGeneratorConfig.nicassaParserDBFile);
        } catch (err) {
            console.error('error: can\'t read nicassaParserDBFile: ' + this.parentGeneratorConfig.nicassaParserDBFile + '\'');
            process.exit(-1);
        }

        if (this.parentGeneratorConfig.nicassaParserDBGeneratorName === undefined || this.parentGeneratorConfig.nicassaParserDBGeneratorName === null) {
            console.error('error: can\'t find nicassaParserDBGeneratorName for the nicassaParserDBFile: ' + this.parentGeneratorConfig.nicassaParserDBFile + '\'');
            process.exit(-1);
        }

        // we need the config...
        let gen: GeneratorConfigSequelizeTSDal = <any>BaseGenerator.getGeneratorByName
            (this.parentGeneratorConfig.nicassaParserDBFile, <any>this.parentGeneratorConfig.nicassaParserDBGeneratorName);

        if (gen === undefined || gen === null) {
            console.error('error: can\'t find generator with name ' +
                this.parentGeneratorConfig.nicassaParserDBGeneratorName + ' for the nicassaParserDBFile: ' + this.parentGeneratorConfig.nicassaParserDBFile + '\'');
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

