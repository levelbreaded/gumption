import ChangesAdd from './add.js';
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
                addAllFiles: async () => {
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
const SUCCESS_MESSAGE = 'Staged all changes';

describe('correctly renders changes add UI', () => {
    it('runs as intended', async () => {
        const actual1 = render(
            <ChangesAdd
                cli={{
                    flags: {},
                    unnormalizedFlags: {},
                }}
                input={['changes', 'add']}
            />
        );

        const actual2 = render(
            <ChangesAdd
                cli={{
                    flags: {},
                    unnormalizedFlags: {},
                }}
                input={['changes', 'a']}
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
            <ChangesAdd
                cli={{
                    flags: {},
                    unnormalizedFlags: {},
                }}
                input={['changes', 'add']}
            />
        );

        const actual2 = render(
            <ChangesAdd
                cli={{
                    flags: {},
                    unnormalizedFlags: {},
                }}
                input={['changes', 'a']}
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
