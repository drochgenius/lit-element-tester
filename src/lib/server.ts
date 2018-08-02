import * as browserSync from 'browser-sync';

export interface IServerOptions {
    baseDir?: string[];
    index: string;
    open?: boolean;
    port?: number;
}

export function serve({ index, baseDir = ['.'], open = false, port }: IServerOptions): browserSync.BrowserSyncInstance {
    const bs: browserSync.BrowserSyncInstance = browserSync.create();

    // Listen to change events on HTML and reload
    for (const dir of baseDir) {
        bs.watch(`${dir}/**/*.js`).on('change', () => {
            bs.reload();
        });
    }

    bs.init({
        server: { baseDir, index },
        open,
        port
    });

    return bs;
}
