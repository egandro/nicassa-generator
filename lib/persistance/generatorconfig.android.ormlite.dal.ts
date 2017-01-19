import { Filter } from 'nicassa-parser-db';

import { ModelNaming } from './naming/modelnaming';

import { GeneratorConfigBasic } from './generatorconfig.basic';

export interface GeneratorConfigAndroidORMLiteDal extends GeneratorConfigBasic {
    cleanTargetDir: boolean;
    createProject: boolean;
    projectName?: string;
    namespace: string;
    namespaceEntity: string;
    utcDates: boolean;
    filter?: Filter;
    modelNaming: ModelNaming;
    dataTypeMapping?: { [mappings: string]: { [dbtype: string]: string } };
}
