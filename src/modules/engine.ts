import { TrackedBranchState, ValidBranchState } from './branch/types.js';
import {
    assertBranchIsValidAndNotRoot,
    assertBranchNameExists,
    assertBranchNameIsNonRoot,
} from './branch/assertions.js';
import { branchMetadataRef } from './branch/refs.js';
import { git } from './git.js';
import { loadBranch, updateMetadata } from './branch/wrapper.js';
import { tree } from './tree.js';

interface EngineService {
    trackedRebase: (args: {
        branch: ValidBranchState;
        ontoBranch: TrackedBranchState;
    }) => void;
    trackBranch: (args: {
        branchName: string;
        parentBranchName: string;
    }) => void;
    deleteTrackedBranch: (args: { branchName: string }) => void;
    deleteBranchMetadata: (args: { branchName: string }) => void;
}

export const createEngine = (): EngineService => {
    return {
        trackedRebase: ({ branch, ontoBranch }) => {
            updateMetadata({
                branchName: branch.name,
                metadata: { parentBranchName: ontoBranch.name },
            });

            git.rebaseOnto({
                branchName: branch.name,
                newParent: ontoBranch.name,
                oldParent: branch.parentCommitHash,
            });

            updateMetadata({
                branchName: branch.name,
                metadata: { parentCommitHash: ontoBranch.currentCommitHash },
            });
        },
        trackBranch: ({ branchName, parentBranchName }) => {
            if (branchName === parentBranchName) {
                throw new Error(
                    `Cannot track branch "${branchName}" with itself as a parent.`
                );
            }
            assertBranchNameIsNonRoot(branchName);
            assertBranchNameExists(branchName);
            assertBranchNameExists(parentBranchName);

            const mergeBase = git.mergeBase({
                a: branchName,
                b: parentBranchName,
            });

            updateMetadata({
                branchName,
                metadata: {
                    parentBranchName,
                    parentCommitHash: mergeBase,
                },
            });
        },
        deleteTrackedBranch: ({ branchName }) => {
            assertBranchNameExists(branchName);

            const currentBranchName = git.getCurrentBranchName();
            const branchToDelete = loadBranch(branchName);

            assertBranchIsValidAndNotRoot(branchToDelete);

            const parentBranchName = branchToDelete.parentBranchName;

            if (branchToDelete.name === currentBranchName) {
                git.checkoutBranch(parentBranchName);
            }

            tree.getChildren({ branchName }).forEach((branch) => {
                updateMetadata({
                    branchName: branch.name,
                    metadata: {
                        parentBranchName,
                    },
                });
            });

            deleteBranchMetadata({ branchName });
            git.deleteBranch({ branchName, force: true });
        },
        deleteBranchMetadata,
    };
};

const deleteBranchMetadata = ({ branchName }: { branchName: string }) => {
    git.deleteRef({ ref: branchMetadataRef(branchName) });
};

export const engine = createEngine();
