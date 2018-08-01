import * as browserSync from 'browser-sync';

export function serve() {
    const bs = browserSync.create();

    // Listen to change events on HTML and reload
    bs.watch('dist/dev').on('change', () => {
        bs.reload();
    });

    bs.init({
        server: {
            baseDir: ['.'],
            index: 'test/runner.html'
        }
    });
}
