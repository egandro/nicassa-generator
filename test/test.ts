import { RouteType } from '../lib/swagger/entites/routetype.class';
import { ApiParser } from './../lib/swagger/apiparser.class';
import { ApiDescription } from './../lib/swagger/entites/apidesciption.class';
import { ComplexType } from './../lib/swagger/entites/complextype.class';

main();

async function main() {

    let parser = new ApiParser();
    // let fileName = './test/alltypes/swagger.json';
    // let fileName = './test/alltypesarray/swagger.json';
    // let fileName = './test/alltypesoptional/swagger.json';
    // let fileName = './test/alltypesarrayoptional/swagger.json';
    let fileName = './test/complextypes/swagger.json';
    let api: ApiDescription = await parser.parseSwaggerFile(fileName);

    for (let k = 0; k < api.complexTypes.length; k++) {
        let type: ComplexType = api.complexTypes[k];
        // console.log(type.type);
        for (let p = 0; p < type.properties.length; p++) {
            let prop = type.properties[p];
           // console.log(prop);
            if (prop.name == null || prop.name === undefined || prop.name == '') {
                if (!prop.isMap && !prop.isArray && !prop.isEnum) {
                    console.log(type.type, prop);
                    throw "only map, array and enum properties can have an empty name";
                }
            }
        }
    }

    for (let k = 0; k < api.routes.length; k++) {
        let route: RouteType = api.routes[k];
        route = route;
       // console.log(route);
    }

    // console.log(api);

}
