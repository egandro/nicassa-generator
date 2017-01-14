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
                        description: method.description,
                        example: method.example,
                        method: method.method,
                        name: method.name,
                        parameters: [],
                        path: method.path,
                        type: <any>null,
                        tags: method.tags,
                        bodyParamName: <any>null,
                        getPath: (kind: string): string => {
                            if(kind === "Server") {
                                if (methodSymbol.path === undefined || methodSymbol.path === null) {
                                    return methodSymbol.path
                                }
                                return methodSymbol.path.replace(/{/g, ':').replace(/}/g, '');
                            }
                            if(kind === "Client") {
                                if (methodSymbol.path === undefined || methodSymbol.path === null) {
                                    return methodSymbol.path
                                }
                                return methodSymbol.path.replace(/{/g, '\' + this\.urlEncode(').replace(/}/g, ') + \'');
                            }
                            return methodSymbol.path;
                        },
                        needsBody: (): boolean => {
                            if (methodSymbol.method === 'post' ||
                                methodSymbol.method === 'patch' ||
                                methodSymbol.method === 'put') {
                                return true;
                            }
                            return false;
                        }
                    }

                    const bodyParameter = method.parameters.find(parameter => parameter.in === 'body');
                    methodSymbol.bodyParamName = bodyParameter ? bodyParameter.name : undefined;

                    methodSymbol.type = MetadataSymbolTableReader.createTypeSymbol(method.type);
                    MetadataSymbolTableReader.createParameterSymbols(methodSymbol, method.parameters);

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

                let referenceTypeSymbol = MetadataSymbolTableReader.createReferenceTypeSymbol(referenceType);
                referenceTypeSymbol.properties = MetadataSymbolTableReader.createProperties(referenceType.properties);
                result.referenceTypes.push(referenceTypeSymbol);
            }
        }
        return result;
    }

    protected static createProperties(properties: Property[]): PropertySymbol[] {
        let result: PropertySymbol[] = [];
        if (properties === undefined || properties === null || properties.length == 0) {
            return result;
        }

        for (let i = 0; i < properties.length; i++) {
            let property = properties[i];

            let propertySymbol: PropertySymbol = {
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

    protected static createParameterSymbols(methodSymbol: MethodSymbol, parameters: Parameter[]) {
        if (parameters === undefined || parameters === null || parameters.length == 0) {
            return;
        }

        for (let k = 0; k < parameters.length; k++) {
            let parameter = parameters[k];
            let parameterSymbol: ParameterSymbol = {
                description: parameter.description,
                in: parameter.in,
                name: parameter.name,
                required: parameter.required,
                type: <any>null,
                injected: undefined
            };

            parameterSymbol.type = MetadataSymbolTableReader.createTypeSymbol(parameter.type);
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

    protected static createPrimitiveTypeSymbol(type: PrimitiveType): PrimitiveTypeSymbol {
        let result: PrimitiveTypeSymbol = {
            isPrimitive: true,
            isArray: false,
            isReferenceType: false,
            getMappedName: (kind: string) => {
                if (result.name === undefined || result.name === null) {
                    return result.name;
                }
                if (result.name === 'datetime') {
                    return 'Date';
                }
                if (result.name === 'buffer') {
                    return 'Buffer';
                }
                return result.name;
            },
            name: type
        }
        return result;
    }

    protected static createArrayTypeSymbolSymbol(type: ArrayType): ArrayTypeSymbol {
        let result: ArrayTypeSymbol = {
            isPrimitive: false,
            isArray: true,
            isReferenceType: false,
            getMappedName: (kind: string) => {
                return "Array";
            },
            elementType: <any>null
        }
        result.elementType = MetadataSymbolTableReader.createTypeSymbol(type.elementType);
        return result;
    }

    protected static createReferenceTypeSymbol(type: ReferenceType): ReferenceTypeSymbol {
        let result: ReferenceTypeSymbol = {
            isPrimitive: false,
            isArray: false,
            isReferenceType: true,
            getMappedName: (kind: string) => {
                return result.name;
            },
            description: type.description,
            name: type.name,
            properties: []
        }

        result.properties = MetadataSymbolTableReader.createProperties(type.properties);
        return result;
    }

    protected static createTypeSymbol(type: Type): TypeSymbol {
        if (typeof type === 'string' || type instanceof String) {
            return MetadataSymbolTableReader.createPrimitiveTypeSymbol(<PrimitiveType>type);
        }

        const arrayType = type as ArrayType;
        if (arrayType.elementType) {
            return MetadataSymbolTableReader.createArrayTypeSymbolSymbol(<any>type);
        }

        return MetadataSymbolTableReader.createReferenceTypeSymbol((type as ReferenceType));
    }
}
