let fs = require('fs');
let process = require('process');

import { GeneratorConfigBasic } from '../persistance/generatorconfig.basic';
import { TopLevel } from '../persistance/toplevel';
import { NicassaGenerator } from '../persistance/nicassagenerator';

export class Init {
    fileName: string;

    run(opts: any) {
        this.fileName = opts.file;

        if (fs.existsSync(this.fileName)) {
            if (this.sectionExistInFile()) {
                console.error('error: section already exist in "' + this.fileName + '"');
                process.exit(-1);
            }
        }

        let data = this.createJsonString();

        try {
            fs.writeFileSync(this.fileName, data);
        } catch (err) {
            console.error('error: can\'t create file "' + this.fileName + '"');
            // console.error(err);
            process.exit(-1);
        }
    }

    protected sectionExistInFile(): boolean {
        let str = null;

        try {
            str = fs.readFileSync(this.fileName);
        } catch (err) {
            console.error('error: can\'t read file "' + this.fileName + '"');
            // console.error(err);
            process.exit(-1);
        }

        let toplevel: TopLevel = JSON.parse(str);
        return (toplevel.nicassaGenerator !== undefined);
    }

    protected createJsonString(): string {
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

        let generators: GeneratorConfigBasic[] = [];

        let nicassaGenerator: NicassaGenerator = {
            formatVersion: '1.0',
            generators: generators
        };

        let toplevel: TopLevel = JSON.parse(str);
        toplevel.nicassaGenerator = nicassaGenerator;

        let result = JSON.stringify(toplevel, null, 2);
        return result;
    }
}

export default function run(opts: any) {
    let instance = new Init();
    return instance.run(opts);
}
