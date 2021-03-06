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
    createFormValidators?: boolean;
    ngModuleName: string;
    projectName?: string;
    controllerNames: string[];
    filter?: AngularClientFilter;
}
