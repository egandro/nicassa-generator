const fs = require('fs');

import { Options } from 'swagger-parser';
import * as SwaggerParser from 'swagger-parser';

import { ApiDescription } from './entites/apidesciption.class';
import { ComplexType } from './entites/complextype.class';
import { PropertyType } from './entites/propertytype.class';
import { ParameterType } from './entites/parametertype.class';
import { ResponseType } from './entites/responsetype.class';
import { RouteType } from './entites/routetype.class';

export class ApiParser {
    private definitionsDict: any = {};

    public async parseSwaggerFile(fileName: string): Promise<ApiDescription> {
        let swagger: any = await this.readAndValidateSwaggerFileToString(fileName);

        if (swagger.swagger != "2.0") {
            console.log("not supported version", swagger.swagger);
        }

        this.definitionsDict = {};
        let result: ApiDescription = new ApiDescription();
        if (swagger.definitions != null || swagger.definitions !== undefined) {
            result.complexTypes = this.parseDefinitions(swagger.definitions);
        }

        result.routes = this.parseRoutes(swagger.paths);

        return await result;
    }

    private parseRoutes(paths: any): RouteType[] {
        let result: RouteType[] = [];

        for (let path in paths) {
            let data = paths[path];
            result.push(this.parseRoute(path, data));
        }
        return result;
    }

    private parseRoute(path: string, data: any): RouteType {
        let route: RouteType = new RouteType();
        route.path = path;

        for (let verb in data) {
            if (data.hasOwnProperty(verb)) {
                route.verb = verb;
                let operation = data[verb];

                route.operationId = operation.operationId;

                if (operation.responses != null &&
                    operation.responses !== undefined) {
                    //console.log(operation.responses);
                    let responses = this.parseResponses(operation.responses);
                    route.response = responses;
                }

                if (operation.parameters != null &&
                    operation.parameters !== undefined &&
                    operation.parameters.length > 0) {
                    //console.log(operation);
                    let parameters = this.parseParameters(operation.parameters);
                    route.parameter = parameters;
                }

                if (operation.security != null &&
                    operation.security !== undefined&&
                    operation.security.length > 0) {
                    for (let i = 0; i < operation.security.length; i++) {
                        let item: any = operation.security[i];
                        if (item.hasOwnProperty('jwt')) {
                            route.security = 'jwt';
                        }
                    }
                }
            }
            // this must be here - only one verb!
            break;
        }
        return route;
    }

    private parseResponses(responses: any): ResponseType[] {
        let result: ResponseType[] = [];

        for (let code in responses) {
            if (responses.hasOwnProperty(code)) {
                let data = responses[code];

                let response = ResponseType.createFromResponse(data);
                response.statusCode = code;

                if (response.isReference) {
                    if (response.$ref === null || response.$ref === undefined
                        || response.$ref.length < 1) {
                        console.log(response);
                        throw `error: '${response.name}' response has unknown complex type`;
                    }
                    let ref = response.$ref;
                    let arr = ref.split('/');
                    let resolvedType = arr[arr.length - 1];
                    resolvedType = this.definitionsDict[resolvedType].complexNameUnique;
                    response.type = <any>resolvedType;
                    delete response.$ref; // kill this
                }

                result.push(response);
            }
        }

        return result;
    }

    private parseParameters(parameters: any[]): ParameterType[] {
        let result: ParameterType[] = [];

        for (let k = 0; k < parameters.length; k++) {
            let data = parameters[k];

            let parameter = ParameterType.createFromParameter(data);

            if (parameter.isReference) {
                if (parameter.$ref === null || parameter.$ref === undefined
                    || parameter.$ref.length < 1) {
                    console.log(parameter);
                    throw `error: '${parameter.name}' parameter has unknown complex type`;
                }
                let ref = parameter.$ref;
                let arr = ref.split('/');
                let resolvedType = arr[arr.length - 1];
                resolvedType = this.definitionsDict[resolvedType].complexNameUnique;
                parameter.type = <any>resolvedType;
                delete parameter.$ref; // kill this
            }

            result.push(parameter);
        }

        return result;
    }

