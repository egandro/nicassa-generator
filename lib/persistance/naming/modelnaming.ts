import { EntityNaming } from './entitynaming';
import { PropertyNaming } from './propertynaming';

export interface ModelNaming {
    entityNaming: EntityNaming;
    propertyNaming: PropertyNaming;
}
