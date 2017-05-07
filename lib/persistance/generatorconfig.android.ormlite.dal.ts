import { Filter } from 'nicassa-parser-db';

import { ModelNaming } from './naming/modelnaming';

import { GeneratorConfigBasic } from './generatorconfig.basic';

export interface ViewDataTypeMapColumn {
    name: string;
    dataType: string;
}

export interface ViewDataTypeMap {
    name: string;
    tableName: string;
    columns: ViewDataTypeMapColumn[];
}

export interface GeneratorConfigAndroidORMLiteDal extends GeneratorConfigBasic {
    cleanTargetDir: boolean;
    createProject: boolean;
    projectName?: string;
    namespace: string;
    namespaceEntity: string;
    filter?: Filter;
    modelNaming: ModelNaming;
    dataTypeMapping?: { [mappings: string]: { [dbtype: string]: string } };
    viewDataTypeMap?: ViewDataTypeMap[];
}
