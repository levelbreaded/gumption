import React, { useMemo, useState } from 'react';
import { ConfirmStatement } from './confirm-statement.js';
import { SearchSelectInput } from './select-search-input.js';
import { Text } from 'ink';
import { git } from '../modules/git.js';
import { setGumptionRootBranchName } from '../modules/repo-config.js';

export const SelectRootBranch = () => {
    const [unconfirmedRootBranchName, setUnconfirmedRootBranchName] = useState<
        string | undefined
    >(undefined);
    const [rootBranchName, setRootBranchName] = useState<string | undefined>(
        undefined
    );

    const items = useMemo(() => {
        return git
            .getLocalBranchNames()
            .map((branchName) => ({ label: branchName, value: branchName }));
    }, []);

    if (rootBranchName) {
        return (
            <Text color="green">
                Set <Text bold>{rootBranchName}</Text> as the root branch
            </Text>
        );
    }

    if (unconfirmedRootBranchName) {
        return (
            <ConfirmStatement
                statement={
                    <Text bold>
                        Set{' '}
                        <Text color="yellow">{unconfirmedRootBranchName}</Text>{' '}
                        as the root branch?
                    </Text>
                }
                onAccept={() => {
                    unconfirmedRootBranchName &&
                        setGumptionRootBranchName({
                            rootBranchName: unconfirmedRootBranchName,
                        });
                    setRootBranchName(unconfirmedRootBranchName);
                }}
                onDeny={() => {
                    setUnconfirmedRootBranchName(undefined);
                }}
            />
        );
    }

    return (
        <SearchSelectInput
            title="Please select a root branch for Gumption before proceeding."
            items={items}
            onSelect={(item) => {
                setUnconfirmedRootBranchName(item.value);
            }}
        />
    );
};
