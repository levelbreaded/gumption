import BranchNew from './new.js';
import React from 'react';
import { Loading } from '../../components/loading.js';
import { Text } from 'ink';
import { delay } from '../../utils/time.js';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'ink-testing-library';
import { safeBranchNameFromCommitMessage } from '../../utils/naming.js';

const ARBITRARY_DELAY = 120; // ms

const mocks = vi.hoisted(() => {
    return {
        createGitService: vi.fn(({}) => {
            return {
                checkout: async () => {
                    return new Promise((resolve) =>
                        setTimeout(resolve, ARBITRARY_DELAY / 4)
                    );
                },
                createBranch: async () => {
                    return new Promise((resolve) =>
                        setTimeout(resolve, ARBITRARY_DELAY / 4)
                    );
                },
                addAllFiles: async () => {
                    return new Promise((resolve) =>
                        setTimeout(resolve, ARBITRARY_DELAY / 4)
                    );
                },
                commit: async ({ message }: { message: string }) => {
                    console.log(message);
                    return new Promise((resolve) =>
                        setTimeout(resolve, ARBITRARY_DELAY / 4)
                    );
                },
            };
        }),
    };
});

vi.mock('../../services/git.js', () => {
    return {
        DEFAULT_OPTIONS: {},
        createGitService: mocks.createGitService,
    };
});

vi.mock('../../services/store.js', async () => {
    const { mockStoreService } = await import('../../utils/test-helpers.js');
    return mockStoreService({ rootInitialized: true });
});

describe('correctly renders changes commit UI', () => {
    it('runs as intended', async () => {
        const actual1 = render(
            <BranchNew
                cli={{
                    flags: {},
                    unnormalizedFlags: {},
                }}
                input={['branch', 'new', 'commit message']}
            />
        );

        const actual2 = render(
            <BranchNew
                cli={{
                    flags: {},
                    unnormalizedFlags: {},
                }}
                input={['branch', 'n', 'commit message']}
            />
        );

        const newBranchName = safeBranchNameFromCommitMessage('commit message');

        const ExpectedComp = () => {
            return (
                <Text color="green">
                    New branch created - <Text bold>{newBranchName}</Text>
                </Text>
            );
        };
        const expected = render(<ExpectedComp />);

        await delay(ARBITRARY_DELAY + 250);
        expect(actual1.lastFrame()).to.equal(expected.lastFrame());
        expect(actual2.lastFrame()).to.equal(expected.lastFrame());
    });

    it('displays a loading state while processing', async () => {
        const actual1 = render(
            <BranchNew
                cli={{
                    flags: {},
                    unnormalizedFlags: {},
                }}
                input={['branch', 'new', 'commit message']}
            />
        );

        const actual2 = render(
            <BranchNew
                cli={{
                    flags: {},
                    unnormalizedFlags: {},
                }}
                input={['branch', 'n', 'commit message']}
            />
        );

        const expected = render(<Loading />);

        await delay(ARBITRARY_DELAY / 2);
        expect(actual1.lastFrame()).to.equal(expected.lastFrame());
        expect(actual2.lastFrame()).to.equal(expected.lastFrame());
    });
});
