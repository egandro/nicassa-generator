const path = require('path');
import { Filter } from 'nicassa-parser-db';

import { GeneratorConfigBasic } from '../../persistance/generatorconfig.basic';
import { GeneratorConfigAndroidORMLiteDal } from '../../persistance/generatorconfig.android.ormlite.dal';

import { ModelNaming } from '../../persistance/naming/modelnaming';
import { CaseEnum } from '../../persistance/naming/case.enum';
import { PropertyNaming } from '../../persistance/naming/propertynaming';
import { EntityNaming } from '../../persistance/naming/entitynaming';

import { AndroidOrmLiteJavaMapping } from './android.ormlite.java.mapping';

import { FileManger } from '../filemanager';
import { BaseGenerator } from '../basegenerator';
import { RenderTemplate } from '../rendertemplate';

import { SymbolNameMapper } from '../symbolnamemapper';
import { DBSymbolTable } from '../symboltable/db/dbsymboltable';
import { DBSymbolTableReader } from '../symboltable/db/dbsymboltable.reader';
import { AndroidOrmliteDalTypeMapper } from './android.ormlite.dal.typemapper.class';


export class AndroidORMLiteDalGenerator extends BaseGenerator {
    protected dbSymbolTable: DBSymbolTable;
    protected generatorConfig: GeneratorConfigAndroidORMLiteDal;
    protected typeMapper: AndroidOrmliteDalTypeMapper;

    constructor(generatorConfigBasic: GeneratorConfigBasic, nicassaJson: string) {
        super(generatorConfigBasic, nicassaJson);
        this.generatorConfig = <GeneratorConfigAndroidORMLiteDal>generatorConfigBasic;
        if (this.generatorConfig !== undefined && this.generatorConfig !== null) {
            if (this.generatorConfig.filter === undefined || this.generatorConfig.filter === null) {
                let defaultCfg = this.getDefaultConfig('');
                this.generatorConfig.filter = defaultCfg.filter;
            }
        }
        this.dataTypeMapping = AndroidOrmLiteJavaMapping.dataTypeMapping;
        this.templateDir = __dirname + '/templates';
        this.typeMapper = new AndroidOrmliteDalTypeMapper(this.generatorConfig, this.dataTypeMapping);
    }

    public getDefaultConfig(name: string): GeneratorConfigAndroidORMLiteDal {
        let filter: Filter = {
            excludeTables: false,
            excludeViews: false,
            exculdeColumns: [],
            exculde: [],
            only: []
        }

        let entityNaming: EntityNaming = {
            caseType: CaseEnum.PascalCase,
            filenameCaseType: CaseEnum.Lower,
            instanceCaseType: CaseEnum.CamelCase,
            removeUnderscore: true,
            removeInvalidCharacters: true,
        }

        let propertyNaming: PropertyNaming = {
            caseType: CaseEnum.CamelCase,
            removeUnderscore: true,
            removeInvalidCharacters: true,
            plurarlizeCollectionNavigationProperties: true
        }

        let modelNaming: ModelNaming = {
            entityNaming: entityNaming,
            propertyNaming: propertyNaming
        }

        let type = "android.ormlite.dal";

        let result: GeneratorConfigAndroidORMLiteDal = {
            name: name,
            type: type,
            active: true,
            targetDir: './' + name,
            cleanTargetDir: true,
            createProject: true,
            projectName: <any>null,
            namespace: 'com.example.android.ormlite.dal',
            namespaceEntity: 'com.example.android.ormlite.dal.entity',
            modelNaming: modelNaming,
            dataTypeMapping: {},
            filter: filter
        };

        return result;
    }

