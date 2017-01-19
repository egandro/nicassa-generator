const fs = require('fs');
const path = require('path');
const process = require('process');

import * as Ejs from 'ejs';

import { BaseGenerator } from './basegenerator';

export class RenderTemplate {
    public static async renderTemplate(active: boolean, generator: BaseGenerator, templateName: string, data?: any, outputFileName?: string): Promise<string> {
        let targetDir = generator.getTargetDir();
        return await RenderTemplate.renderTemplateToDir(targetDir, active, generator, templateName, data, outputFileName);
    }

    public static async renderTemplateToDir(targetDir: string, active: boolean, generator: BaseGenerator, templateName: string, data?: any, outputFileName?: string): Promise<string> {
        let genText: string = <any>null;

        if (!active) {
            return await genText;
        }

        let dir = generator.getTemplateDir();
        let templatePath: string = path.join(dir, templateName);

        if (!fs.existsSync(templatePath)) {
            console.error('error: requested template \'' + templateName + '\' does not exist here: ' + templatePath);
            process.exit(-1);
        }

        genText = await RenderTemplate.renderEjs(targetDir, templatePath, templateName, data, outputFileName);
        return await genText;
    }

    private static async renderEjs(targetDir: string, templatePath: string, templateName: string, data?: any, outputFileName?: string): Promise<string> {
        let opts: Ejs.Options = <any>null;

        return new Promise<string>((resolve, reject) => {
            Ejs.renderFile(templatePath, data, opts, (err: Error, str: string) => {
                if (err) {
                    reject(err);
                }

                let targetName = path.basename(templateName, ".ejs");
                if (outputFileName !== undefined && outputFileName !== null) {
                    targetName = outputFileName;
                }

                try {
                    fs.writeFileSync(path.join(targetDir, targetName), str);
                } catch (err) {
                    reject(err);
                }

                resolve(str);
            });
        });
    }
}
