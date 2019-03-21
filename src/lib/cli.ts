#!/usr/bin/env node
import { Options } from 'mocha-headless-chrome';

import { readFileSync } from 'fs';
import { join } from 'path';
import * as program from 'commander';
import { run } from './index';
import { startServer, stopServer } from './server';

const json: string = readFileSync(join(__dirname, '../../package.json'), 'utf8');
const { version }: any = JSON.parse(json);

program
    .version(version)
    .description(`Lit Element Tester v${version}`)
    .usage('<files...> [options]')
    .option('-d, --development', 'launch a real browser for test development')
    .option('-f, --file [file]', 'html runner file path', 'test/runner.html')
    .option('-H --height [px]', 'browser window height in pixels', 800)
    .option('-W, --width [px]', 'browser window width in pixels', 600)
    .option('-T, --timeout [ms]', 'test timeout in milliseconds', 0)
    .option('-R, --reporter [name]', 'mocha reporter', 'text')
    .option('-p, --port [number]', 'server port', 3000)
    .on('--help', function() {
        console.log(`
  Run unit tests for custom elements in the Chrome browser.
  It uses the @hmh/nodejs-base-server to serve your application,
  so you must provide a valid server configuration file (server-config.json)

  Examples:
    
  (1) Run the test and collect coverage for all javascript files in dist/ folder.

    $ lit-element-tester server-config.json -f test/index.html
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
    const configFile: string = args[0];
    console.log('CONFIG FILE', configFile);

    // Run the tests
    if (program.development) {
        process.env.RUNTIME_MODE = 'debug';
        await startServer(configFile, true, program.port);
    } else {
        await startServer(configFile, false, program.port);
        await run(options);
        stopServer();
    }
})().catch((err: Error) => {
    console.error('Failed to run tests with options: ', JSON.stringify(options));
    console.error(err);
    stopServer();
    process.exit(1);
});
