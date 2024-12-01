import {
    BranchState,
    RootBranchState,
    ValidOrRootBranchState,
} from './types.js';
import {
    NoBranchError,
    NoDiffError,
    NoRootBranchError,
} from '../../lib/errors.js';
import { getGumptionRootBranchName } from '../repo-config.js';
import { git } from '../git.js';

export const assertBranchNameExists = (branchName: string) => {
    if (!git.checkBranchNameExists({ branchName })) {
        throw new NoBranchError(branchName);
    }
};

export const assertBranchNameIsNonRoot = (branchName: string) => {
    if (branchName === getGumptionRootBranchName()) {
        throw new Error('This action cannot be performed on the root branch.');
    }
};

export const assertCurrentHasDiff = () => {
    if (!git.hasDiff()) {
        throw new NoDiffError();
    }
};

export function assertBranchIsRoot(
    branch: BranchState
): asserts branch is RootBranchState {
    if (branch.condition !== 'IS_ROOT') throw new NoRootBranchError();
}

export function assertBranchIsValidOrRoot(
    branch: BranchState
): asserts branch is ValidOrRootBranchState {
    if (!['IS_ROOT', 'VALID'].includes(branch.condition)) {
        throw new Error(
            'This action can only be performed on a valid Gumption branch.'
        );
    }
}

export function isBranchRoot(branch: BranchState): branch is RootBranchState {
    return branch.condition === 'IS_ROOT';
}

export function isBranchNotNone(
    branch: BranchState
): branch is Exclude<BranchState, { condition: 'NONE' }> {
    return branch.condition !== 'NONE';
}

export function isBranchWithParentBranchName(
    branch: BranchState
): branch is Extract<
    BranchState,
    { condition: 'VALID' | 'NO_PARENT_COMMIT_HASH' | 'PARENT_META_MISMATCH' }
> {
    return ['VALID', 'NO_PARENT_COMMIT_HASH', 'PARENT_META_MISMATCH'].includes(
        branch.condition
    );
}

export function assertBranchIsNotRoot(
    branch: BranchState
): asserts branch is Exclude<BranchState, { condition: 'IS_ROOT' }> {
    if (branch.condition === 'IS_ROOT') {
        throw new Error('This action cannot be performed on the root branch.');
    }
}

export function assertBranchIsValidAndNotRoot(
    branch: BranchState
): asserts branch is Exclude<ValidOrRootBranchState, { condition: 'IS_ROOT' }> {
    assertBranchIsValidOrRoot(branch);
    assertBranchIsNotRoot(branch);
}

export function assertBranchCanBeRebased(
    branch: BranchState
): asserts branch is Exclude<ValidOrRootBranchState, { condition: 'IS_ROOT' }> {
    if (!['VALID', 'PARENT_META_MISMATCH'].includes(branch.condition)) {
        throw new Error(
            'Only branches with sufficient stored metadata can be rebased.'
        );
    }
}

export function assertBranchIsNotNone(
    branch: BranchState
): asserts branch is Exclude<BranchState, { condition: 'NONE' }> {
    if (branch.condition === 'NONE') {
        throw new Error(
            'This action can only be performed on a Gumption branch.'
        );
    }
}
