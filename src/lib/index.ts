import { Options, Run, runner } from 'mocha-headless-chrome';
// @ts-ignore
import { remap, writeReport } from 'remap-istanbul';
import * as istanbul from 'istanbul';
// import { writeFileSync } from 'fs';
process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at:', p, 'reason:', reason);
    // application specific logging, throwing an error, or other logic here
});

// const collector = new istanbul.Collector();
const reporter: istanbul.Reporter = new istanbul.Reporter();

export async function run(file: string = 'test/runner.html'): Promise<void> {
    const options: Options = {
        file, // test page path
        reporter: 'text', // mocha reporter name
        width: 800, // viewport width
        height: 600, // viewport height
        timeout: 120000, // timeout in ms
        args: ['no-sandbox'] // chrome arguments
    };

    const { coverage }: Run = await runner(options);
    const remappedCoverage: any = remap(coverage);

    reporter.add('text');
    reporter.write(remappedCoverage, true, function() {
        console.log('All reports generated');
    });

    //  writeFileSync('coverage.json', JSON.stringify(coverage), 'utf8');

    // await writeReport(, 'json', 'coverage-final.json');
}
