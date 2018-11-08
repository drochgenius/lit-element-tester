import * as assert from 'assert';
import { existsSync, readFileSync } from 'fs';
import { sync } from 'globby';
import { BaseServer as Parent, ImportMapGenerator } from '@hmh/nodejs-base-server';
import { instrument } from './index';

class Server extends Parent {
    private instrumentedFiles: string[];

    public async configureAndStart(config: { [key: string]: any }, configMode?: string, port?: string): Promise<void> {
        this.instrumentedFiles = sync(config[configMode].LitElementTester.instrumentedFiles);
        if (this.instrumentedFiles) {
            await instrument(this.instrumentedFiles);
            console.log('instrumented', this.instrumentedFiles);
        }
        // Generate import map
        const generator: ImportMapGenerator = new ImportMapGenerator(config[configMode]);
        await generator.process();
        // start server
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

export async function startServer(config: string, instrumented: string[], port: string, mode: string = 'dev') {
    assert(config, 'You must provide a server configuration file, see src/server/config.json for an example.');
    assert(existsSync(config), `The configuration file does not exist: ${config}`);

    const content: string = readFileSync(config, 'utf8');
    const appConfig: any = JSON.parse(content);
    assert(appConfig[mode], `Server mode ${mode} is not available from configuration file: ${config}`);

    console.log('Server configuration file:', config);
    console.log('Server mode:', mode);
    console.log('Server root directory:', process.cwd());
    await instance.configureAndStart(appConfig, mode, port);
}

export function stopServer() {
    instance.stop();
}
