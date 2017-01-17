let fs = require('fs');
let process = require('process');

import { TopLevel } from '../persistance/toplevel';
import { NicassaGenerator } from '../persistance/nicassagenerator';
import { GeneratorConfigBasic } from '../persistance/generatorconfig.basic';

import { CodeGeneratorFactory } from '../generator/codegeneratorfactory.class';

export class AddGenerator {
    fileName: string;
    type: string;
    name: string;

    run(opts: any) {
        this.fileName = opts.file;
        this.type = opts.type;
        this.name = opts.name;
        if (opts.name === undefined) {
            this.name = this.type;
        }

        if (!fs.existsSync(this.fileName)) {
            console.error('error: file not found "' + this.fileName + '"');
            process.exit(-1);
        }

        if (!this.sectionExistInFile()) {
            console.error('error: nicassa generators section does not exist in "' + this.fileName + '". Dir you run init?');
            process.exit(-1);
        }

        if (!this.isGeneratorTypeOK()) {
            console.error('error: unknown generator type: ' + this.type);
            process.exit(-1);
        }

        if (!this.isTypeAndNameOK()) {
            console.error('error: generator type already exist or no/invalid name was given in "' + this.fileName + '"');
            process.exit(-1);
        }

        let str = fs.readFileSync(this.fileName);
        let codeGenerator = CodeGeneratorFactory.getCodeGenerator(this.type, <any>null, str);
        let config = codeGenerator.getDefaultConfig(this.name);
        let data = this.createJsonString(config);

        try {
            fs.writeFileSync(this.fileName, data);
        } catch (err) {
            console.error('error: can\'t create file "' + this.fileName + '"');
            // console.error(err);
            process.exit(-1);
        }
    }

    protected createJsonString(generatorConfig: GeneratorConfigBasic): string {
        let str = null;

        try {
            if (fs.existsSync(this.fileName)) {
                str = fs.readFileSync(this.fileName);
            }
        } catch (err) {
            console.error('error: can\'t read file "' + this.fileName + '"');
            // console.error(err);
            process.exit(-1);
        }

        if (str === null) {
            let toplevel: TopLevel = {
                nicassaGenerator: <any>null
            }
            str = JSON.stringify(toplevel, null, 2);
        }

        let toplevel: TopLevel = JSON.parse(str);
        let nicassaGenerator: NicassaGenerator = <NicassaGenerator>toplevel.nicassaGenerator;
        if (nicassaGenerator.generators === undefined) {
            nicassaGenerator.generators = [];
        }

        nicassaGenerator.generators.push(generatorConfig);

        let result = JSON.stringify(toplevel, null, 2);
        return result;
    }

    protected sectionExistInFile(): boolean {
        let str = null;

        try {
            str = fs.readFileSync(this.fileName);
        } catch (err) {
            console.error('error: can\'t read file "' + this.fileName + '"');
            process.exit(-1);
        }

        let toplevel: TopLevel = JSON.parse(str);
        return (toplevel.nicassaGenerator !== undefined);
    }

    protected isGeneratorTypeOK(): boolean {
        let arr: string[] = [
            'sequelize.ts.dal',
            'express.ts.routes',
            'angular2.client',
            'unirest.ts.client'
        ];
        return (arr.indexOf(this.type) !== -1);
    }

    protected isTypeAndNameOK(): boolean {
        let str = null;

        try {
            str = fs.readFileSync(this.fileName);
        } catch (err) {
            console.error('error: can\'t read file "' + this.fileName + '"');
            process.exit(-1);
        }

        let toplevel: TopLevel = JSON.parse(str);
        let nicassaGenerator: NicassaGenerator = <NicassaGenerator>toplevel.nicassaGenerator;

        if (nicassaGenerator.generators === undefined ||
            nicassaGenerator.generators === null ||
            nicassaGenerator.generators.length < 1) {
            return true;
        }

        let names: string[] = [];
        for (let i = 0; i < nicassaGenerator.generators.length; i++) {
            let gen = nicassaGenerator.generators[i];
            if (gen.type === this.type) {
                names.push(gen.name);
            }
        }

        // if we have a same name, we have a clash
        return (names.indexOf(this.name) === -1);
    }
}

export default function run(opts: any) {
    let instance = new AddGenerator();
    return instance.run(opts);
}
