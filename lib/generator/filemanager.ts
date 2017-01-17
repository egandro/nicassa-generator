const process = require('process');
const fs = require('fs');
const path = require('path');
const mkdirSync = require('fs-force-mkdir-sync');

import { BaseGenerator } from './basegenerator';

export class FileManger {
    public static createTargetDirIfNeeded(generator: BaseGenerator) {
        try {
            if (fs.existsSync(generator.getTargetDir())) {
                return;
            }
            mkdirSync(generator.getTargetDir());
        } catch (err) {
            console.error(err);
            process.exit(-1);
        }
    }

    public static fileExistInProjectDir(generator: BaseGenerator, fileName: string) {
        try {
            let file = path.join(generator.getTargetDir(), fileName)
            if (fs.existsSync(file)) {
                return true;
            }
            return false;
        } catch (err) {
            console.error(err);
            process.exit(-1);
        }

    }

}
