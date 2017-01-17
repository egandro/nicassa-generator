import { GeneratorConfigBasic } from './generatorconfig.basic';

export interface ExpressTSRoutesFilter {
    exculdeEntity?: string[];
    exculdeController?: string[];
    onlyEntity?: string[];
    onlyController?: string[];
}

export interface GeneratorConfigExpressTSRoutes extends GeneratorConfigBasic {
    nicassaParserDBFile?: string;
    nicassaParserDBGeneratorName?: string;
    filter?: ExpressTSRoutesFilter;
}
