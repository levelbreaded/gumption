import { describe, expect, it } from 'vitest';
import { getRebaseActions } from './resolver.js';

describe('rebase actions are planned correctly', () => {
    it('returns rebase actions at all', () => {
        const record = {
            root: ['branch_a', 'branch_b'],
        };
        expect(
            getRebaseActions({
                parentChildRecord: record,
                baseBranch: 'root',
            }).length
        ).to.be.greaterThan(0);
    });

    it('returns no rebase actions if the base branch is not real', () => {
        expect(
            getRebaseActions({
                parentChildRecord: {},
                baseBranch: 'branch_that_doesnt_exist',
            })
        ).to.deep.equal([]);
    });

    it('returns rebase actions in DFS order', () => {
        const record = {
            root: ['branch_a', 'branch_b'],
            branch_a: ['branch_a_a', 'branch_a_b'],
            branch_a_a: ['branch_a_a_a'],
            branch_b: ['branch_b_a', 'branch_b_b'],
        };

        const expected = [
            {
                branch: 'branch_a',
                ontoBranch: 'root',
            },
            {
                branch: 'branch_a_a',
                ontoBranch: 'branch_a',
            },
            {
                branch: 'branch_a_a_a',
                ontoBranch: 'branch_a_a',
            },
            {
                branch: 'branch_a_b',
                ontoBranch: 'branch_a',
            },
            {
                branch: 'branch_b',
                ontoBranch: 'root',
            },
            {
                branch: 'branch_b_a',
                ontoBranch: 'branch_b',
            },
            {
                branch: 'branch_b_b',
                ontoBranch: 'branch_b',
            },
        ];

        expect(
            getRebaseActions({
                parentChildRecord: record,
                baseBranch: 'root',
            })
        ).to.deep.equal(expected);
    });

    it('returns valid rebase actions', () => {
        expect(
            getRebaseActions({
                parentChildRecord: { root: ['root'] },
                baseBranch: 'root',
            })
        ).to.deep.equal(
            [],
            'Should not allow rebase actions that rebase a branch onto itself'
        );
    });
});
