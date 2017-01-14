import { GeneratorConfigBasic } from './generatorconfig.basic';

export interface GeneratorConfigAngular2Client extends GeneratorConfigBasic {
    parentSequelizeTSDalConfigName: string;
    cleanTargetDir: boolean;
    createProject: boolean;
    ngModuleName: string;
    projectName?: string;
}
