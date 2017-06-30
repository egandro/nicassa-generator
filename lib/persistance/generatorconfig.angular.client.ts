import { GeneratorConfigBasic } from './generatorconfig.basic';

export interface AngularClientFilter {
    exculdeEntity?: string[];
    exculdeService?: string[];
    onlyEntity?: string[];
    onlyService?: string[];
}

export interface GeneratorConfigAngularClient extends GeneratorConfigBasic {
    swaggerFile: string;
    customErrorHandler: boolean;
    cleanTargetDir: boolean;
    createProject: boolean;
    ngModuleName: string;
    projectName?: string;
    filter?: AngularClientFilter;
}
