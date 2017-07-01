
import { GeneratorConfigBasic } from '../../persistance/generatorconfig.basic';
import { GeneratorConfigUnirestTSClient, UnirestTSClientFilter } from '../../persistance/generatorconfig.unirest.ts.client';

import { ApiParser } from '../../swagger/apiparser.class';
import { ApiTools } from '../../swagger/apitools.class';

import { ApiDescription } from '../../swagger/entites/apidesciption.class';
import { ControllerType } from '../../swagger/entites/controllertype.class';

import { FileManger } from '../filemanager';
import { BaseGenerator } from '../basegenerator';
import { RenderTemplate } from '../rendertemplate';

import { SymbolNameMapper } from '../symbolnamemapper';

export class UnirestTSClientGenerator extends BaseGenerator {
    protected generatorConfig: GeneratorConfigUnirestTSClient;

    constructor(generatorConfigBasic: GeneratorConfigBasic, nicassaJson: string) {
        super(generatorConfigBasic, nicassaJson);
        this.generatorConfig = <GeneratorConfigUnirestTSClient>generatorConfigBasic;
        if (this.generatorConfig !== undefined && this.generatorConfig !== null) {
            if (this.generatorConfig.filter === undefined || this.generatorConfig.filter === null) {
                let defaultCfg = this.getDefaultConfig('');
                this.generatorConfig.filter = defaultCfg.filter;
            }
        }
        this.templateDir = __dirname + '/templates';
    }

    public getDefaultConfig(name: string): GeneratorConfigUnirestTSClient {
        let unirestTSClientFilter: UnirestTSClientFilter = {
            exculdeEntity: [],
            exculdeService: [],
            onlyEntity: [],
            onlyService: []
        }

        let type = "unirest.ts.client";

        let result: GeneratorConfigUnirestTSClient = {
            name: name,
            type: type,
            active: true,
            swaggerFile: './swagger.json',
            targetDir: './unirest-ts-client',
            cleanTargetDir: false,
            createProject: false,
            projectName: 'unirest-ts-client',
            ngModuleName: 'UnirestTSClient',
            controllerNames: [],
            filter: unirestTSClientFilter
        };

        return result;
    }


    protected async generateCode(): Promise<boolean> {
        let parser = new ApiParser();
        let api: ApiDescription = await parser.parseSwaggerFile(this.generatorConfig.swaggerFile);

        let createPackageJson: boolean = false;
        let createIndex: boolean = false;
        let createProject: boolean = this.generatorConfig.createProject;
        let createConfiguration: boolean = false;
        if (createProject) {
            createPackageJson = !FileManger.fileExistInProjectDir(this, 'package.json');
            createIndex = !FileManger.fileExistInProjectDir(this, 'index.ts');
            createConfiguration = !FileManger.fileExistInProjectDir(this, 'configuration.ts');
        }
        let projectName = this.generatorConfig.projectName;
        if (projectName === undefined || projectName === null) {
            projectName = 'undefined';
        }
        projectName = SymbolNameMapper.titleCase(projectName);
        projectName = SymbolNameMapper.headerCase(projectName);
        projectName = SymbolNameMapper.lower(projectName);
        let ngModuleName = this.generatorConfig.ngModuleName;

        let controllers: ControllerType[] = ApiTools.createControllersFromRoute(ngModuleName, this.generatorConfig.controllerNames, api.routes);
        let complexTypes = api.complexTypes

        if(this.generatorConfig.filter != null) {
            let exculdeController: string[] = <any>this.generatorConfig.filter.exculdeService;
            let onlyService: string[] = <any>this.generatorConfig.filter.onlyService;
            let exculdeEntity: string[] = <any>this.generatorConfig.filter.exculdeEntity;
            let onlyEntity: string[] = <any>this.generatorConfig.filter.onlyEntity;

            controllers = ApiTools.applyControllerFilter(exculdeController, onlyService, controllers);
            complexTypes = ApiTools.applyReferenceTypeFilter(exculdeEntity, onlyEntity, api.complexTypes);
        }

        let data = {
            controllers: controllers,
            complexTypes: complexTypes,
            projectName: projectName,
            ngModuleName: ngModuleName
        };

        await RenderTemplate.renderTemplate(true, this, 'entities.ts.ejs', data);
        await RenderTemplate.renderTemplate(true, this, 'services.ts.ejs', data);
        await RenderTemplate.renderTemplate(createPackageJson, this, 'package.json.ejs', data);
        await RenderTemplate.renderTemplate(createIndex, this, 'index.ts.ejs', data);
        await RenderTemplate.renderTemplate(createProject, this, 'generated.exports.ts.ejs', data);
        await RenderTemplate.renderTemplate(createConfiguration, this, 'configuration.ts.ejs', data);

        return await true;
    }


}

