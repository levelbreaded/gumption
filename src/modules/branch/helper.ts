import { branchMetadataRef } from './refs.js';
import { execSync } from 'child_process';
import { getGumptionRootBranchName } from '../repo-config.js';

export const isGumptionBranchOrRoot = ({
    branchName,
}: {
    branchName: string;
}): boolean => {
    const rootBranchName = getGumptionRootBranchName();
    if (branchName === rootBranchName) return true;
    try {
        const revision = execSync(
            `git rev-parse --verify ${branchMetadataRef(branchName)} 2> /dev/null`
        )
            .toString()
            .trim();

        return Boolean(revision);
    } catch {
        return false;
    }
};