    private parseDefinitions(definitions: any): ComplexType[] {
        let result: ComplexType[] = [];

        // create type dictionary for easy access
        for (let entity in definitions) {
            if (definitions.hasOwnProperty(entity)) {
                let definition = definitions[entity];
                this.definitionsDict[entity] = definition;
            }
        }

        // unify the names - we might have complex type names with . and []
        for (let entity in this.definitionsDict) {
            if (this.definitionsDict.hasOwnProperty(entity)) {
                let replacement = '_';
                let uniqueName = entity;
                let regEx = new RegExp('\\.', 'gi');
                while (true) {
                    uniqueName = entity.replace(regEx, replacement);
                    // console.log("NewName", entity, uniqueName);
                    if (entity === uniqueName) {
                        break;
                    }
                    replacement = replacement + '_';
                    if (!this.definitionsDict.hasOwnProperty(uniqueName)) {
                        break;
                    }
                }

                // bug in tsoa
                regEx = new RegExp('\\[\]', 'gi');
                while (true) {
                    uniqueName = uniqueName.replace(regEx, replacement);
                    // console.log("NewName", entity, uniqueName);
                    if (entity === uniqueName) {
                        break;
                    }
                    replacement = replacement + '_';
                    if (!this.definitionsDict.hasOwnProperty(uniqueName)) {
                        break;
                    }
                }

                this.definitionsDict[entity].complexName = entity;
                this.definitionsDict[entity].complexNameUnique = uniqueName;
            }
        }

        // get the properties
        for (let entity in this.definitionsDict) {
            if (this.definitionsDict.hasOwnProperty(entity)) {
                let definition = this.definitionsDict[entity];
                let propertyTypes = this.parseProperties(entity, definition);
                this.definitionsDict[entity].propertyTypes = propertyTypes;
            }
        }

        // we might have unresolved complex types
        for (let entity in this.definitionsDict) {
            if (this.definitionsDict.hasOwnProperty(entity)) {
                let definition = this.definitionsDict[entity];
                let complexType: ComplexType = new ComplexType();
                complexType.name = entity;
                complexType.type = this.definitionsDict[entity].complexNameUnique; // map
                for (let k = 0; k < definition.propertyTypes.length; k++) {
                    let propertyType: PropertyType = definition.propertyTypes[k];
                    if (propertyType.isReference) {
                        if (propertyType.$ref === null || propertyType.$ref === undefined
                            || propertyType.$ref.length < 1) {
                            console.log(entity, propertyType);
                            throw `error: '${entity}' property '${propertyType.name}' has unknown complex type`;
                        }
                        let ref = propertyType.$ref;
                        let arr = ref.split('/');
                        let resolvedType = arr[arr.length - 1];

                        resolvedType = this.definitionsDict[resolvedType].complexNameUnique;  // map
                        this.definitionsDict[entity].propertyTypes[k].type = resolvedType;
                        delete this.definitionsDict[entity].propertyTypes[k].$ref; // kill this
                    }
                    complexType.properties.push(propertyType);
                }
                result.push(complexType);
            }
        }

        return result;
    }

    private parseProperties(entityName:string, definition: any): PropertyType[] {
        let result: PropertyType[] = [];

        if (definition.type !== "object") {
            throw "parseProperties is only supported for object types";
        }

        // get required fields
        let isRequiredArr: string[] = [];
        if (definition.required != null && definition.required !== undefined) {
            isRequiredArr = definition.required;
        }

        if (definition.properties == null ||
            definition.properties === undefined ||
            Object.keys(definition.properties).length === 0) {

            // we have no properties specified
            // do wild guesses and hallucinations...

            if (definition.additionalProperties != null && definition.additionalProperties !== undefined) {
                if (definition.additionalProperties.$ref != null && definition.additionalProperties.$ref !== undefined) {
                    console.log(`notice: type '${entityName}' making assumption that this is a Map<String,Object>`);
                    result.push(PropertyType.createRefMap(definition.additionalProperties.$ref));
                } else if (definition.additionalProperties.type != null && definition.additionalProperties.type !== undefined) {
                    console.log(`notice: type '${entityName}' making assumption that this is a Map<String,Object>`);
                    let prop = PropertyType.createFromType(entityName, definition.additionalProperties);
                    prop.isMap = true;
                    result.push(prop);
                } else {
                    throw `error: '${entityName}' additional properties found - but don't know how to handle: ` + definition.additionalProperties;
                }
            } else {
                console.log(`notice: type '${entityName}' making assumption that this is a Map<String,String>`);
                result.push(PropertyType.createStringMap());
            }
        } else {
            for (let name in definition.properties) {
                if (definition.properties.hasOwnProperty(name)) {
                    let prop = definition.properties[name];
                    let propType: PropertyType;
                    if (prop.type != null && prop.type !== undefined) {
                        // console.log(entityName, name, prop);
                        propType = PropertyType.createFromType(entityName, prop, name, isRequiredArr);
                    } else if (prop.$ref != null && prop.$ref !== undefined) {
                        propType = PropertyType.createRef(prop.$ref, name, isRequiredArr);
                    } else {
                        console.log(entityName, name, prop);
                        throw "not implemented";
                    }
                    if (prop.hasOwnProperty('maxLength')) {
                        propType.maxLength = prop['maxLength'];
                    }
                    if (prop.hasOwnProperty('minLength')) {
                        propType.minLength = prop['minLength'];
                    }
                    if (prop.hasOwnProperty('pattern')) {
                        propType.pattern = prop['pattern'];
                    }
                    result.push(propType);
                }
            }
        }

        return result;
    }

    private async readAndValidateSwaggerFileToString(fileName: string): Promise<any> {
        let options = {
            $refs: {
                circular: 'ignore' // Don't expand circular $refs
            }
        }
        let instance = await SwaggerParser.validate(fileName, <Options>options);
        if (instance == null || instance === undefined) {
            // something bad happened
            return await <any>null;
        }
        console.log('swagger file is valid...');

        // note: we read the json to an object and go freestyle here
        // the swaggerparser kills some informations :(

        const str = fs.readFileSync(fileName, 'utf-8');
        let result = JSON.parse(str);

        return result;
    }
}
