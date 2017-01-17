import { GeneratorConfigBasic } from './generatorconfig.basic';

export interface UnirestTSClientFilter {
    exculdeEntity?: string[];
    exculdeService?: string[];
    onlyEntity?: string[];
    onlyService?: string[];
}

export interface GeneratorConfigUnirestTSClient extends GeneratorConfigBasic {
    parentServerGeneratorConfigName: string;
    cleanTargetDir: boolean;
    createProject: boolean;
    ngModuleName: string;
    projectName?: string;
    filter?: UnirestTSClientFilter;
}
