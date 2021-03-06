
import { GeneratorConfigBasic } from '../../persistance/generatorconfig.basic';
import { GeneratorConfigAngularClient, AngularClientFilter } from '../../persistance/generatorconfig.angular.client';

import { ApiParser } from '../../swagger/apiparser.class';
import { ApiTools } from '../../swagger/apitools.class';

import { ApiDescription } from '../../swagger/entites/apidesciption.class';
import { ControllerType } from '../../swagger/entites/controllertype.class';

import { FileManger } from '../filemanager';
import { BaseGenerator } from '../basegenerator';
import { RenderTemplate } from '../rendertemplate';

import { SymbolNameMapper } from '../symbolnamemapper';

export class AngularClientGenerator extends BaseGenerator {
    protected generatorConfig: GeneratorConfigAngularClient;

    constructor(generatorConfigBasic: GeneratorConfigBasic, nicassaJson: string) {
        super(generatorConfigBasic, nicassaJson);
        this.generatorConfig = <GeneratorConfigAngularClient>generatorConfigBasic;
        if (this.generatorConfig !== undefined && this.generatorConfig !== null) {
            if (this.generatorConfig.filter === undefined || this.generatorConfig.filter === null) {
                let defaultCfg = this.getDefaultConfig('');
                this.generatorConfig.filter = defaultCfg.filter;
            }
        }
        this.templateDir = __dirname + '/templates';
    }

    public getDefaultConfig(name: string): GeneratorConfigAngularClient {
        let angularClientFilter: AngularClientFilter = {
            exculdeEntity: [],
            exculdeService: [],
            onlyEntity: [],
            onlyService: []
        }

        let type = "angular.client";

        let result: GeneratorConfigAngularClient = {
            name: name,
            type: type,
            active: true,
            swaggerFile: './swagger.json',
            customErrorHandler: false,
            targetDir: './angular-client',
            cleanTargetDir: false,
            createProject: false,
            createFormValidators: true,
            projectName: 'angular-client',
            ngModuleName: 'AngularClient',
            controllerNames: [],
            filter: angularClientFilter
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
        let createErrorReporter: boolean = false;
        let customErrorHandler: boolean = false;
        let createFormValidators: boolean = false;
        if (this.generatorConfig.createFormValidators) {
            createFormValidators = true;
        }
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
            ngModuleName: ngModuleName,
            customErrorHandler: customErrorHandler,
            createFormValidators: createFormValidators
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
        await RenderTemplate.renderTemplate(createFormValidators, this, 'formvalidators.ts.ejs', data);

        return await true;
    }

// reference - if a custom mapping is implemented
/*
    protected setTypeMapper(api: ApiDescription) {
        for (let k = 0; k < api.complexTypes.length; k++) {
            let type: ComplexType = api.complexTypes[k];
            for (let p = 0; p < type.properties.length; p++) {
                let prop = type.properties[p];
                prop.getMappedType = (kind: string) => {
                    console.log('trace');
                    return prop.type;
                }
            }
        }

        for (let k = 0; k < api.controllers.length; k++) {
            let controller: ControllerType = api.controllers[k];
            for (let r = 0; r < controller.routes.length; r++) {
                let route = controller.routes[r];
                for (let p = 0; p < route.parameter.length; p++) {
                    let parameter = route.parameter[p];
                    parameter.getMappedType = (kind: string) => {
                        console.log('trace');
                        return parameter.type;
                    }
                }
                for (let m = 0; m < route.response.length; m++) {
                    let response = route.response[m];
                    response.getMappedType = (kind: string) => {
                        console.log('trace');
                        return response.type;
                    }
                }
            }
        }
    }
    */

}

