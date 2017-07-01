const changeCase = require('change-case');

import { GeneratorConfigBasic } from '../../persistance/generatorconfig.basic';
import { GeneratorConfigAngularClient, AngularClientFilter } from '../../persistance/generatorconfig.angular.client';

import { ApiParser } from '../../swagger/apiparser.class';
import { ApiDescription } from '../../swagger/entites/apidesciption.class';
import { ControllerType } from '../../swagger/entites/controllertype.class';
import { ComplexType } from '../../swagger/entites/complextype.class';
import { RouteType } from '../../swagger/entites/routetype.class';

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

        let controllers: ControllerType[] = this.createControllersFromRoute(ngModuleName, this.generatorConfig.controllerNames, api.routes);

        controllers = this.applyControllerFilter(<any>this.generatorConfig.filter, controllers);
        let complexTypes = this.applyReferenceTypeFilter(<any>this.generatorConfig.filter, api.complexTypes);


        let data = {
            controllers: controllers,
            complexTypes: complexTypes,
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


    protected createControllersFromRoute(defaultControllerName: string, controllerNames: string[], routes: RouteType[]): ControllerType[] {
        let result: ControllerType[] = [];

        if (controllerNames == null || controllerNames == undefined || controllerNames.length == 0) {
            // we can't unflatten
            let ctrl: ControllerType = new ControllerType();
            ctrl.name = defaultControllerName;
            for (let r = 0; r < routes.length; r++) {
                let route = routes[r];
                route.operationId = changeCase.lowerCaseFirst(route.operationId);
                ctrl.routes.push(route);
            }

            result.push(ctrl);
            return result;
        }

        for (let c = 0; c < controllerNames.length; c++) {
            let controllerName = controllerNames[c];
            if (controllerName.toLowerCase().endsWith("controller")) {
                controllerName = controllerName.substring(0, controllerName.length - "controller".length);
            }

            let ctrl: ControllerType = new ControllerType();
            ctrl.name = controllerName;
            for (let r = 0; r < routes.length; r++) {
                let route = routes[r];
                if (route.operationId.startsWith(controllerName)) {
                    route.operationId = route.operationId.substring(controllerName.length);
                    route.operationId = changeCase.lowerCaseFirst(route.operationId);
                    ctrl.routes.push(route);
                }
            }

            result.push(ctrl);
        }


        return result;
    }

    protected applyControllerFilter(filter: AngularClientFilter, controllers: ControllerType[]): ControllerType[] {
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

        let result: ControllerType[] = [];
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

    protected applyReferenceTypeFilter(filter: AngularClientFilter, referenceTypes: ComplexType[]): ComplexType[] {
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

        let result: ComplexType[] = [];
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

}

