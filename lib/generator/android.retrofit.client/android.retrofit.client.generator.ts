const path = require('path');

import { GeneratorConfigBasic } from '../../persistance/generatorconfig.basic';
import { GeneratorConfigAndroidRetrofitClient, AndroidRetrofitFilter } from '../../persistance/generatorconfig.android.retrofit.client';

import { ApiParser } from '../../swagger/apiparser.class';
import { ApiTools } from '../../swagger/apitools.class';

import { ApiDescription } from '../../swagger/entites/apidesciption.class';
import { ControllerType } from '../../swagger/entites/controllertype.class';

import { FileManger } from '../filemanager';
import { BaseGenerator } from '../basegenerator';
import { RenderTemplate } from '../rendertemplate';

import { SymbolNameMapper } from '../symbolnamemapper';

export class AndroidRetrofitClientGenerator extends BaseGenerator {
    protected generatorConfig: GeneratorConfigAndroidRetrofitClient;

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
        let angularClientFilter: AndroidRetrofitFilter = {
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
            swaggerFile: './swagger.json',
            targetDir: './android.retrofit.client',
            cleanTargetDir: false,
            createProject: false,
            projectName: 'android.retrofit.client',
            ngModuleName: 'RetrofitClient',
            namespace: 'com.example.android.retrofit.client',
            namespaceDto: 'com.example.android.retrofit.client.dto',
            controllerNames: [],
            filter: angularClientFilter
        };

        return result;
    }

    protected async generateCode(): Promise<boolean> {
        let parser = new ApiParser();
        let api: ApiDescription = await parser.parseSwaggerFile(this.generatorConfig.swaggerFile);

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

        let ngModuleName = this.generatorConfig.ngModuleName;

        let controllers: ControllerType[] = ApiTools.createControllersFromRoute(ngModuleName, this.generatorConfig.controllerNames, api.routes);
        let complexTypes = api.complexTypes

        if(this.generatorConfig.filter != null) {
            let exculdeController: string[] = <any>this.generatorConfig.filter.exculdeService;
            let onlyService: string[] = <any>this.generatorConfig.filter.onlyService;
            let exculdeEntity: string[] = <any>this.generatorConfig.filter.exculdeDto;
            let onlyEntity: string[] = <any>this.generatorConfig.filter.onlyDto;

            controllers = ApiTools.applyControllerFilter(exculdeController, onlyService, controllers);
            complexTypes = ApiTools.applyReferenceTypeFilter(exculdeEntity, onlyEntity, api.complexTypes);
        }

        let data = {
            controllers: controllers,
            complexTypes: complexTypes,
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

        for (let i = 0; i < complexTypes.length; i++) {
            let dto = complexTypes[i];
            let dtoData = data;
            (<any>dtoData).dto = dto;
            let fileName = dto.type + ".java";
            await RenderTemplate.renderTemplateToDir(namespaceDtoDir, true, this, 'dto.java.ejs', dtoData, fileName);
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

}

