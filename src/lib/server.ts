import { startServers, ServerOptions, RequestHandler } from 'polyserve';
import { NextFunction } from '../../node_modules/@types/express';

export interface IServerOptions {
    baseDir?: string;
    index: string;
    open?: boolean;
    port?: number;
    additionalRoutes?: Map<string, RequestHandler>;
}

export function defineAdditionalRoutes(args: string[]): Map<string, RequestHandler> {
    const additionalRoutes = new Map<string, RequestHandler>();

    additionalRoutes.set('*.js', (req: any, res: any, next: NextFunction) => {
        if (args.some((arg: string) => req.url.includes(arg))) {
            req.url = req.url.replace('.js', '.$.js');
        }
        next();
    });

    return additionalRoutes;
}

export async function serve({ index, baseDir = '.', open = false, port, additionalRoutes }: IServerOptions): Promise<void> {
    const options: ServerOptions = {
        compile: 'never',
        /** The root directory to serve **/
        root: baseDir,
        /**
         * The path on disk of the entry point HTML file that will be served for
         * app-shell style projects. Must be contained by `root`. Defaults to
         * `index.html`.
         */
        openPath: index,
        /** Resolution algorithm to use for rewriting module specifiers */
        moduleResolution: 'node',
        /** The port to serve from */
        port,
        /** Whether to open the browser when run **/
        open,
        /**
         * Sets npm mode: component directory is 'node_modules' and the package name
         * is read from package.json.
         */
        npm: true,
        /**
         * Middleware
         */
        additionalRoutes
    };

    await startServers(options);
}
