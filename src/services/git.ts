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
    currentBranch: () => Promise<string>;
    listBranches: () => Promise<string[]>;
    checkout: (branch: string) => Promise<ReturnType<SimpleGit['checkout']>>;
    addAllFiles: () => Promise<void>;
    commit: (args: { message: string }) => Promise<void>;
    createBranch: (args: { branchName: string }) => Promise<void>;
    rebaseBranchOnto: (args: {
        branch: string;
        ontoBranch: string;
    }) => Promise<void>;
    isRebasing: () => Promise<boolean>;
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
        branchLocal: async () => {
            return gitEngine.branchLocal();
        },
        currentBranch: async () => {
            const { current } = await gitEngine.branchLocal();
            return current;
        },
        listBranches: async () => {
            const { all } = await gitEngine.branchLocal();
            return all;
        },
        // @ts-expect-error - being weird about the return type
        checkout: async (branch: string) => {
            return gitEngine.checkout(branch);
        },
        addAllFiles: async () => {
            await gitEngine.add('.');
        },
        commit: async ({ message }) => {
            await gitEngine.commit(message);
        },
        createBranch: async ({ branchName }: { branchName: string }) => {
            await gitEngine.branch([branchName]);
        },
        rebaseBranchOnto: async ({
            branch,
            ontoBranch,
        }: {
            branch: string;
            ontoBranch: string;
        }) => {
            await gitEngine.rebase([ontoBranch, branch]);
        },
        isRebasing: async () => {
            // see https://adamj.eu/tech/2023/05/29/git-detect-in-progress-operation/
            try {
                const result = await gitEngine.revparse([
                    '--verify',
                    'REBASE_HEAD',
                ]);
                return Boolean(result);
            } catch {
                return false;
            }
        },
    };
};
