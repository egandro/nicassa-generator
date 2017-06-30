import { GeneratorConfigBasic } from './generatorconfig.basic';

export interface AndroidRetrofitFilter {
    exculdeDto?: string[];
    exculdeService?: string[];
    onlyDto?: string[];
    onlyService?: string[];
}

export interface GeneratorConfigAndroidRetrofitClient extends GeneratorConfigBasic {
    cleanTargetDir: boolean;
    createProject: boolean;
    projectName?: string;
    namespace: string;
    namespaceDto: string;
    filter?: AndroidRetrofitFilter;
}
