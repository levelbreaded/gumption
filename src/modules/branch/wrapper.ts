import { BRANCH_STATE_CACHE, isCached, updateCache } from './cache.js';
import {
    BranchMetadata,
    getMetadataForBranch,
    updateMetadataForBranch,
} from './metadata.js';
import { BranchState, RootBranchState } from './types.js';
import { NoRootBranchError } from '../../lib/errors.js';
import { assertBranchIsRoot, assertBranchNameExists } from './assertions.js';
import { getGumptionRootBranchName } from '../repo-config.js';
import { git } from '../git.js';

export const loadBranch = (branchName: string): BranchState => {
    const branch = _loadBranch(branchName);

    updateCache({
        branchName,
        state: branch,
    });

    return branch;
};

export const _loadBranch = (branchName: string): BranchState => {
    assertBranchNameExists(branchName);

    if (isCached(branchName)) {
        /**
         * @dark - use of "as"
         */
        return BRANCH_STATE_CACHE[branchName] as BranchState;
    }

    const coreBranch: Omit<BranchState, 'condition'> = getBranchCore({
        branchName,
    });

    const gumptionRootBranchName = getGumptionRootBranchName();
    if (branchName === gumptionRootBranchName) {
        return {
            condition: 'IS_ROOT',
            ...coreBranch,
        };
    }

    const metadata = getMetadataForBranch({
        branchName,
    });

    if (metadata === null) {
        return {
            condition: 'NONE',
            ...coreBranch,
        };
    }

    const { parentBranchName, parentCommitHash } = metadata;

    if (parentBranchName === null) {
        return {
            condition: 'NO_PARENT_BRANCH_NAME',
            ...coreBranch,
        };
    }

    if (parentCommitHash === null) {
        return {
            condition: 'NO_PARENT_COMMIT_HASH',
            parentBranchName,
            ...coreBranch,
        };
    }

    const actualParentCommitHash = git.getCurrentCommitHash({
        branchName: parentBranchName,
    });
    if (parentCommitHash !== actualParentCommitHash) {
        return {
            condition: 'PARENT_META_MISMATCH',
            parentBranchName,
            parentCommitHash,
            ...coreBranch,
        };
    }

    return {
        condition: 'VALID',
        parentBranchName,
        parentCommitHash,
        ...coreBranch,
    };
};

const getBranchCore = ({
    branchName,
}: {
    branchName: string;
}): Omit<BranchState, 'condition'> => {
    return {
        name: branchName,
        currentCommitHash: git.getCurrentCommitHash({ branchName }),
    };
};

export const getRootBranch = (): RootBranchState => {
    const rootBranchName = getGumptionRootBranchName();
    if (!rootBranchName) throw new NoRootBranchError();

    const rootBranch = loadBranch(rootBranchName);
    assertBranchIsRoot(rootBranch);
    return rootBranch;
};

/**
 * All updates to metadata for a branch should be done with this function
 */
export const updateMetadata = ({
    branchName,
    metadata,
}: {
    branchName: string;
    metadata: Partial<BranchMetadata>;
}) => {
    updateMetadataForBranch({
        branchName,
        metadata,
    });

    // invalidate cache when metadata changes
    delete BRANCH_STATE_CACHE[branchName];
};
