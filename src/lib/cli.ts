#!/usr/bin/env node
import * as program from 'commander';
import { run } from './index';
import { serve } from './server';

program
    .version('0.1.0')
    .option('-d, --development', 'Add peppers')
    .parse(process.argv);

if (program.development) {
    serve();
} else {
    run();
}
