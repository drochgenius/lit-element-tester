#!/usr/bin/env node
import { Options } from 'mocha-headless-chrome';
import * as program from 'commander';
import { instrument, run } from './index';
import { serve } from './server';

program
    .version('0.0.1')
    .description('Run unit tests for custom elements in Google Chrome')
    .usage('<files...> [options]')
    .option('-f, --file [file]', 'html runner file path')
    .option('-d, --development', 'launch a real browser for test development')
    .option('-H --height [px]', 'browser window height in pixels', parseInt, 800)
    .option('-W, --width [px]', 'browser window width in pixels', parseInt, 600)
    .option('-T, --timeout [ms]', 'test timeout in milliseconds', parseInt, 120000)
    .option('-R, --reporter [name]', 'mocha reporter', 'text')
    .on('--help', function() {
        console.log(`
  Examples:
    
  (1) Run the test and collect coverage for all javascript files in dist/ folder.

    $ custom-element-tester dist/*.js -f test/index.html
        `)
    })
    .parse(process.argv);

const args: string[] = program.args;

console.log('args', args);
console.log('file', program.file);

(async (): Promise<void> => {
    const options: Options = {
        file: program.file || 'test/runner.html', // test page path
        reporter: program.reporter || 'text', // mocha reporter name
        width: program.width || 800, // viewport width
        height: program.height || 600, // viewport height
        timeout: program.timeout || 120000, // timeout in ms
        args: ['no-sandbox'] // chrome arguments
    };

    // Generate instrumented files for coverage
    if (args) {
        await instrument(args);
    }

    // Run the tests
    if (program.development) {
        serve(program.file);
    } else {
        await run(options);
    }
})();
