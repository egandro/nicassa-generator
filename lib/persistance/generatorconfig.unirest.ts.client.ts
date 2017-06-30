import { GeneratorConfigBasic } from './generatorconfig.basic';

export interface UnirestTSClientFilter {
    exculdeEntity?: string[];
    exculdeService?: string[];
    onlyEntity?: string[];
    onlyService?: string[];
}

export interface GeneratorConfigUnirestTSClient extends GeneratorConfigBasic {
    cleanTargetDir: boolean;
    createProject: boolean;
    ngModuleName: string;
    projectName?: string;
    filter?: UnirestTSClientFilter;
}
