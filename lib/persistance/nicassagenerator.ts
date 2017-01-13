import { GeneratorConfigBasic } from './generatorconfig.basic';

export interface NicassaGenerator {
    formatVersion: string;
    generators: GeneratorConfigBasic[];
}
