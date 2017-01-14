let fs = require('fs');
let process = require('process');

import { TopLevel } from '../persistance/toplevel';
import { NicassaGenerator } from '../persistance/nicassagenerator';
import { GeneratorConfigBasic } from '../persistance/generatorconfig.basic';

import { FileManger } from './filemanager';

export abstract class BaseGenerator {
    protected dataTypeMapping: { [mappings: string]: { [dbtype: string]: string } }
    protected templateDir: string;

    constructor(private generatorConfigBasic: GeneratorConfigBasic, protected nicassaJson: string) { }

    public async run(): Promise<boolean> {
        FileManger.createTargetDirIfNeeded(this);
        return await this.generateCode();
    }

    public abstract getDefaultConfig(name: string): GeneratorConfigBasic;

    public getTemplateDir(): string {
        return this.templateDir;
    }

    public getTargetDir(): string {
        return this.generatorConfigBasic.targetDir;
    }

    protected async abstract generateCode(): Promise<boolean>;


    public static getGeneratorByName(fileName: string, generatorName: string): GeneratorConfigBasic {
        let str = null;

        try {
            str = fs.readFileSync(fileName);
        } catch (err) {
            console.error('error: can\'t read file "' + fileName + '"');
            process.exit(-1);
        }

        return BaseGenerator.getGeneratorByNameFromString(str, generatorName);
    }

    public static getGeneratorByNameFromString(data: string, generatorName: string): GeneratorConfigBasic {
        let toplevel: TopLevel = JSON.parse(data);
        let nicassaGenerator: NicassaGenerator = <NicassaGenerator>toplevel.nicassaGenerator;
        if (nicassaGenerator === undefined || nicassaGenerator.generators === undefined) {
            return <any>null;
        }

        for (let i = 0; i < nicassaGenerator.generators.length; i++) {
            let gen = nicassaGenerator.generators[i];
            if (gen.name === generatorName) {
                return gen;
            }
        }

        return <any>null;
    }
}
