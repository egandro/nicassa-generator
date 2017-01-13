import { NicassaParserDB } from 'nicassa-parser-db';
import { NicassaParserTSExpressApi } from 'nicassa-parser-ts-express-api';

import { NicassaGenerator } from '../persistance/nicassagenerator';

export interface TopLevel {
    nicassaParserDB?: NicassaParserDB;
    nicassaParserTSExpressApi?: NicassaParserTSExpressApi;
    nicassaGenerator?: NicassaGenerator
}
