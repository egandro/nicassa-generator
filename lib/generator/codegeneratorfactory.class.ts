import { GeneratorConfigBasic } from '../persistance/generatorconfig.basic';

import { BaseGenerator } from './basegenerator';
import { SequelizeTSDalGenerator } from './sequelize.ts.dal/sequelize.ts.dal.generator';
import { AngularClientGenerator } from './angular.client/angular.client.generator';
import { UnirestTSClientGenerator } from './unirest.ts.client/unirest.ts.client.generator';
import { AndroidORMLiteDalGenerator } from './android.ormlite.dal/android.ormlite.dal.generator';
// import { AndroidRetrofitClientGenerator } from './android.retrofit.client/android.retrofit.client.generator';

export class CodeGeneratorFactory {
    public static getCodeGenerator(type: string, generatorConfigBasic: GeneratorConfigBasic, nicassaJson: string): BaseGenerator {
        let result: BaseGenerator;
        switch (type) {
            case 'sequelize.ts.dal':
                result = new SequelizeTSDalGenerator(generatorConfigBasic, nicassaJson);
                break;
            case 'angular.client':
                result = new AngularClientGenerator(generatorConfigBasic, nicassaJson);
                break;
            case 'unirest.ts.client':
                result = new UnirestTSClientGenerator(generatorConfigBasic, nicassaJson);
                break;
            case 'android.ormlite.dal':
                result = new AndroidORMLiteDalGenerator(generatorConfigBasic, nicassaJson);
                break;
            case 'android.retrofit.client':
                // result = new AndroidRetrofitClientGenerator(generatorConfigBasic, nicassaJson);
                // break;
                throw "android.retrofit.client currently disabled";
            default:
                throw ('unsupported generator type: ' + type);
        }
        return result;
    }
}
