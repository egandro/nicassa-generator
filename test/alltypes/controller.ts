import { Get, Controller, Route } from 'tsoa';

export enum EnumNumberValue {
  VALUE_1, VALUE_2
}

export enum EnumStringValue {
  VALUE_1 = <any>'VALUE_1', VALUE_2 = <any>'VALUE_2'
}

export type StrLiteral = 'Foo' | 'Bar';

export interface AllTypes {
    /**
     * @isInt
     */
    intValue: number;

    /**
     * @isLong
     */
    longValue: number;

    /**
     * @isFloat
     */
    floatValue: number;

    /**
     * @isDouble
     */
    doubleValue: number;

    /**
     * @isDate
     */
    dateValue: Date;

    /**
     * @isDateTime
     */
    dateTimeValue: Date;

    /**
     * @isBoolean
     */
    booleanValue: boolean;

    enumNumberValue: EnumNumberValue;

    enumStringValue: EnumStringValue;

    strLiteral: StrLiteral;
}

@Route('AllTypes')
export class AllTypesController extends Controller {
    @Get()
    public async get(): Promise<AllTypes> {
        throw "not implemented";
    }
}