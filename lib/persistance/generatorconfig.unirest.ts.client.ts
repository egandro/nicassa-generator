import { GeneratorConfigBasic } from './generatorconfig.basic';

export interface UnirestTSClientFilter {
    exculdeEntity?: string[];
    exculdeService?: string[];
    onlyEntity?: string[];
    onlyService?: string[];
}

export interface GeneratorConfigUnirestTSClient extends GeneratorConfigBasic {
    swaggerFile: string;
    cleanTargetDir: boolean;
    createProject: boolean;
    ngModuleName: string;
    projectName?: string;
    controllerNames: string[];
    filter?: UnirestTSClientFilter;
}
