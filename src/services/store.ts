import envPaths from 'env-paths';
import path from 'path';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';

type JSONPrimitive = string | number | boolean | null | undefined;

type JSONValue =
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
    const dataFilePath = path.join(paths.data, config.filename);

    if (!existsSync(dataFilePath)) {
        mkdirSync(paths.data, { recursive: true });
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
    const fileData = readFileSync(filepath, 'utf-8');
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
