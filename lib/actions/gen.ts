let fs = require('fs');
let process = require('process');

import { TopLevel } from '../persistance/toplevel';
import { NicassaGenerator } from '../persistance/nicassagenerator';
import { GeneratorConfigBasic } from '../persistance/generatorconfig.basic';

import { CodeGeneratorFactory } from '../generator/codegeneratorfactory.class';
import { BaseGenerator } from '../generator/basegenerator';

export class RunGenerator {
    fileName: string;
    name: string;
    generators: GeneratorConfigBasic[] = [];

    public async run(opts: any) : Promise<boolean>{
        this.fileName = opts.file;
        this.name = opts.name;

        if (!fs.existsSync(this.fileName)) {
            console.error('error: file not found "' + this.fileName + '"');
            process.exit(-1);
        }

        if (this.name !== undefined) {
            let gen: GeneratorConfigBasic = BaseGenerator.getGeneratorByName(this.fileName, this.name);
            if (gen === null) {
                console.error('error: no generator with name: "' + this.name + '" was found in "' + this.fileName + '"');
                process.exit(-1);
            }
            this.generators.push(gen);
        } else {
            this.generators = this.getAllActiveGenerators();
        }

        if (this.generators.length === 0) {
            console.error('error: no active generators in "' + this.fileName + '"');
            process.exit(-1);
        }

        let str = fs.readFileSync(this.fileName);
        return await this.runGenerators(str);
    }

    protected async runGenerators(str: string) : Promise<boolean>{
        for (let i = 0; i < this.generators.length; i++) {
            let gen = this.generators[i];
            let codeGenerator = CodeGeneratorFactory.getCodeGenerator(gen.type, gen, str);
            await codeGenerator.run();
        }
        return await true;
    }

    protected getAllActiveGenerators(): GeneratorConfigBasic[] {
        let str = null;

        try {
            str = fs.readFileSync(this.fileName);
        } catch (err) {
            console.error('error: can\'t read file "' + this.fileName + '"');
            process.exit(-1);
        }

        let result: GeneratorConfigBasic[] = [];

        let toplevel: TopLevel = JSON.parse(str);
        let nicassaGenerator: NicassaGenerator = <NicassaGenerator>toplevel.nicassaGenerator;
        if (nicassaGenerator === undefined || nicassaGenerator.generators === undefined) {
            return result;
        }

        for (let i = 0; i < nicassaGenerator.generators.length; i++) {
            let gen = nicassaGenerator.generators[i];
            if (gen.active) {
                result.push(gen);
            }
        }

        return result;
    }
}

export default async function run(opts: any) {
    let instance = new RunGenerator();
    return await instance.run(opts);
}
