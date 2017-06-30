import * as parser from 'nomnom';

export class CmdLineParser {
    public static parse(): any {
        parser.command('init')
            .option('file', {
                abbr: 'f',
                metavar: 'sdb.json',
                required: true,
                help: 'path for to a typescript-mdd config file [required]'
            })
            .help('creates a new nicassa-generator config file or adds a section to an existing json file');

        parser.command('addgen')
            .option('file', {
                abbr: 'f',
                metavar: 'nicassa.json',
                required: true,
                help: 'path to a nicassa-generator config file [required]'
            })
            .option('type', {
                abbr: 't',
                metavar: 'generator',
                required: true,
                help: 'type of the generator (sequelize.ts.dal, angular.client, unirest.ts.client, android.ormlite.dal, android.retrofit.client)'
            })
            .option('name', {
                abbr: 'n',
                metavar: 'name',
                help: 'optional name of the generator - the default name is the generator typename - every name must be unique'
            })
            .help('adds generator to a given typescript-mdd config file');

        parser.command('gen')
            .option('file', {
                abbr: 'f',
                metavar: 'nicassa.json',
                required: true,
                help: 'path to a nicassa-generator config file [required]'
            })
            .option('name', {
                abbr: 'n',
                metavar: 'name',
                help: 'only run the code generator with the given name - this can also be an inactive generator'
            })
            .help('runs a generator in a given nicassa-generator config file - if no name is given, all active generators will be started');


        var opts = parser.parse();
        var action = null;

        if (opts[0] === undefined || opts[0] === '') {
            action = null;
        } else {
            action = {
                module: '../lib/actions/' + opts[0],
                opts: opts
            };
        }

        return action;
    }
}
