import envPaths from 'env-paths';
import path from 'path';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { isDev } from '../utils/dev.js';

// Recreate __dirname for ES Modules - from copilot
const __filename = fileURLToPath(import.meta.url).replace('/dist', '');
const projectRootDir = path.resolve(path.dirname(__filename), '..');

type JSONPrimitive = string | number | boolean | null | undefined;

export type JSONValue =
    | JSONPrimitive
    | JSONValue[]
    | {
          [key: string]: JSONValue;
      };

interface PreflightResult {
    filepath: string;
}

const preflight = (config: ServiceConfig): PreflightResult => {
    const paths = envPaths('gumption', { suffix: 'cli' });
    const dir = isDev ? path.join(projectRootDir, '.local-config') : paths.data;
    const dataFilePath = path.join(dir, config.filename);

    if (!existsSync(dataFilePath)) {
        mkdirSync(dir, { recursive: true });
    }

    return {
        filepath: dataFilePath,
    };
};

const write = (data: JSONValue, config: ServiceConfig) => {
    const { filepath } = preflight(config);
    writeFileSync(filepath, JSON.stringify(data, null, 2));
};

const read = (config: ServiceConfig): JSONValue => {
    const { filepath } = preflight(config);
    if (!existsSync(filepath)) return {};

    const fileData = readFileSync(filepath, 'utf-8');
    if (fileData === '') return {};
    return JSON.parse(fileData) as JSONValue;
};

export interface StoreService {
    write: (data: JSONValue) => void;
    read: () => JSONValue;
}

export interface ServiceConfig {
    filename: string;
}

export const createStoreService = (config: ServiceConfig): StoreService => {
    return {
        write: (data: JSONValue) => {
            return write(data, config);
        },
        read: () => {
            return read(config);
        },
    };
};
