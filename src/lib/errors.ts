export class NoRootBranchError extends Error {
    constructor() {
        super(`Cannot perform this operation on the trunk branch.`);
        this.name = 'NoRootBranchError';
    }
}

export class NoBranchError extends Error {
    constructor(branchName: string) {
        super(`Could not find branch ${branchName}.`);
        this.name = 'NoBranchError';
    }
}

export class DetachedBranchError extends Error {
    constructor() {
        super(`Cannot perform this action without being on a branch`);
        this.name = 'DetachedBranchError';
    }
}

export class RebaseConflictError extends Error {
    constructor() {
        super(`Hit a conflict during rebase.`);
        this.name = 'RebaseConflictError';
    }
}

export class UntrackedBranchError extends Error {
    constructor(branchName: string) {
        super(
            `Cannot perform this operation on untracked branch ${branchName}.`
        );
        this.name = 'UntrackedBranchError';
    }
}

export class NoDiffError extends Error {
    constructor() {
        super(`No changes have been made.`);
        this.name = 'NoDiffError';
    }
}

export class NoGitDirError extends Error {
    constructor() {
        super(`The current folder is not a git repository.`);
        this.name = 'NoGitDirError';
    }
}

export class NoWorkTreeError extends Error {
    constructor() {
        super(`This operation must be run in a work tree.`);
        this.name = 'NoWorkTreeError';
    }
}
