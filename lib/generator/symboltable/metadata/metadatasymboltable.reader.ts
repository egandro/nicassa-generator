import { Metadata, Type, InjectType, PrimitiveType, ArrayType, ReferenceType, Parameter, Property, NicassaParserTSExpressApi } from 'nicassa-parser-ts-express-api';

import { TopLevel } from '../../../persistance/toplevel';

import { MetadataSymbolTable } from './metadatasymboltable';
import { ControllerSymbol } from './controllersymbol';
import { MethodSymbol } from './methodsymbol';
import { TypeSymbol } from './typesymbol';
import { ParameterSymbol } from './parametersymbol';
import { InjectTypeSymbol } from './injecttypesymbol';
import { PropertySymbol } from './propertysymbol';
import { ReferenceTypeSymbol } from './referencetypesymbol';
import { PrimitiveTypeSymbol } from './primitivetypesymbol';
import { ArrayTypeSymbol } from './arraytypesymbol';

export class MetadataSymbolTableReader {
    public static readFromJsonString(json: string): MetadataSymbolTable {
        let metadata: Metadata = MetadataSymbolTableReader.readSchema(json);
        let result = MetadataSymbolTableReader.createSymbolTable(metadata);
        return result;
    }

    protected static readSchema(json: string): Metadata {
        let toplevel: TopLevel = JSON.parse(json);
        let nicassaParserTSExpressApi: NicassaParserTSExpressApi = <NicassaParserTSExpressApi>toplevel.nicassaParserTSExpressApi;
        if (nicassaParserTSExpressApi === undefined || nicassaParserTSExpressApi.metadata === undefined) {
            return <any>null;
        }

        return <Metadata>nicassaParserTSExpressApi.metadata;
    }

    protected static createSymbolTable(metadata: Metadata): MetadataSymbolTable {
        let result: MetadataSymbolTable = {
            controllers: [],
            referenceTypes: []
        }

        if (metadata === undefined || metadata === null) {
            return result;
        }

        let excludeControllers: boolean = false;
        let excludeReferenceTypes: boolean = false;
        let excludeMethods: string[] = [];
        let exculdes: string[] = [];
        let only: string[] = [];

        if (metadata.Controllers !== undefined && !excludeControllers) {
            for (let i = 0; i < metadata.Controllers.length; i++) {
                let ctrl = metadata.Controllers[i];

                // excluded
                if (only.length == 0 && exculdes.indexOf(ctrl.name) != -1) {
                    continue;
                }
                if (only.length > 0 && only.indexOf(ctrl.name) == -1) {
                    continue;
                }

                let controllerSymbol: ControllerSymbol = {
                    location: ctrl.location,
                    methods: [],
                    name: ctrl.name,
                    path: ctrl.path,
                    jwtUserProperty: ctrl.jwtUserProperty,
                    getMappedLocation: (): string => {
                        if (controllerSymbol.location === undefined || controllerSymbol.location === null) {
                            return controllerSymbol.location
                        }
                        return controllerSymbol.location.replace(/\.[^/.]+$/, "");
                    }
                }
                result.controllers.push(controllerSymbol);

                if (ctrl.methods === undefined || ctrl.methods === null) {
                    continue;
                }

                for (let k = 0; k < ctrl.methods.length; k++) {
                    let method = ctrl.methods[k];

                    // excluded
                    if (excludeMethods.indexOf(method.name) != -1) {
                        continue;
                    }
                    if (excludeMethods.indexOf(ctrl.name + '.' + method.name) != -1) {
                        continue;
                    }

                    let methodSymbol: MethodSymbol = {
                        controller: controllerSymbol,
                        description: method.description,
                        example: method.example,
                        method: method.method,
                        name: method.name,
                        parameters: [],
                        path: method.path,
                        type: <any>null,
                        tags: method.tags,
                        bodyParamName: <any>null,
                        getPath: (): string => {
                            if (methodSymbol.path === undefined || methodSymbol.path === null) {
                                return methodSymbol.path
                            }
                            return methodSymbol.path.replace(/{/g, ':').replace(/}/g, '');
                        }
                    }

                    const bodyParameter = method.parameters.find(parameter => parameter.in === 'body');
                    methodSymbol.bodyParamName = bodyParameter ? bodyParameter.name : undefined;

                    methodSymbol.type = MetadataSymbolTableReader.createTypeSymbol(method.type, controllerSymbol, methodSymbol);
                    MetadataSymbolTableReader.createParameterSymbols(controllerSymbol, methodSymbol, method.parameters);

                    controllerSymbol.methods.push(methodSymbol);
                }
            }
        }

        if (metadata.ReferenceTypes !== undefined && !excludeReferenceTypes) {
            for (let key in metadata.ReferenceTypes) {
                let referenceType = metadata.ReferenceTypes[key];

                // excluded
                if (only.length == 0 && exculdes.indexOf(referenceType.name) != -1) {
                    continue;
                }
                if (only.length > 0 && only.indexOf(referenceType.name) == -1) {
                    continue;
                }
                if (exculdes.length > 0 && exculdes.indexOf(referenceType.name) > -1) {
                    continue;
                }

                let referenceTypeSymbol: ReferenceTypeSymbol = {
                    controller: <any>null,
                    parameter: <any>null,
                    method: <any>null,
                    isPrimitive: false,
                    isArray: false,
                    isReferenceType: true,
                    description: referenceType.description,
                    name: referenceType.name,
                    properties: []
                }
                referenceTypeSymbol.properties = MetadataSymbolTableReader.createProperties(referenceTypeSymbol, referenceType.properties);
                result.referenceTypes.push(referenceTypeSymbol);
            }
        }
        return result;
    }

