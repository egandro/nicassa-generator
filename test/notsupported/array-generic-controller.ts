import { Get, Controller, Route } from 'tsoa';

// THIS IS NOT SUPPORTED!!!

throw "this is not supported by tsoa!"

export interface AllTypesArrayOtherNotation {
    /**
     * @isInt
     */
    intValue: Array<number>;

    /**
     * @isLong
     */
    longValue: Array<number>;

    /**
     * @isFloat
     */
    floatValue: Array<number>;

    /**
     * @isDouble
     */
    doubleValue: Array<number>;

    /**
     * @isDate
     */
    dateValue: Array<Date>;

    /**
     * @isDateTime
     */
    dateTimeValue: Array<Date>;

    /**
     * @isBoolean
     */
    booleanValue: Array<boolean>;
}

@Route('AllTypesArrayOtherNotation')
export class AllTypesArrayOtherNotationController extends Controller {
    @Get()
    public async get(): Promise<AllTypesArrayOtherNotation> {
        throw "not implemented";
    }
}