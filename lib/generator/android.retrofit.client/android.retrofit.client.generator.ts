const path = require('path');
const fs = require('fs');
const process = require('process');

import { GeneratorConfigBasic } from '../../persistance/generatorconfig.basic';
import { GeneratorConfigExpressTSRoutes } from '../../persistance/generatorconfig.express.ts.routes';
import { GeneratorConfigSequelizeTSDal } from '../../persistance/generatorconfig.sequelize.ts.dal';
import { GeneratorConfigAndroidRetrofitClient, AndroidRetrofitFilter } from '../../persistance/generatorconfig.android.retrofit.client';

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
import { AndroidRetrofitClientTypeMapper } from './android.retrofit.client.typemapper.class';
import { AndroidRetrofitJavaMapping } from './android.retrofit.java.mapping';

export class AndroidRetrofitClientGenerator extends BaseGenerator {
    protected generatorConfig: GeneratorConfigAndroidRetrofitClient;
    protected parentGeneratorConfig: GeneratorConfigExpressTSRoutes;
    protected metadataSymbolTable: MetadataSymbolTable;
    protected dbSymbolTable: DBSymbolTable;

    constructor(generatorConfigBasic: GeneratorConfigBasic, nicassaJson: string) {
        super(generatorConfigBasic, nicassaJson);
        this.generatorConfig = <GeneratorConfigAndroidRetrofitClient>generatorConfigBasic;
        if (this.generatorConfig !== undefined && this.generatorConfig !== null) {
            if (this.generatorConfig.filter === undefined || this.generatorConfig.filter === null) {
                let defaultCfg = this.getDefaultConfig('');
                this.generatorConfig.filter = defaultCfg.filter;
            }
        }
        this.templateDir = __dirname + '/templates';
    }

    public getDefaultConfig(name: string): GeneratorConfigAndroidRetrofitClient {
        let unirestTSClientFilter: AndroidRetrofitFilter = {
            exculdeDto: [],
            exculdeService: [],
            onlyDto: [],
            onlyService: []
        }

        let type = "android.retrofit.client";

        let result: GeneratorConfigAndroidRetrofitClient = {
            name: name,
            type: type,
            active: true,
            targetDir: './unirest-ts-client',
            parentServerGeneratorConfigName: 'express.ts.routes',
            cleanTargetDir: false,
            createProject: false,
            projectName: 'unirest-ts-client',
            namespace: 'com.example.android.retrofit.client',
            namespaceDto: 'com.example.android.retrofit.client.dto',
            filter: unirestTSClientFilter
        };

        return result;
    }

