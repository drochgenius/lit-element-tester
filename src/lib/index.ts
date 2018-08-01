import { Options, Run, runner } from 'mocha-headless-chrome';
import * as istanbul from 'istanbul';
import { readFileSync, writeFileSync } from 'fs';
// @ts-ignore
import { remap, writeReport } from 'remap-istanbul';

process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at:', p, 'reason:', reason);
    // application specific logging, throwing an error, or other logic here
});

const instrumenter: istanbul.Instrumenter = new istanbul.Instrumenter();
const reporter: istanbul.Reporter = new istanbul.Reporter();

/**
 * Instrument Javascript files for code coverage reporting
 *
 * @param files : a list of javascript files to instrument with Istanbul
 */
export async function instrument(files: string[] = []) {
    for (const sourceFile of files) {
        if (!sourceFile.includes('$')) {
            const instrumentedFile = sourceFile.replace(/\.js$/, '.$.js');
            const code: string = readFileSync(sourceFile, 'utf8');
            const instrumented: string = instrumenter.instrumentSync(code, sourceFile);
            writeFileSync(instrumentedFile, instrumented, 'utf8');
        }
    }
}

function exclude(file: string): boolean {
    return file.includes('node_modules') || file.includes('bootstrap');
}

export async function run(options: Options): Promise<void> {
    const { coverage }: Run = await runner(options);
    const remappedCoverage: any = remap(coverage, { exclude });

    reporter.add('text');
    reporter.write(remappedCoverage, true, function() {
        console.log('done');
    });
}
