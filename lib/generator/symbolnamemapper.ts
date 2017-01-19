import ChangeCase = require('change-case');
let identifierfy = require('identifierfy');

let identifierfyOptions = {
    prefixInvalidIdentifiers: false,
    prefixReservedWords: false
};

// https://github.com/blakeembrey/change-case
// https://github.com/novemberborn/identifierfy

export class SymbolNameMapper {
    public static titleCase(value: string): string {
        return ChangeCase.titleCase
        (value);
    }

    public static pathCase(value: string): string {
        return ChangeCase.pathCase(value);
    }

    public static dotCase(value: string): string {
        return ChangeCase.dotCase(value);
    }

    public static headerCase(value: string): string {
        return ChangeCase.headerCase(value);
    }

    public static pascal(value: string): string {
        return ChangeCase.pascal(value);
    }

    public static camel(value: string): string {
        return ChangeCase.camel(value);
    }

    public static identifierfy(value: string): string {
        return identifierfy(value, identifierfyOptions);
    }

    public static removeUnderscore(value: string): string {
        return value.replace(/[_]/g, '');
    }

    public static removeWhitespace(value: string): string {
        return value.replace(/\s+/g, '') ;
    }

    public static lower(value: string): string {
        return value.toLowerCase();
    }

    public static upper(value: string): string {
        return value.toUpperCase();
    }
}

