import { describe, expect, it } from 'vitest';
import { getRebaseActions } from './recursive-rebase.js';

describe('rebase actions are planned correctly', () => {
    it('returns rebase actions at all', () => {
        const record = {
            root: ['branch_a', 'branch_b'],
        };
        expect(
            getRebaseActions({
                parentChildRecord: record,
                baseBranchName: 'root',
            }).length
        ).to.be.greaterThan(0);
    });

    it('returns no rebase actions if the base branch is not real', () => {
        expect(
            getRebaseActions({
                parentChildRecord: {},
                baseBranchName: 'branch_that_doesnt_exist',
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
                branchName: 'branch_a',
                ontoBranchName: 'root',
            },
            {
                branchName: 'branch_a_a',
                ontoBranchName: 'branch_a',
            },
            {
                branchName: 'branch_a_a_a',
                ontoBranchName: 'branch_a_a',
            },
            {
                branchName: 'branch_a_b',
                ontoBranchName: 'branch_a',
            },
            {
                branchName: 'branch_b',
                ontoBranchName: 'root',
            },
            {
                branchName: 'branch_b_a',
                ontoBranchName: 'branch_b',
            },
            {
                branchName: 'branch_b_b',
                ontoBranchName: 'branch_b',
            },
        ];

        expect(
            getRebaseActions({
                parentChildRecord: record,
                baseBranchName: 'root',
            })
        ).to.deep.equal(expected);
    });

    it('returns valid rebase actions', () => {
        expect(
            getRebaseActions({
                parentChildRecord: { root: ['root'] },
                baseBranchName: 'root',
            })
        ).to.deep.equal(
            [],
            'Should not allow rebase actions that rebase a branch onto itself'
        );
    });
});
