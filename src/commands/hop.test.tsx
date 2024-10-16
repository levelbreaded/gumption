import GumptionItemComponent from '../components/gumption-item-component.js';
import Hop from './hop.js';
import React from 'react';
import SelectInput from 'ink-select-input';
import { KEYS, mockStoreService } from '../utils/test-helpers.js';
import { delay } from '../utils/time.js';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'ink-testing-library';

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

vi.mock('../services/store.js', async () => {
    const { mockStoreService } = await import('../utils/test-helpers.js');
    return mockStoreService({ rootInitialized: false });
});

describe('correctly renders hop UI', () => {
    it('displays branch names in a list', async () => {
        const actual1 = render(
            <Hop
                cli={{
                    flags: {},
                    unnormalizedFlags: {},
                }}
                input={['hop']}
            />
        );

        const actual2 = render(
            <Hop
                cli={{
                    flags: {},
                    unnormalizedFlags: {},
                }}
                input={['h']}
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
        expect(actual1.lastFrame()).to.equal(expected.lastFrame());
        expect(actual2.lastFrame()).to.equal(expected.lastFrame());
    });

    it('explains when no branches match the searched pattern', async () => {
        const { lastFrame } = render(
            <Hop
                cli={{
                    flags: {},
                    unnormalizedFlags: {},
                }}
                input={['hop', 'nonexistent-branch-name']}
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
        const { lastFrame } = render(
            <Hop
                cli={{
                    flags: {},
                    unnormalizedFlags: {},
                }}
                input={['hop']}
            />
        );

        await delay(100);

        expect(lastFrame()).to.includes('branch10');
        expect(lastFrame()).to.not.includes('branch11');
    });

    it('renders success message', async () => {
        const { lastFrame, stdin } = render(
            <Hop
                cli={{
                    flags: {},
                    unnormalizedFlags: {},
                }}
                input={['hop']}
            />
        );
        await delay(100);
        stdin.write(KEYS.down);
        await delay(100);
        stdin.write(KEYS.return);
        await delay(100);

        expect(lastFrame()).to.includes('branch1');
        expect(lastFrame()).to.includes('↴');
        expect(lastFrame()).to.includes('Hopped to');
        expect(lastFrame()).to.includes('branch3');
    });
});
