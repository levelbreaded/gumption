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
    checkout: (
        branch: string,
        options?: { fallbackBranch?: string }
    ) => Promise<ReturnType<SimpleGit['checkout']>>;
    addAllFiles: () => Promise<void>;
    commit: (args: { message: string }) => Promise<void>;
    createBranch: (args: { branchName: string }) => Promise<void>;
    rebaseBranchOnto: (args: {
        branch: string;
        ontoBranch: string;
    }) => Promise<void>;
    isRebasing: () => Promise<boolean>;
    rebaseContinue: () => Promise<void>;
    mergeBaseBranch: (branchA: string, branchB: string) => Promise<string>;
    latestCommitFor: (branch: string) => Promise<string | null>;
    needsRebaseOnto: (args: {
        branch: string;
        ontoBranch: string;
    }) => Promise<boolean>;
    isClosedOnRemote: (branch: string) => Promise<boolean>;
    fetchPrune: () => Promise<void>;
    pull: () => Promise<void>;
    branchDelete: (branch: string) => Promise<void>;
    branchExistsLocally: (branch: string) => Promise<boolean>;
}

export const createGitService = ({
    options,
}: {
    options: Partial<SimpleGitOptions>;
}): GitService => {
    const gitEngine = simpleGit(options);

    async function branchExistsLocally(branch: string) {
        // todo: we should probably be using this function a lot more lmao
        const branchRef = await gitEngine.raw([
            'show-ref',
            `refs/heads/${branch}`,
        ]);
        return Boolean(branchRef);
    }

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
        checkout: async (
            branch: string,
            options?: {
                fallbackBranch?: string;
            }
        ) => {
            const _branchExistsLocally = await branchExistsLocally(branch);
            if (!_branchExistsLocally && options?.fallbackBranch) {
                return gitEngine.checkout(options.fallbackBranch);
            }

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
        rebaseContinue: async () => {
            await gitEngine.raw([
                '-c',
                'core.editor=true',
                'rebase',
                '--continue',
            ]);
        },
        mergeBaseBranch: async (branchA: string, branchB: string) => {
            const result = await gitEngine.raw([
                'merge-base',
                branchA,
                branchB,
            ]);
            /*
             * The result is the commit SHA of the most recent "ancestor" commit between both branches.
             * Because this is a raw() command, it also includes a "\n" at the end of the commit SHA that we remove
             */
            const commonAncestorCommit = result.replace('\n', '');
            return commonAncestorCommit;
        },
        latestCommitFor: async (branch: string) => {
            const { latest } = await gitEngine.log([
                '-n', // specify a number of commits to return
                '1', // only return 1 (the latest)
                branch,
            ]);

            return latest?.hash ?? null;
        },
        needsRebaseOnto: async ({
            branch,
            ontoBranch,
        }: {
            branch: string;
            ontoBranch: string;
        }) => {
            if (
                !(await branchExistsLocally(branch)) ||
                !(await branchExistsLocally(branch))
            ) {
                return false;
            }

            const result = await gitEngine.raw([
                'merge-base',
                branch,
                ontoBranch,
            ]);
            /*
             * The result is the commit SHA of the most recent "ancestor" commit between both branches.
             * Because this is a raw() command, it also includes a "\n" at the end of the commit SHA that we remove
             */
            const commonAncestorCommit = result.replace('\n', '');

            const { latest } = await gitEngine.log([
                '-n', // specify a number of commits to return
                '1', // only return 1 (the latest)
                ontoBranch,
            ]);

            const ontoBranchLatestHash = latest?.hash ?? null;

            return ontoBranchLatestHash !== commonAncestorCommit;
        },
        isClosedOnRemote: async (branch: string) => {
            // this is only accurate is "git fetch -p" or some equivalent has been run
            // recently enough to have up-to-date information in the refs
            const { all, branches } = await gitEngine.branch(['-a', '-vv']);
            const remoteBranchName = `remotes/origin/${branch}`;

            if (all.includes(remoteBranchName)) {
                // if remote is still in the ref, then it's still a living remote branch in the upstream
                return false;
            }

            const label: string = branches?.[branch]?.label ?? '';
            if (label.includes(`[origin/${branch}: gone]`)) {
                return true;
            }

            return false;
        },
        fetchPrune: async () => {
            await gitEngine.fetch(['--prune', 'origin']);
        },
        pull: async () => {
            await gitEngine.pull(['--ff-only', '--prune']);
        },
        branchDelete: async (branch: string) => {
            await gitEngine.deleteLocalBranch(branch, true);
        },
        branchExistsLocally,
    };
};
