import { Options, Run, runner } from 'mocha-headless-chrome';
import { copyFileSync } from 'fs';
// @ts-ignore
import { remap, writeReport } from 'remap-istanbul';
import * as cp from 'child_process';
import { promisify } from 'util';
import * as istanbul from 'istanbul';

const exec = promisify(cp.exec);

process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at:', p, 'reason:', reason);
    // application specific logging, throwing an error, or other logic here
});

// const instrumenter: istanbul.Instrumenter = createInstrumenter();
const reporter: istanbul.Reporter = new istanbul.Reporter();

/**
 * Instrument Javascript files for code coverage reporting
 *
 * @param files : a list of javascript files to instrument with Istanbul
 */
export async function instrument(files: string[] = []) {
    for (const sourceFile of files) {
        if (!sourceFile.includes('$')) {
            const instrumentedFile = sourceFile.replace('.js', '.$.js');
            const { stderr } = await exec(`nyc instrument ${sourceFile} temp/`);

            if (stderr) {
                throw new Error(`instrumentation error: ${stderr}`);
            }
            copyFileSync(`temp/${sourceFile}`, instrumentedFile);
            //writeFileSync(instrumentedFile, stdout, 'utf8');
        }
    }
}

function exclude(file: string): boolean {
    return file.includes('node_modules') || file.includes('bootstrap');
}

export async function run(options: Options): Promise<void> {
    const { coverage }: Run = await runner(options);
    if (coverage) {
        const remappedCoverage: any = remap(coverage, { exclude });
        reporter.add('text');

        await new Promise((resolve, reject) => {
            try {
                reporter.write(remappedCoverage, true, () => resolve());
            } catch (e) {
                reject(e);
            }
        });
    } else {
        console.warn('NOTICE: code coverage could not be computed');
    }
}
