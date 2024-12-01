import { DeepNullable } from '../../types.js';
import { JSONValue } from '../repo-config.js';
import { branchMetadataRef } from './refs.js';
import { execSync } from 'child_process';

export type BranchMetadata = {
    parentBranchName: string;
    parentCommitHash: string;
};

export const writeMetadataForBranch = ({
    branchName,
    metadata,
}: {
    branchName: string;
    metadata: DeepNullable<BranchMetadata>;
}) => {
    const metadataBlobHash = execSync('git hash-object -w --stdin', {
        input: JSON.stringify(metadata),
    }).toString();

    execSync(
        `git update-ref ${branchMetadataRef(branchName)} ${metadataBlobHash}`,
        {
            stdio: 'ignore',
        }
    );
};

export const updateMetadataForBranch = ({
    branchName,
    metadata,
}: {
    branchName: string;
    metadata: Partial<BranchMetadata>;
}) => {
    const oldMetadata = getMetadataForBranch({ branchName });
    writeMetadataForBranch({
        branchName,
        metadata: {
            parentBranchName: null,
            parentCommitHash: null,
            ...oldMetadata,
            ...metadata,
        },
    });
};

export const getMetadataForBranch = ({
    branchName,
}: {
    branchName: string;
}): DeepNullable<BranchMetadata> | null => {
    try {
        const ref = branchMetadataRef(branchName);
        /**
         * 2> /dev/null redirects the errors to a file. The file specified is /dev/null, a null device.
         * So this functionally just says "disregard error outputs"
         */
        const metadataStringified = execSync(
            `git cat-file -p ${ref} 2> /dev/null`
        )
            .toString()
            .trim(); // ngl just trimming because I fear edge cases

        if (metadataStringified.length === 0) {
            return null;
        }

        const parsed = JSON.parse(metadataStringified) as JSONValue;

        if (typeof parsed !== 'object') {
            return null;
        }

        return parsed as DeepNullable<BranchMetadata>;
    } catch (e) {
        return null;
    }
};
