import { Get, Controller, Route } from 'tsoa';

export enum EnumNumberValue {
  VALUE_1, VALUE_2
}

export enum EnumStringValue {
  VALUE_1 = <any>'VALUE_1', VALUE_2 = <any>'VALUE_2'
}

export type StrLiteral = 'Foo' | 'Bar';

export interface AllTypesOptional {
    /**
     * @isInt
     */
    intValue?: number;

    /**
     * @isLong
     */
    longValue?: number;

    /**
     * @isFloat
     */
    floatValue?: number;

    /**
     * @isDouble
     */
    doubleValue?: number;

    /**
     * @isDate
     */
    dateValue?: Date;

    /**
     * @isDateTime
     */
    dateTimeValue?: Date;

    /**
     * @isBoolean
     */
    booleanValue?: boolean;

    enumNumberValue?: EnumNumberValue;

    enumStringValue?: EnumStringValue;

    strLiteral?: StrLiteral;
}

@Route('AllTypesOptional')
export class AllTypesOptionalController extends Controller {
    @Get()
    public async get(): Promise<AllTypesOptional> {
        throw "not implemented";
    }
}