import { CmdLineParser } from './tools/cmdlineparser.class';
let args = CmdLineParser.parse();

if (args == null) {
    process.exit(0);
}

const action = require(args.module).default;
action(args.opts);

