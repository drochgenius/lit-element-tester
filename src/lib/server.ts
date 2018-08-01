import * as browserSync from 'browser-sync';

export function serve(index: string = 'test/runner.html', baseDir: string[] = ['.']) {
    const bs = browserSync.create();

    // Listen to change events on HTML and reload
    for (const dir of baseDir) {
        bs.watch(`${dir}/**/*.js`).on('change', () => {
            bs.reload();
        });
    }

    bs.init({
        server: { baseDir, index }
    });
}
