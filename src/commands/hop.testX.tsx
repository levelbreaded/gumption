import GumptionItemComponent from '../components/gumption-item-component.js';
import Hop from './hop.js';
import React from 'react';
import SelectInput from 'ink-select-input';
import { delay } from '../utils/delay.js';
import { describe, expect, it, vi } from 'vitest';
import { render } from '@levelbreaded/ink-testing-library';

const mocks = vi.hoisted(() => {
    return {
        createGitService: vi.fn(({}) => {
            return {
                // eslint-disable-next-line @typescript-eslint/require-await
                branchLocal: vi.fn(async () => ({
                    all: ['branch1', 'branch2', 'branch3'],
                    current: 'branch1',
                })),
                checkout: async () => {},
            };
        }),
    };
});

vi.mock('../services/git.js', () => {
    return {
        DEFAULT_OPTIONS: {},
        createGitService: mocks.createGitService,
    };
});

describe('correctly renders hop UI', () => {
    it('displays branch names in a list', async () => {
        const actual = render(
            <Hop
                cli={{
                    flags: {},
                    unnormalizedFlags: {},
                }}
                input={[]}
            />
        );

        const expected = render(
            <SelectInput
                items={[
                    { label: 'branch2', value: 'branch2' },
                    { label: 'branch3', value: 'branch3' },
                ]}
                itemComponent={GumptionItemComponent}
            />
        );

        await delay(100);
        expect(actual.lastFrame()).to.equal(expected.lastFrame());
    });

    it('explains when no branches match the searched pattern', async () => {
        const { lastFrame } = render(
            <Hop
                cli={{
                    flags: {},
                    unnormalizedFlags: {},
                }}
                input={['nonexistent-branch-name']}
            />
        );
        await delay(100);
        expect(lastFrame()).to.includes('No branches match the pattern');
        expect(lastFrame()).to.includes('nonexistent-branch-name');
    });

    it('does not show all branches if too many', async () => {
        mocks.createGitService.mockImplementationOnce(({}) => {
            return {
                // eslint-disable-next-line @typescript-eslint/require-await
                branchLocal: vi.fn(async () => ({
                    all: Array.from({ length: 20 }, (_, i) => `branch${i + 1}`),
                    current: 'not-included-in-list',
                })),
                checkout: async () => {},
            };
        });
        const { lastFrame, stdin } = render(
            <Hop
                cli={{
                    flags: {},
                    unnormalizedFlags: {},
                }}
                input={[]}
            />
        );
        await delay(100);
        stdin.write('j');
        await delay(500);
        stdin.write('j');
        await delay(500);

        console.log('lastFrame', lastFrame());
        expect(lastFrame()).to.includes('branch10');
        expect(lastFrame()).to.not.includes('branch11');
    });
});
