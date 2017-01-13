import { CaseEnum } from './case.enum';

export interface PropertyNaming {
    caseType: CaseEnum;
    // removePrefixes?: string[];
    // removeSuffixes?: string[];
    // addPrefix?: string;
    // addSuffix?: string;
    removeUnderscore: boolean;
    removeInvalidCharacters: boolean;
    plurarlizeCollectionNavigationProperties: boolean;
}
