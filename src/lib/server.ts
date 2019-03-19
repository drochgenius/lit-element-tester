import * as assert from 'assert';
import { extname } from 'path';
import { existsSync, readFileSync } from 'fs';
import { sync } from 'globby';
import { BaseServer as Parent } from '@hmh/nodejs-base-server';
import { ImportMapGenerator } from '@hmh/nodejs-base-server/dist/server/util/ImportMapGenerator';
import { instrument } from './index';

class Server extends Parent {
    private instrumentedFiles: string[];

    public async configureAndStart(config: { [key: string]: any }, configMode?: string, port?: string, persistent: boolean = false): Promise<void> {
        this.instrumentedFiles = process.env.RUNTIME_MODE === 'debug' ? [] : sync(config[configMode].LitElementTester.instrumentedFiles);
        if (this.instrumentedFiles) {
            instrument(this.instrumentedFiles, persistent);
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
        const path: string = ['.spec', ''].includes(extname(url)) ? url + '.js' : url;

        if (!url.includes('node_modules') && this.instrumentedFiles.some(file => file.endsWith(path))) {
            return path.replace(/\.js$/, '.$.js');
        }
        return path;
    }
}

const instance: Server = new Server();

export async function startServer(config: string, persistent: boolean, port: string, mode: string = 'dev') {
    assert(config, 'You must provide a server configuration file, see src/server/config.json for an example.');
    assert(existsSync(config), `The configuration file does not exist: ${config}`);

    const content: string = readFileSync(config, 'utf8');
    const appConfig: any = JSON.parse(content);
    assert(appConfig[mode], `Server mode ${mode} is not available from configuration file: ${config}`);

    console.log('Server configuration file:', config);
    console.log('Server mode:', mode);
    console.log('Server root directory:', process.cwd());
    appConfig[mode].NodeServer.defaultClientContentPath = appConfig[mode].LitElementTester.testClientContentPath;
    appConfig[mode].NodeServer.disableLogging = appConfig[mode].LitElementTester.disableLogging ? true : false;
    await instance.configureAndStart(appConfig, mode, port, persistent);
}

export function stopServer() {
    instance.stop();
}
