import { git } from '../modules/git.js';

export const safeBranchNameFromCommitMessage = (message: string): string => {
    // Match every non-alphanumeric character that is not "-" or "_"
    const pattern = /[^a-zA-Z0-9\-_\/]+/gm;
    let safeBranchName = message.replace(pattern, '_').toLowerCase();

    // fixme: this is a lame way to do this, but ensures uniqueness
    if (git.checkBranchNameExists({ branchName: safeBranchName })) {
        safeBranchName = `${safeBranchName}_${Date.now()}`;
    }

    return safeBranchName;
};
