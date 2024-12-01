export type BranchStateCondition =
    // regular degular Gumption branches, we have the data we need
    | 'VALID'
    // we don't need to store any metadata for the root branch beyond knowing it's name
    | 'IS_ROOT'
    | 'NO_PARENT_BRANCH_NAME'
    | 'NO_PARENT_COMMIT_HASH'
    // denotes that we have a parent branch name and commit hash, but something is wrong (i.e. they don't match)
    | 'PARENT_META_MISMATCH'
    | 'NONE';

export type BranchState = {
    name: string;
    condition: BranchStateCondition;
    currentCommitHash: string;
} & (
    | {
          condition: 'VALID';
          parentBranchName: string;
          parentCommitHash: string;
      }
    | {
          condition: 'IS_ROOT';
      }
    | {
          condition: 'NO_PARENT_BRANCH_NAME';
      }
    | {
          condition: 'NO_PARENT_COMMIT_HASH';
          parentBranchName: string;
      }
    | {
          condition: 'PARENT_META_MISMATCH';
          parentBranchName: string;
          parentCommitHash: string;
      }
    | {
          condition: 'NONE';
      }
);

export type ValidOrRootBranchState = Extract<
    BranchState,
    { condition: 'VALID' | 'IS_ROOT' }
>;
export type ValidBranchState = Extract<BranchState, { condition: 'VALID' }>;
export type TrackedBranchState = Exclude<BranchState, { condition: 'NONE' }>;

export type InvalidBranchState = Exclude<
    BranchState,
    { condition: 'VALID' | 'IS_ROOT' }
>;

export type RootBranchState = Extract<BranchState, { condition: 'IS_ROOT' }>;
