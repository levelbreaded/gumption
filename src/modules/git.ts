import {
    NoDiffError,
    NoWorkTreeError,
    RebaseConflictError,
} from '../lib/errors.js';
import { assertBranchNameExists } from './branch/assertions.js';
import { execSync } from 'child_process';

const getLocalBranchNames = (): string[] => {
    const branchOutput = execSync(
        'git branch --format="%(refname:short)"'
    ).toString();

    return branchOutput
        .trim()
        .split('\n')
        .map((t) => t.trim());
};

const getCurrentBranchName = (): string => {
    const branchOutput = execSync('git branch --show-current')
        .toString()
        .trim();

    // todo: if (!branchOutput) throw new DetachedBranchError();
    return branchOutput;
};

const checkBranchNameExists = ({ branchName }: { branchName: string }) => {
    try {
        execSync(
            `git rev-parse --verify ${branchName} 2> /dev/null`
        ).toString();
        return true;
    } catch (e) {
        return false;
    }
};

const checkoutBranch = (branchName: string): void => {
    assertBranchNameExists(branchName);
    execSync(`git checkout ${branchName} 2> /dev/null`);
};

const stageAllChanges = () => {
    execSync(`git add .`);
};

const hasDiff = (): boolean => {
    // todo: I have NO idea why git diff does me dirty - case is add a new file with 0-1 letters in it, git diff says no changes
    // const diff = execSync(`git diff`).toString().trim();
    const diff = execSync(`git add --dry-run --verbose .`).toString().trim();
    return Boolean(diff.length);
};

const commit = ({ message }: { message: string }) => {
    const escapedMessage = message.replace(/"/g, '\\"');
    execSync(`git commit -m "${escapedMessage}"`);
};

const createBranch = ({ branchName }: { branchName: string }) => {
    execSync(`git branch ${branchName}`);
};

const isClosedOnRemote = ({ branchName }: { branchName: string }): boolean => {
    // this is only accurate if "git fetch -p" or some equivalent has been run
    // recently enough to have up-to-date information in the refs
    const output = execSync('git branch -a -vv').toString();

    if (output.includes(`remotes/origin/${branchName}`)) {
        // if remote ref is listed, then it's still a living remote branch in the upstream
        return false;
    }

    if (output.includes(`[origin/${branchName}: gone]`)) {
        return true;
    }

    return false;
};

const mergeBase = ({ a, b }: { a: string; b: string }): string => {
    return execSync(`git merge-base ${a} ${b}`).toString().trim();
};

const rebase = ({
    branchName,
    newParent,
}: {
    branchName: string;
    newParent: string;
}): void => {
    try {
        execSync(`git rebase ${newParent} ${branchName} 2> /dev/null`);
    } catch (e) {
        if (git.isRebasing()) {
            throw new RebaseConflictError();
        } else {
            throw e;
        }
    }
};

const rebaseOnto = ({
    branchName,
    newParent,
    oldParent,
}: {
    branchName: string;
    newParent: string;
    oldParent: string;
}): void => {
    try {
        execSync(
            `git rebase --onto ${newParent} ${oldParent} ${branchName} 2> /dev/null`
        );
    } catch (e) {
        if (git.isRebasing()) {
            throw new RebaseConflictError();
        } else {
            throw e;
        }
    }
};

const needsRebaseOnto = ({
    branchName,
    ontoBranchName,
}: {
    branchName: string;
    ontoBranchName: string;
}): boolean => {
    assertBranchNameExists(branchName);
    assertBranchNameExists(ontoBranchName);

    /*
     * The result is the commit SHA of the most recent "ancestor" commit between both branches.
     */
    const commonAncestorCommit = execSync(
        `git merge-base ${branchName} ${ontoBranchName}`
    )
        .toString()
        .trim()
        .replace('\n', '');

    const ontoBranchLatestCommitHash = execSync(
        `git rev-parse ${ontoBranchName}`
    )
        .toString()
        .trim();

    return ontoBranchLatestCommitHash !== commonAncestorCommit;
};

const isRebasing = (): boolean => {
    // see https://adamj.eu/tech/2023/05/29/git-detect-in-progress-operation/
    try {
        const result = execSync(
            'git rev-parse --verify REBASE_HEAD 2> /dev/null'
        ).toString();
        return Boolean(result);
    } catch {
        return false;
    }
};

const rebaseContinue = (): void => {
    execSync('git -c core.editor=true rebase --continue');
};

const pull = ({ prune }: { prune: boolean }): void => {
    execSync(`git pull --ff-only ${prune ? '--prune' : ''}`);
};

const deleteBranch = ({
    branchName,
    force,
}: {
    branchName: string;
    force: boolean;
}): void => {
    execSync(`git branch --delete ${force ? '--force' : ''} ${branchName}`);
};

const deleteRef = ({ ref }: { ref: string }): void => {
    execSync(`git update-ref -d ${ref} 2> /dev/null`);
};

const getCurrentCommitHash = ({ branchName }: { branchName: string }) => {
    return execSync(`git rev-parse ${branchName} 2> /dev/null`)
        .toString()
        .trim();
};

/**
 * fixme: highly suspect, but works
 */
const getRebasingBranchName = () => {
    if (!isRebasing()) {
        throw new Error('No rebase in progress.');
    }

    const gitDir = execSync('git rev-parse --absolute-git-dir')
        .toString()
        .trim();

    const output = execSync(`cat ${gitDir}/rebase-merge/head-name`)
        .toString()
        .trim();

    return output.replace('refs/heads/', '');
};

const assertInWorkTree = () => {
    const isInWorkTree =
        execSync(`git rev-parse --is-inside-work-tree`).toString().trim() ===
        'true';

    if (!isInWorkTree) throw new NoWorkTreeError();
};

const assertHasDiff = () => {
    if (!hasDiff()) throw new NoDiffError();
};

export const git = {
    getLocalBranchNames,
    getCurrentBranchName,
    checkBranchNameExists,
    checkoutBranch,
    stageAllChanges,
    hasDiff,
    commit,
    createBranch,
    isClosedOnRemote,
    mergeBase,
    rebase,
    rebaseOnto,
    needsRebaseOnto,
    isRebasing,
    rebaseContinue,
    pull,
    deleteBranch,
    deleteRef,
    getCurrentCommitHash,
    getRebasingBranchName,
    assertInWorkTree,
    assertHasDiff,
};