    protected static createProperties(referenceTypeSymbol: ReferenceTypeSymbol, properties: Property[]): PropertySymbol[] {
        let result: PropertySymbol[] = [];
        if (properties === undefined || properties === null || properties.length == 0) {
            return result;
        }

        for (let i = 0; i < properties.length; i++) {
            let property = properties[i];

            let propertySymbol: PropertySymbol = {
                reference: referenceTypeSymbol,
                description: property.description,
                name: property.name,
                length: -1,
                type: <any>null,
                required: property.required
            }
            propertySymbol.type = MetadataSymbolTableReader.createTypeSymbol(property.type);
            result.push(propertySymbol);
        }

        return result;
    }

    protected static createParameterSymbols(controllerSymbol: ControllerSymbol, methodSymbol: MethodSymbol, parameters: Parameter[]) {
        if (parameters === undefined || parameters === null || parameters.length == 0) {
            return;
        }

        for (let k = 0; k < parameters.length; k++) {
            let parameter = parameters[k];
            let parameterSymbol: ParameterSymbol = {
                controller: controllerSymbol,
                method: methodSymbol,
                description: parameter.description,
                in: parameter.in,
                name: parameter.name,
                required: parameter.required,
                type: <any>null,
                injected: undefined
            };

            parameterSymbol.type = MetadataSymbolTableReader.createTypeSymbol(parameter.type, controllerSymbol, methodSymbol, parameterSymbol);
            parameterSymbol.injected = MetadataSymbolTableReader.createInjectedSymbol(parameterSymbol, <any>parameter.injected);
            methodSymbol.parameters.push(parameterSymbol);
        }
    }

    protected static createInjectedSymbol(parameterSymbol: ParameterSymbol, injectType: InjectType): InjectTypeSymbol {
        if (injectType === null || injectType === undefined) {
            return <any>undefined;
        }

        let result: InjectTypeSymbol = {
            parameter: parameterSymbol,
            typeName: injectType
        };

        return result;
    }

    protected static createPrimitiveTypeSymbol(type: PrimitiveType, controllerSymbol?: ControllerSymbol, methodSymbol?: MethodSymbol, parameterSymbol?: ParameterSymbol): PrimitiveTypeSymbol {
        let result: PrimitiveTypeSymbol = {
            controller: controllerSymbol,
            method: methodSymbol,
            parameter: parameterSymbol,
            isPrimitive: true,
            isArray: false,
            isReferenceType: false,
            name: type
        }
        return result;
    }

    protected static createArrayTypeSymbolSymbol(type: ArrayType, controllerSymbol?: ControllerSymbol, methodSymbol?: MethodSymbol, parameterSymbol?: ParameterSymbol): ArrayTypeSymbol {
        let result: ArrayTypeSymbol = {
            controller: controllerSymbol,
            method: methodSymbol,
            parameter: parameterSymbol,
            isPrimitive: false,
            isArray: true,
            isReferenceType: false,
            elementType: <any>null
        }
        result.elementType = MetadataSymbolTableReader.createTypeSymbol(type.elementType, controllerSymbol, methodSymbol, parameterSymbol);
        return result;
    }

    protected static createReferenceTypeSymbol(type: ReferenceType, controllerSymbol?: ControllerSymbol, methodSymbol?: MethodSymbol, parameterSymbol?: ParameterSymbol): ReferenceTypeSymbol {
        let result: ReferenceTypeSymbol = {
            controller: controllerSymbol,
            method: methodSymbol,
            parameter: parameterSymbol,
            isPrimitive: false,
            isArray: false,
            isReferenceType: true,
            description: type.description,
            name: type.name,
            properties: []
        }

        result.properties = MetadataSymbolTableReader.createProperties(result, type.properties);
        return result;
    }

    protected static createTypeSymbol(type: Type, controllerSymbol?: ControllerSymbol, methodSymbol?: MethodSymbol, parameterSymbol?: ParameterSymbol): TypeSymbol {
        if (typeof type === 'string' || type instanceof String) {
            return MetadataSymbolTableReader.createPrimitiveTypeSymbol(<PrimitiveType>type, controllerSymbol, methodSymbol, parameterSymbol);
        }

        const arrayType = type as ArrayType;
        if (arrayType.elementType) {
            return MetadataSymbolTableReader.createPrimitiveTypeSymbol(<any>type, controllerSymbol, methodSymbol, parameterSymbol);
        }

        return MetadataSymbolTableReader.createReferenceTypeSymbol((type as ReferenceType), controllerSymbol, methodSymbol, parameterSymbol);
    }
}
