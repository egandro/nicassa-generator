import { Get, Controller, Route } from 'tsoa';

export enum EnumNumberValue {
  VALUE_1, VALUE_2
}

export enum EnumStringValue {
  VALUE_1 = <any>'VALUE_1', VALUE_2 = <any>'VALUE_2'
}

export type StrLiteral = 'Foo' | 'Bar';

export interface AllTypesArray {
    /**
     * @isInt
     */
    intValueArr: number[];

    /**
     * @isLong
     */
    longValueArr: number[];

    /**
     * @isFloat
     */
    floatValueArr: number[];

    /**
     * @isDouble
     */
    doubleValueArr: number[];

    /**
     * @isDate
     */
    dateValueArr: Date[];

    /**
     * @isDateTime
     */
    dateTimeValueArr: Date[];

    /**
     * @isBoolean
     */
    booleanValueArr: boolean[];

    enumNumberValueArr: EnumNumberValue[];

    enumStringValueArr: EnumStringValue[];

    strLiteralArr: StrLiteral[];
}

@Route('AllTypesArray')
export class AllTypesArrayController extends Controller {
    @Get()
    public async get(): Promise<AllTypesArray> {
        throw "not implemented";
    }
}