import { GeneratorConfigBasic } from './generatorconfig.basic';

export interface AndroidRetrofitFilter {
    exculdeDto?: string[];
    exculdeService?: string[];
    onlyDto?: string[];
    onlyService?: string[];
}

export interface GeneratorConfigAndroidRetrofitClient extends GeneratorConfigBasic {
    swaggerFile: string;
    cleanTargetDir: boolean;
    createProject: boolean;
    ngModuleName: string;
    projectName?: string;
    controllerNames: string[];
    namespace: string;
    namespaceDto: string;
    filter?: AndroidRetrofitFilter;
}
