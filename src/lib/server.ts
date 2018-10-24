import * as assert from 'assert';
import { existsSync, readFileSync } from 'fs';
import { BaseServer as Parent } from '@hmh/nodejs-base-server';

class Server extends Parent {
    private instrumentedFiles: string[];

    public configureAndStart(config: { [key: string]: any }, instrumented: string[], configMode?: string, port?: string): void {
        this.instrumentedFiles = instrumented;
        this.start({}, this.updateConfig(config, port, this.getServerDirectory()));
    }

    protected hostname() {
        return 'localhost';
    }

    // Simple getter to allow injection at testing time
    private getServerDirectory(): string {
        return process.cwd();
    }

    // Simple getter to type the imported object and to allow injection at testing time
    private updateConfig(config: { [key: string]: any }, port: string, serverDirectory: string): { [key: string]: any } {
        const serverConfig: { [key: string]: any } = config[config.activeMode].NodeServer;
        // Port update
        if (port) {
            serverConfig.port = parseInt(port, 10);
        }
        // HTML of the SPA path update
        serverConfig.defaultClientContentPath = serverDirectory + '/' + serverConfig.defaultClientContentPath;
        // Static folder path update
        for (const folderMap of Object.keys(serverConfig.staticFolderMapping)) {
            serverConfig.staticFolderMapping[folderMap] = serverDirectory + '/' + serverConfig.staticFolderMapping[folderMap];
        }
        return config;
    }

    protected redirect(url: string): string {
        if (this.instrumentedFiles.some(file => url.includes(file.split('/').pop()))) {
            return url.replace(/\.js$/, '.$.js');
        } else {
            return url;
        }
    }
}

const instance: Server = new Server();

export function startServer(config: string, instrumented: string[], port: string, mode: string = 'dev') {
    console.log('CAlling server', 1);
    assert(config, 'You must provide a server configuration file, see src/server/config.json for an example.');
    assert(existsSync(config), `The configuration file does not exist: ${config}`);
    console.log('CAlling server', 2);

    const content: string = readFileSync(config, 'utf8');
    const appConfig: any = JSON.parse(content);
    assert(appConfig[mode], `Server mode ${mode} is not available from configuration file: ${config}`);

    console.log('Server configuration file:', config);
    console.log('Server mode:', mode);
    console.log('Server root directory:', process.cwd());
    console.log('instrumented', instrumented);
    instance.configureAndStart(appConfig, instrumented, mode, port);
}

export function stopServer() {
    instance.stop();
}
