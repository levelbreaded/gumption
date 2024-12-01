import { isDev } from '../../utils/dev.js';

const REF_METADATA_DIR = isDev ? 'gummy-test' : 'gumption-metadata';

export const branchMetadataRef = (branchName: string): string => {
    return `refs/${REF_METADATA_DIR}/${branchName}`;
};
