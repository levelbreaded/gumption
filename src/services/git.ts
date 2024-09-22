import { SimpleGit, SimpleGitOptions, simpleGit } from 'simple-git';

export const DEFAULT_OPTIONS: Partial<SimpleGitOptions> = {
    baseDir: process.cwd(),
    binary: 'git',
    maxConcurrentProcesses: 6,
    trimmed: false,
};

export interface GitService {
    _git: SimpleGit;
    branchLocal: () => Promise<ReturnType<SimpleGit['branchLocal']>>;
    checkout: (branch: string) => Promise<ReturnType<SimpleGit['checkout']>>;
    addAllFiles: () => Promise<void>;
}

export const createGitService = ({
    options,
}: {
    options: Partial<SimpleGitOptions>;
}): GitService => {
    const gitEngine = simpleGit(options);
    return {
        _git: gitEngine,
        // @ts-expect-error - being weird about the return type
        checkout: async (branch: string) => {
            return gitEngine.checkout(branch);
        },
        // @ts-expect-error - being weird about the return type
        branchLocal: async () => {
            return gitEngine.branchLocal();
        },
        addAllFiles: async () => {
            await gitEngine.add('.');
        },
    };
};
