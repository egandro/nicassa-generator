import { Filter } from 'nicassa-parser-db';

import { GeneratorConfigBasic } from '../../persistance/generatorconfig.basic';
import { GeneratorConfigSequelizeTSDal } from '../../persistance/generatorconfig.sequelize.ts.dal';

import { ModelNaming } from '../../persistance/naming/modelnaming';
import { CaseEnum } from '../../persistance/naming/case.enum';
import { PropertyNaming } from '../../persistance/naming/propertynaming';
import { EntityNaming } from '../../persistance/naming/entitynaming';

import { SequelizeTypescriptMapping } from './sequelize.typescript.mapping';

import { FileManger } from '../filemanager';
import { BaseGenerator } from '../basegenerator';
import { RenderTemplate } from '../rendertemplate';

import { SymbolNameMapper } from '../symbolnamemapper';
import { DBSymbolTable } from '../symboltable/db/dbsymboltable';
import { DBSymbolTableReader } from '../symboltable/db/dbsymboltable.reader';
import { SequelizeTsDalTypeMapper } from './sequelize.ts.dal.typemapper.class';


export class SequelizeTSDalGenerator extends BaseGenerator {
    protected dbSymbolTable: DBSymbolTable;
    protected generatorConfig: GeneratorConfigSequelizeTSDal;
    protected typeMapper: SequelizeTsDalTypeMapper;

    constructor(generatorConfigBasic: GeneratorConfigBasic, nicassaJson: string) {
        super(generatorConfigBasic, nicassaJson);
        this.generatorConfig = <GeneratorConfigSequelizeTSDal>generatorConfigBasic;
        this.dataTypeMapping = SequelizeTypescriptMapping.dataTypeMapping;
        this.templateDir = __dirname + '/templates';
        this.typeMapper = new SequelizeTsDalTypeMapper(this.generatorConfig, this.dataTypeMapping);
    }

    public getDefaultConfig(name: string): GeneratorConfigSequelizeTSDal {
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

        let type = "sequelize.ts.dal";

        let result: GeneratorConfigSequelizeTSDal = {
            name: name,
            type: type,
            active: true,
            targetDir: './' + name,
            cleanTargetDir: true,
            createProject: true,
            projectName: <any>null,
            namespace: <any>null,
            entityContainerName: <any>null,
            modelNaming: modelNaming,
            dataTypeMapping: {},
            filter: filter
        };

        return result;
    }


    protected async generateCode(): Promise<boolean> {
        this.dbSymbolTable = DBSymbolTableReader.readFromJsonString(this.nicassaJson, <any>this.generatorConfig.filter, this.typeMapper);

        let createPackageJson: boolean = false;
        let createIndex: boolean = false;
        let createProject: boolean = this.generatorConfig.createProject;
        if (createProject) {
            createPackageJson = !FileManger.fileExistInProjectDir(this, 'package.json');
            createIndex = !FileManger.fileExistInProjectDir(this, 'index.ts');
        }
        let projectName = this.generatorConfig.projectName;
        if (projectName === undefined || projectName === null) {
            projectName = 'undefined';
        }
        projectName = SymbolNameMapper.titleCase(projectName);
        projectName = SymbolNameMapper.headerCase(projectName);
        projectName = SymbolNameMapper.lower(projectName);
        let createDecorators = false;

        let entitycontainerBaseFileName = this.createEntitycontainerBaseFileName();

        let data = {
            tables: this.dbSymbolTable.tables,
            views: this.dbSymbolTable.views,
            columns: this.dbSymbolTable.columns,
            entities: this.dbSymbolTable.entities,
            relations: this.dbSymbolTable.relations,
            namespace: this.generatorConfig.namespace,
            projectName: projectName,
            entitycontainerBaseFileName: entitycontainerBaseFileName,
            entityContainerName: this.createEntitycontainerName(),
            createDecorators: createDecorators
        };

        await RenderTemplate.renderTemplate(true, this, 'entities.ts.ejs', data);
        await RenderTemplate.renderTemplate(createDecorators, this, 'decorators.ts.ejs', data);
        await RenderTemplate.renderTemplate(true, this, 'models.ts.ejs', data);
        await RenderTemplate.renderTemplate(true, this, 'asserts.ts.ejs', data);
        await RenderTemplate.renderTemplate(true, this, 'entitycontainer.ts.ejs', data, entitycontainerBaseFileName + '.ts');
        await RenderTemplate.renderTemplate(createPackageJson, this, 'package.json.ejs', data);
        await RenderTemplate.renderTemplate(createIndex, this, 'index.ts.ejs', data);
        await RenderTemplate.renderTemplate(createProject, this, 'generated.exports.ts.ejs', data);

        return await true;
    }

    protected createEntitycontainerName(): string {
        let ext = 'Container';
        let result: string = 'SequelizeTypescript' + ext;
        if (this.generatorConfig.entityContainerName === undefined || this.generatorConfig.entityContainerName === null) {
            return result;
        }

        result = this.generatorConfig.entityContainerName;
        result = SymbolNameMapper.titleCase(result);
        result = SymbolNameMapper.removeWhitespace(result);
        result = SymbolNameMapper.identifierfy(result);

        if (result.substr((-1) * ext.length) !== ext) {
            result += ext;
        }

        return result;
    }

    protected createEntitycontainerBaseFileName(): string {
        let ext = '.container';
        let result: string = 'sequelize.typescript' + ext;
        if (this.generatorConfig.entityContainerName === undefined || this.generatorConfig.entityContainerName === null) {
            return result;
        }

        result = this.generatorConfig.entityContainerName;
        result = SymbolNameMapper.lower(result);
        result = SymbolNameMapper.removeWhitespace(result);

        if (result.substr((-1) * ext.length) !== ext) {
            result += ext;
        }

        return result;
    }
}

