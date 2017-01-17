import { GeneratorConfigBasic } from '../persistance/generatorconfig.basic';

import { BaseGenerator } from './basegenerator';
import { ExpressTSRoutesGenerator } from './express.ts.routes/express.ts.routes.generator';
import { SequelizeTSDalGenerator } from './sequelize.ts.dal/sequelize.ts.dal.generator';
import { Angular2ClientGenerator } from './angular2.client/angular2.client.generator';
import { UnirestTSClientGenerator } from './unirest.ts.client/unirest.ts.client.generator';


export class CodeGeneratorFactory {
    public static getCodeGenerator(type: string, generatorConfigBasic: GeneratorConfigBasic, nicassaJson: string): BaseGenerator {
        let result: BaseGenerator;
        switch (type) {
            case 'express.ts.routes':
                result = new ExpressTSRoutesGenerator(generatorConfigBasic, nicassaJson);
                break;
            case 'sequelize.ts.dal':
                result = new SequelizeTSDalGenerator(generatorConfigBasic, nicassaJson);
                break;
            case 'angular2.client':
                result = new Angular2ClientGenerator(generatorConfigBasic, nicassaJson);
                break;
            case 'unirest.ts.client':
                result = new UnirestTSClientGenerator(generatorConfigBasic, nicassaJson);
                break;
            default:
                throw ('unsupported generator type: ' + type);
        }
        return result;
    }
}
