import { CaseEnum } from './case.enum';

export interface EntityNaming {
    caseType: CaseEnum;
    filenameCaseType: CaseEnum;
    instanceCaseType: CaseEnum;
    // removePrefixes?: string[];
    // removeSuffixes?: string[];
    // addPrefix?: string;
    // addSuffix?: string;
    removeUnderscore: boolean;
    removeInvalidCharacters: boolean;
}
