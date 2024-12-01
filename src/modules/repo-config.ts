import path from 'path';
import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { isDev } from '../utils/dev.js';

const REPO_CONFIG_FILENAME = '.gumption_repo_config';
const DEV_REPO_CONFIG_FILENAME = '.gumption_dev_repo_config';

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

const preflight = (): PreflightResult => {
    const gitDir = execSync('git rev-parse --absolute-git-dir')
        .toString()
        .trim();
    const dataFilePath = path.join(
        gitDir,
        isDev ? DEV_REPO_CONFIG_FILENAME : REPO_CONFIG_FILENAME
    );

    return {
        filepath: dataFilePath,
    };
};

const write = (data: JSONValue) => {
    const { filepath } = preflight();
    writeFileSync(filepath, JSON.stringify(data, null, 2));
};

const read = (): JSONValue => {
    const { filepath } = preflight();
    if (!existsSync(filepath)) return null;

    const fileData = readFileSync(filepath, 'utf-8');
    if (fileData === '') return null;
    return JSON.parse(fileData) as JSONValue;
};

interface GumptionConfig {
    rootBranchName: string;
}

const getConfig = (): Partial<GumptionConfig> => {
    return read() as Partial<GumptionConfig>;
};

const setConfig = (config: Partial<GumptionConfig>): void => {
    return write(config as JSONValue);
};

export const getGumptionRootBranchName = (): string | null => {
    return getConfig()?.rootBranchName ?? null;
};

export const setGumptionRootBranchName = ({
    rootBranchName,
}: {
    rootBranchName: string;
}): void => {
    setConfig({
        rootBranchName,
    });
};
