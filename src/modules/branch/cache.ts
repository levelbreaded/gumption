import { BranchState } from './types.js';

type BranchStateCache = Record<string, BranchState>;
type MaybeBranchStateCache = Record<string, BranchState | undefined>;
/**
 * Store all local branches here and update accordingly.
 * This saves many repetitive git calls.
 *
 * The implementation can be simple here since the "React app"
 * only exists for the duration of the command.
 */
export const BRANCH_STATE_CACHE: BranchStateCache = {};

export function updateCache({
    branchName,
    state,
}: {
    branchName: string;
    state: BranchState;
}) {
    BRANCH_STATE_CACHE[branchName] = state;
}

export function isCached(branchName: string): boolean {
    return assertKeyInRecord(branchName, BRANCH_STATE_CACHE);
}

export function assertKeyInRecord<K extends string>(
    branchName: K,
    record: MaybeBranchStateCache
): record is BranchStateCache {
    return branchName in record;
}
