import { Filter } from 'nicassa-parser-db';

import { ModelNaming } from './naming/modelnaming';

import { GeneratorConfigBasic } from './generatorconfig.basic';

export interface GeneratorConfigSequelizeTSDal extends GeneratorConfigBasic {
    cleanTargetDir: boolean;
    createProject: boolean;
    projectName?: string;
    namespace?: string;
    filter?: Filter;
    entityContainerName?: string;
    // detectManyToManyAssociations: boolean; // TBD: hardcore stuff...
    modelNaming: ModelNaming;
    dataTypeMapping?: { [mappings: string]: { [dbtype: string]: string  } };
}