    protected async generateCode(): Promise<boolean> {
        this.dbSymbolTable = DBSymbolTableReader.readFromJsonString(this.nicassaJson, <any>this.generatorConfig.filter, this.typeMapper);

        let createProject: boolean = this.generatorConfig.createProject;
        let createGitIgnore: boolean = false;
        let createBuildGradle: boolean = false;
        let createProguardRulesPro: boolean = false;
        let createAndroidManifestXml: boolean = false;
        let createStringsXml: boolean = false;
        let namespaceEntityDir: string = this.getTargetDir();

        if (createProject) {
            createGitIgnore = !FileManger.fileExistInProjectDir(this, '.gitignore');
            createBuildGradle = !FileManger.fileExistInProjectDir(this, 'build.gradle');
            createProguardRulesPro = !FileManger.fileExistInProjectDir(this, 'proguard-rules.pro');
            createAndroidManifestXml = !FileManger.fileExistInDir(path.join(this.getTargetDir(), 'src/main'), 'AndroidManifest.xml');
            FileManger.createDirIfNeeded(path.join(this.getTargetDir(), 'src/main'));
            createStringsXml = !FileManger.fileExistInDir(path.join(this.getTargetDir(), 'src/main/res/values'), 'strings.xml');
            FileManger.createDirIfNeeded(path.join(this.getTargetDir(), 'src/main/res/values'));

            if (this.generatorConfig.namespaceEntity !== undefined || this.generatorConfig.namespaceEntity !== null) {
                namespaceEntityDir = SymbolNameMapper.pathCase(this.generatorConfig.namespaceEntity);
                namespaceEntityDir = path.join(this.getTargetDir(), path.join('src/main/java', namespaceEntityDir));
                FileManger.createDirIfNeeded(namespaceEntityDir);
            }
        }
        let projectName = this.generatorConfig.projectName;
        if (projectName === undefined || projectName === null) {
            projectName = 'undefined';
        }

        let data = {
            tables: this.dbSymbolTable.tables,
            views: this.dbSymbolTable.views,
            columns: this.dbSymbolTable.columns,
            entities: this.dbSymbolTable.entities,
            relations: this.dbSymbolTable.relations,
            namespace: this.generatorConfig.namespace,
            namespaceEntity: this.generatorConfig.namespaceEntity,
            projectName: projectName
        };

        await RenderTemplate.renderTemplate(createGitIgnore, this, 'gitignore.ejs', data, '.gitignore');
        await RenderTemplate.renderTemplate(createBuildGradle, this, 'build.gradle.ejs', data);
        await RenderTemplate.renderTemplate(createBuildGradle, this, 'proguard-rules.pro.ejs', data);
        await RenderTemplate.renderTemplateToDir(path.join(this.getTargetDir(), 'src/main'), createAndroidManifestXml, this, 'AndroidManifest.xml.ejs', data);
        await RenderTemplate.renderTemplateToDir(path.join(this.getTargetDir(), 'src/main/res/values'), createStringsXml, this, 'strings.xml.ejs', data);

        for (let i = 0; i < this.dbSymbolTable.entities.length; i++) {
            let entity = this.dbSymbolTable.entities[i];
            let entityData = data;
            (<any>entityData).entity = entity;
            let entityJava = entity.getMappedName('Java') + ".java";
            await RenderTemplate.renderTemplateToDir(namespaceEntityDir, true, this, 'entity.java.ejs', data, entityJava);
        }


        // await RenderTemplate.renderTemplate(createDecorators, this, 'decorators.ts.ejs', data);
        // await RenderTemplate.renderTemplate(true, this, 'models.ts.ejs', data);
        // await RenderTemplate.renderTemplate(true, this, 'asserts.ts.ejs', data);
        //await RenderTemplate.renderTemplate(true, this, 'entitycontainer.ts.ejs', data, entitycontainerBaseFileName + '.ts');
        // await RenderTemplate.renderTemplate(createPackageJson, this, 'package.json.ejs', data);
        // await RenderTemplate.renderTemplate(createIndex, this, 'index.ts.ejs', data);
        // await RenderTemplate.renderTemplate(createProject, this, 'generated.exports.ts.ejs', data);

        return await true;
    }

}

