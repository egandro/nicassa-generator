import { GeneratorConfigBasic } from '../persistance/generatorconfig.basic';

import { BaseGenerator } from './basegenerator';
import { ExpressTSRoutesGenerator } from './express.ts.routes/express.ts.routes.generator';
import { SequelizeTSDalGenerator } from './sequelize.ts.dal/sequelize.ts.dal.generator';


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
            default:
                throw ('unsupported generator type: ' + type);
        }
        return result;
    }
}
