import { ComplexType } from './complextype.class';
import { ControllerType } from './controllertype.class';

export class ApiDescription {
    complexTypes: ComplexType[] = [];
    controllers: ControllerType[] = [];
}