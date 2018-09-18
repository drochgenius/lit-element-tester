import { Options, Run, runner } from 'mocha-headless-chrome';
import { loadCoverage, remap, writeReport } from 'remap-istanbul';
import { createReporter } from 'istanbul-api';
import { createCoverageMap } from 'istanbul-lib-coverage';
import { createInstrumenter } from 'istanbul-lib-instrument';
import { readFileSync, writeFileSync, unlinkSync } from 'fs';

process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at:', p, 'reason:', reason);
    // application specific logging, throwing an error, or other logic here
});

/**
 * Instrument Javascript files for code coverage reporting
 *
 * @param files : a list of javascript files to instrument with Istanbul
 */
export async function instrument(files: string[] = []) {
    const instrumenter: any = createInstrumenter({ esModules: true, produceSourceMap: true });

    for (const sourceFile of files) {
        if (!sourceFile.includes('$')) {
            const instrumentedFile = sourceFile.replace('.js', '.$.js');

            const code: string = readFileSync(sourceFile, 'utf8');

            const instrumentedCode: string = instrumenter.instrumentSync(code, sourceFile);
            writeFileSync(instrumentedFile, instrumentedCode, 'utf8');
        }
    }
}

export async function run(options: Options): Promise<void> {
    const { coverage }: Run = await runner(options);
    if (coverage) {
        const COVERAGE_FILE: string = 'coverage-final.json';
        const reporter: any = createReporter();
        const collector: string = remap(coverage);

        await writeReport(collector, 'json', COVERAGE_FILE);
        const remapped: string = await loadCoverage(COVERAGE_FILE);
        unlinkSync(COVERAGE_FILE);

        const map: string = createCoverageMap(remapped);
        reporter.addAll(['text']);
        reporter.write(map);
    } else {
        console.warn('NOTICE: code coverage could not be computed');
    }
}
