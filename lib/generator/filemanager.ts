const process = require('process');
const fs = require('fs');
const path = require('path');
const mkdirSync = require('fs-force-mkdir-sync');

import { BaseGenerator } from './basegenerator';

export class FileManger {
    public static createTargetDirIfNeeded(generator: BaseGenerator) {
        FileManger.createDirIfNeeded(generator.getTargetDir());
    }

    public static fileExistInProjectDir(generator: BaseGenerator, fileName: string) {
        return FileManger.fileExistInDir(generator.getTargetDir(), fileName);
    }


    public static createDirIfNeeded(dir: string) {
        try {
            if (fs.existsSync(dir)) {
                return;
            }
            mkdirSync(dir);
        } catch (err) {
            console.error(err);
            process.exit(-1);
        }
    }

    public static fileExistInDir(dir: string, fileName: string) {
        try {
            let file = path.join(dir, fileName)
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
