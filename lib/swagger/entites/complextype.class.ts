import { PropertyType } from './propertytype.class';

export class ComplexType extends PropertyType {
    properties: PropertyType[] = [];
    constructor() {
        super();
        this.isPrimitive = false;
    }
}