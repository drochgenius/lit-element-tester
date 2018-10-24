#!/usr/bin/env node
import { Options } from 'mocha-headless-chrome';
import { resolve } from 'path';
import * as program from 'commander';
import { instrument, run } from './index';
import { startServer, stopServer } from './server';

program
    .version('0.0.1')
    .description('Run unit tests for custom elements in Google Chrome')
    .usage('<files...> [options]')
    .option('-d, --development', 'launch a real browser for test development')
    .option('-f, --file [file]', 'html runner file path', 'test/runner.html')
    .option('-H --height [px]', 'browser window height in pixels', parseInt, 800)
    .option('-W, --width [px]', 'browser window width in pixels', parseInt, 600)
    .option('-T, --timeout [ms]', 'test timeout in milliseconds', parseInt, 600000)
    .option('-R, --reporter [name]', 'mocha reporter', 'text')
    .option('-p, --port [number]', 'server port', parseInt, 3000)
    .on('--help', function() {
        console.log(`
  Examples:
    
  (1) Run the test and collect coverage for all javascript files in dist/ folder.

    $ lit-element-tester dist/*.js -f test/index.html
        `);
    })
    .parse(process.argv);

const args: string[] = program.args;

console.log('file', program.file, `http://127.0.0.1:${program.port}/`);

const options: Options = {
    file: `http://127.0.0.1:${program.port}/${program.file}`, // test page path
    reporter: program.reporter, // mocha reporter name
    width: program.width, // viewport width
    height: program.height, // viewport height
    args: ['no-sandbox'], // chrome arguments
    timeout: program.timeout // timeout in ms
};

if (process.env.CHROME_EXECUTABLE_PATH) {
    options.executablePath = process.env.CHROME_EXECUTABLE_PATH;
}

(async (): Promise<void> => {
    // Generate instrumented files for coverage
    if (args) {
        await instrument(args);
    }

    // Run the tests
    const configFile: string = `${resolve(__dirname, '../..')}/server-config.json`;
    if (program.development) {
        startServer(configFile, args, program.port);
    } else {
        startServer(configFile, args, program.port);
        await run(options);
        stopServer();
    }
})().catch((err: Error) => {
    console.error('Failed to run tests with options: ', JSON.stringify(options));
    console.error(err);
    stopServer();
    process.exit(1);
});
