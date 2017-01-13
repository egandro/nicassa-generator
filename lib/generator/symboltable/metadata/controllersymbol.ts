import { MethodSymbol } from './methodsymbol';

export interface ControllerSymbol {
    location: string;
    methods: MethodSymbol[];
    name: string;
    path: string;
    jwtUserProperty: string;
    getMappedLocation(): string;
}
