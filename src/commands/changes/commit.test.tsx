import ChangesCommit from './commit.js';
import React from 'react';
import { Text } from 'ink';
import { delay } from '../../utils/time.js';
import { describe, expect, it, vi } from 'vitest';
import { render } from '@levelbreaded/ink-testing-library';

const ARBITRARY_DELAY = 250; // ms

const mocks = vi.hoisted(() => {
    return {
        createGitService: vi.fn(({}) => {
            return {
                commit: async ({ message }) => {
                    console.log(message);
                    return new Promise((resolve) =>
                        setTimeout(resolve, ARBITRARY_DELAY)
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

const LOADING_MESSAGE = 'Loading...';
const SUCCESS_MESSAGE = 'Committed all changes';

describe('correctly renders changes commit UI', () => {
    it('runs as intended', async () => {
        const actual1 = render(
            <ChangesCommit
                cli={{
                    flags: {},
                    unnormalizedFlags: {},
                }}
                input={['changes', 'commit', 'commit message']}
            />
        );

        const actual2 = render(
            <ChangesCommit
                cli={{
                    flags: {},
                    unnormalizedFlags: {},
                }}
                input={['changes', 'c', 'commit message']}
            />
        );

        const ExpectedComp = () => {
            return (
                <Text bold color="green">
                    {SUCCESS_MESSAGE}
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
            <ChangesCommit
                cli={{
                    flags: {},
                    unnormalizedFlags: {},
                }}
                input={['changes', 'commit', 'commit message']}
            />
        );

        const actual2 = render(
            <ChangesCommit
                cli={{
                    flags: {},
                    unnormalizedFlags: {},
                }}
                input={['changes', 'c', 'commit message']}
            />
        );

        const ExpectedComp = () => {
            return <Text color="cyan">{LOADING_MESSAGE}</Text>;
        };
        const expected = render(<ExpectedComp />);

        await delay(ARBITRARY_DELAY / 2);
        expect(actual1.lastFrame()).to.equal(expected.lastFrame());
        expect(actual2.lastFrame()).to.equal(expected.lastFrame());
    });
});
