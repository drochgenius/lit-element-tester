import { Options, Run, runner } from 'mocha-headless-chrome';

const options: Options = {
    file: 'test/runner.html', // test page path
    reporter: 'text', // mocha reporter name
    width: 800, // viewport width
    height: 600, // viewport height
    timeout: 120000, // timeout in ms
    args: ['no-sandbox'] // chrome arguments
};

process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at:', p, 'reason:', reason);
    // application specific logging, throwing an error, or other logic here
});

(async (): Promise<void> => {
    const { coverage, result }: Run = await runner(options);
    const cov: string = JSON.stringify(coverage);
    const json: string = JSON.stringify(result);
    console.log(cov, json);
})();
