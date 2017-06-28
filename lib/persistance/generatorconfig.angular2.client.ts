import { GeneratorConfigBasic } from './generatorconfig.basic';

export interface Angular2ClientFilter {
    exculdeEntity?: string[];
    exculdeService?: string[];
    onlyEntity?: string[];
    onlyService?: string[];
}

export interface GeneratorConfigAngular2Client extends GeneratorConfigBasic {
    customErrorHandler: boolean;
    parentServerGeneratorConfigName: string;
    cleanTargetDir: boolean;
    createProject: boolean;
    ngModuleName: string;
    projectName?: string;
    filter?: Angular2ClientFilter;
}