    protected async generateCode(): Promise<boolean> {
        this.parentGeneratorConfig = <any>BaseGenerator.getGeneratorByNameFromString
            (this.nicassaJson, this.generatorConfig.parentServerGeneratorConfigName);

        this.metadataSymbolTable = MetadataSymbolTableReader.readFromJsonString(this.nicassaJson);
        this.setLengthToMetaData();

        let createProject: boolean = this.generatorConfig.createProject;
        let createGitIgnore: boolean = false;
        let createBuildGradle: boolean = false;
        let createProguardRulesPro: boolean = false;
        let createAndroidManifestXml: boolean = false;
        let createStringsXml: boolean = false;
        let createConfiguration: boolean = false;
        let namespaceDtoDir: string = this.getTargetDir();
        let namespaceControllerDir: string = this.getTargetDir();

        if (createProject) {
            createGitIgnore = !FileManger.fileExistInProjectDir(this, '.gitignore');
            createBuildGradle = !FileManger.fileExistInProjectDir(this, 'build.gradle');
            createProguardRulesPro = !FileManger.fileExistInProjectDir(this, 'proguard-rules.pro');
            createAndroidManifestXml = !FileManger.fileExistInDir(path.join(this.getTargetDir(), 'src/main'), 'AndroidManifest.xml');
            FileManger.createDirIfNeeded(path.join(this.getTargetDir(), 'src/main'));
            createStringsXml = !FileManger.fileExistInDir(path.join(this.getTargetDir(), 'src/main/res/values'), 'strings.xml');
            FileManger.createDirIfNeeded(path.join(this.getTargetDir(), 'src/main/res/values'));

            if (this.generatorConfig.namespaceDto !== undefined || this.generatorConfig.namespaceDto !== null) {
                namespaceDtoDir = SymbolNameMapper.pathCase(this.generatorConfig.namespaceDto);
                namespaceDtoDir = path.join(this.getTargetDir(), path.join('src/main/java', namespaceDtoDir));
                FileManger.createDirIfNeeded(namespaceDtoDir);
            }

            if (this.generatorConfig.namespace !== undefined || this.generatorConfig.namespace !== null) {
                namespaceControllerDir = SymbolNameMapper.pathCase(this.generatorConfig.namespace);
                namespaceControllerDir = path.join(this.getTargetDir(), path.join('src/main/java', namespaceControllerDir));
                FileManger.createDirIfNeeded(namespaceControllerDir);
            }
            createConfiguration = !FileManger.fileExistInDir(namespaceControllerDir, 'Configuration.java');
        }
        let projectName = this.generatorConfig.projectName;
        if (projectName === undefined || projectName === null) {
            projectName = 'undefined';
        }

        let controllers = this.applyControllerFilter(<any>this.generatorConfig.filter, this.metadataSymbolTable.controllers);
        let referenceTypes = this.applyReferenceTypeFilter(<any>this.generatorConfig.filter, this.metadataSymbolTable.referenceTypes);

        let data = {
            controllers: controllers,
            referenceTypes: referenceTypes,
            namespace: this.generatorConfig.namespace,
            namespaceDto: this.generatorConfig.namespaceDto,
            projectName: projectName
        };

        await RenderTemplate.renderTemplate(createGitIgnore, this, 'gitignore.ejs', data, '.gitignore');
        await RenderTemplate.renderTemplate(createBuildGradle, this, 'build.gradle.ejs', data);
        await RenderTemplate.renderTemplate(createBuildGradle, this, 'proguard-rules.pro.ejs', data);
        await RenderTemplate.renderTemplateToDir(path.join(this.getTargetDir(), 'src/main'), createAndroidManifestXml, this, 'AndroidManifest.xml.ejs', data);
        await RenderTemplate.renderTemplateToDir(path.join(this.getTargetDir(), 'src/main/res/values'), createStringsXml, this, 'strings.xml.ejs', data);
        await RenderTemplate.renderTemplateToDir(namespaceControllerDir, createConfiguration, this, 'configuration.java.ejs', data, 'Configuration.java');

        for (let i = 0; i < referenceTypes.length; i++) {
            let dto = referenceTypes[i];
            let dtoData = data;
            (<any>dtoData).dto = dto;
            let dtoJava = dto.getMappedName('Java') + ".java";
            await RenderTemplate.renderTemplateToDir(namespaceDtoDir, true, this, 'dto.java.ejs', dtoData, dtoJava);
        }

        for (let i = 0; i < controllers.length; i++) {
            let controller = controllers[i];
            let controllerData = data;
            (<any>controllerData).controller = controller;
            let controllerJava = controller.name + ".java";
            await RenderTemplate.renderTemplateToDir(namespaceControllerDir, true, this, 'controller.java.ejs', controllerData, controllerJava);
        }

        return await true;
    }


    protected applyControllerFilter(filter: AndroidRetrofitFilter, controllers: ControllerSymbol[]): ControllerSymbol[] {
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

    protected applyReferenceTypeFilter(filter: AndroidRetrofitFilter, referenceTypes: ReferenceTypeSymbol[]): ReferenceTypeSymbol[] {
        if (referenceTypes === undefined || referenceTypes === null || referenceTypes.length === 0) {
            return referenceTypes;
        }

        let exculdeDto: string[] = <any>filter.exculdeDto;
        let only: string[] = <any>filter.onlyDto;

        if (exculdeDto === undefined || exculdeDto === null) {
            exculdeDto = [];
        }
        if (only === undefined || only === null) {
            only = [];
        }

        let result: ReferenceTypeSymbol[] = [];
        for (let k = 0; k < referenceTypes.length; k++) {
            let entity = referenceTypes[k];
            // excluded
            if (only.length == 0 && exculdeDto.indexOf(entity.name) != -1) {
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
        let dataTypeMapping = AndroidRetrofitJavaMapping.dataTypeMapping;
        let typeMapper: AndroidRetrofitClientTypeMapper = new AndroidRetrofitClientTypeMapper(this.generatorConfig, dataTypeMapping);

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
            entityColumnMap[entity.getMappedName('Java')] = {};
            for (let k = 0; k < entity.columns.length; k++) {
                let column = entity.columns[k];
                if (column.length === undefined || column.length === null || column.length < 0) {
                    continue;
                }
                entityColumnMap[entity.getMappedName('Java')][column.getMappedName('Java')] = column.length;
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

