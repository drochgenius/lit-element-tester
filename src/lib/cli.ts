#!/usr/bin/env node
import * as program from 'commander';
import { run } from './index';
import { serve } from './server';

program
    .version('0.0.1')
    .option('-d, --development', 'launch a real browser for development')
    .parse(process.argv);

const args: string[] = program.args;

console.log('args', args);

if (program.development) {
    serve(args[0]);
} else {
    run(args[0]);
}
