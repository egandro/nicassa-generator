const changeCase = require('change-case');

import { ControllerType } from './entites/controllertype.class';
import { RouteType } from './entites/routetype.class';
import { ComplexType } from './entites/complextype.class';

export class ApiTools {
    // this is currently needed because tsoa flattens the controllers
    public static createControllersFromRoute(defaultControllerName: string, controllerNames: string[], routes: RouteType[]): ControllerType[] {
        let result: ControllerType[] = [];

        if (controllerNames == null || controllerNames === undefined || controllerNames.length == 0) {
            // we can't unflatten
            let ctrl: ControllerType = new ControllerType();
            ctrl.name = defaultControllerName;
            for (let r = 0; r < routes.length; r++) {
                let route = routes[r];
                route.operationId = changeCase.lowerCaseFirst(route.operationId);
                ctrl.routes.push(route);
            }

            result.push(ctrl);
            return result;
        }

        for (let c = 0; c < controllerNames.length; c++) {
            let controllerName = controllerNames[c];
            if (controllerName.toLowerCase().endsWith("controller")) {
                controllerName = controllerName.substring(0, controllerName.length - "controller".length);
            }

            let ctrl: ControllerType = new ControllerType();
            ctrl.name = controllerName;

            for (let r = 0; r < routes.length; r++) {
                let route = routes[r];
                if (route.operationId.startsWith(controllerName)) {
                    route.operationId = route.operationId.substring(controllerName.length);
                    route.operationId = changeCase.lowerCaseFirst(route.operationId);
                    ctrl.routes.push(route);
                }
            }

            result.push(ctrl);
        }


        return result;
    }

    public static applyControllerFilter(exculdeController: string[], only: string[], controllers: ControllerType[]): ControllerType[] {
        if (controllers === undefined || controllers === null || controllers.length === 0) {
            return controllers;
        }

        if (exculdeController === undefined || exculdeController === null) {
            exculdeController = [];
        }

        if (only === undefined || only === null) {
            only = [];
        }

        let result: ControllerType[] = [];
        for (let k = 0; k < controllers.length; k++) {
            let ctrl = controllers[k];
            // excluded
            if (only.length == 0 && exculdeController.indexOf(ctrl.name) != -1) {
                continue;
            }
            if (only.length > 0 && only.indexOf(ctrl.name) == -1) {
                continue;
            }
            result.push(ctrl);
        }

        return result;
    }

    public static applyReferenceTypeFilter(exculdeEntity: string[], only: string[], referenceTypes: ComplexType[]): ComplexType[] {
        if (referenceTypes === undefined || referenceTypes === null || referenceTypes.length === 0) {
            return referenceTypes;
        }

        if (exculdeEntity === undefined || exculdeEntity === null) {
            exculdeEntity = [];
        }

        if (only === undefined || only === null) {
            only = [];
        }

        let result: ComplexType[] = [];
        for (let k = 0; k < referenceTypes.length; k++) {
            let entity = referenceTypes[k];
            // excluded
            if (only.length == 0 && exculdeEntity.indexOf(entity.name) != -1) {
                continue;
            }
            if (only.length > 0 && only.indexOf(entity.name) == -1) {
                continue;
            }
            result.push(entity);
        }

        return result;
    }
}
