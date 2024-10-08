export const safeBranchNameFromCommitMessage = (message: string): string => {
    // todo: how to handle exact branch matches
    // Match every non-alphanumeric character that is not "-" or "_"
    const pattern = /[^a-zA-Z0-9\-_\/]+/gm;
    return message.replace(pattern, '_').toLowerCase();
};
