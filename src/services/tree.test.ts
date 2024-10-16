import { createTreeService } from './tree.js';
import { describe, expect, it, vi } from 'vitest';

vi.mock('./store.js', async () => {
    const { mockStoreService } = await import('../utils/test-helpers.js');
    return mockStoreService({ rootInitialized: false });
});

describe('tree service is working', () => {
    it('registers root branch', () => {
        const { registerRoot, get } = createTreeService();
        registerRoot('root');
        expect(get()).to.deep.equal([{ key: 'root', parent: null }]);
    });

    it('overwrites past roots with the new root branch', () => {
        const { registerRoot, attachTo, get } = createTreeService();
        registerRoot('root');
        registerRoot('root_2');
        registerRoot('root_3');
        expect(get()).to.deep.equal([{ key: 'root_3', parent: null }]);

        registerRoot('root');
        attachTo({ newBranch: 'some-new-branch', parent: 'root' });
        attachTo({ newBranch: 'some-new-branch-2', parent: 'some-new-branch' });
        registerRoot('root_new');
        expect(get()).to.deep.equal([{ key: 'root_new', parent: null }]);
    });

    it('can attach a branch to a parent', () => {
        const { registerRoot, attachTo, get } = createTreeService();
        registerRoot('root');
        attachTo({ newBranch: 'some-new-branch', parent: 'root' });
        expect(get()).to.deep.equal([
            { key: 'root', parent: null },
            { key: 'some-new-branch', parent: 'root' },
        ]);
    });

    it('can move a branch to a parent', () => {
        const { registerRoot, attachTo, moveOnto, get } = createTreeService();
        registerRoot('root');
        attachTo({ newBranch: 'branch_a', parent: 'root' });
        attachTo({ newBranch: 'branch_b', parent: 'root' });
        attachTo({ newBranch: 'branch_a_a', parent: 'branch_a' });

        expect(get()).to.deep.equal([
            { key: 'root', parent: null },
            { key: 'branch_a', parent: 'root' },
            { key: 'branch_b', parent: 'root' },
            { key: 'branch_a_a', parent: 'branch_a' },
        ]);

        moveOnto({ branch: 'branch_a_a', parent: 'root' });

        expect(get()).to.deep.equal([
            { key: 'root', parent: null },
            { key: 'branch_a', parent: 'root' },
            { key: 'branch_b', parent: 'root' },
            { key: 'branch_a_a', parent: 'root' },
        ]);

        moveOnto({ branch: 'branch_b', parent: 'branch_a' });

        expect(get()).to.deep.equal([
            { key: 'root', parent: null },
            { key: 'branch_a', parent: 'root' },
            { key: 'branch_b', parent: 'branch_a' },
            { key: 'branch_a_a', parent: 'root' },
        ]);
    });

    it('can remove branches', () => {
        const { registerRoot, attachTo, removeBranch, get } =
            createTreeService();

        registerRoot('root');
        attachTo({ newBranch: 'branch_a', parent: 'root' });
        attachTo({ newBranch: 'branch_b', parent: 'root' });
        attachTo({ newBranch: 'branch_a_a', parent: 'branch_a' });
        attachTo({ newBranch: 'branch_b_a', parent: 'branch_b' });
        attachTo({ newBranch: 'branch_b_b', parent: 'branch_b' });

        expect(get()).to.deep.equal([
            { key: 'root', parent: null },
            { key: 'branch_a', parent: 'root' },
            { key: 'branch_b', parent: 'root' },
            { key: 'branch_a_a', parent: 'branch_a' },
            { key: 'branch_b_a', parent: 'branch_b' },
            { key: 'branch_b_b', parent: 'branch_b' },
        ]);

        removeBranch('branch_a_a');

        expect(get()).to.deep.equal([
            { key: 'root', parent: null },
            { key: 'branch_a', parent: 'root' },
            { key: 'branch_b', parent: 'root' },
            { key: 'branch_b_a', parent: 'branch_b' },
            { key: 'branch_b_b', parent: 'branch_b' },
        ]);

        removeBranch('branch_b');

        expect(get()).to.deep.equal([
            { key: 'root', parent: null },
            { key: 'branch_a', parent: 'root' },
            { key: 'branch_b_a', parent: 'branch_b' },
            { key: 'branch_b_b', parent: 'branch_b' },
        ]);
    });

    it('can remove parent branches without removing the child branches', () => {
        const { registerRoot, attachTo, removeBranch, get } =
            createTreeService();

        registerRoot('root');
        attachTo({ newBranch: 'branch_a', parent: 'root' });
        attachTo({ newBranch: 'branch_b', parent: 'root' });
        attachTo({ newBranch: 'branch_a_a', parent: 'branch_a' });
        attachTo({ newBranch: 'branch_b_a', parent: 'branch_b' });
        attachTo({ newBranch: 'branch_b_b', parent: 'branch_b' });

        expect(get()).to.deep.equal([
            { key: 'root', parent: null },
            { key: 'branch_a', parent: 'root' },
            { key: 'branch_b', parent: 'root' },
            { key: 'branch_a_a', parent: 'branch_a' },
            { key: 'branch_b_a', parent: 'branch_b' },
            { key: 'branch_b_b', parent: 'branch_b' },
        ]);

        removeBranch('branch_a');

        expect(get()).to.deep.equal([
            { key: 'root', parent: null },
            { key: 'branch_b', parent: 'root' },
            { key: 'branch_a_a', parent: 'branch_a' },
            { key: 'branch_b_a', parent: 'branch_b' },
            { key: 'branch_b_b', parent: 'branch_b' },
        ]);

        removeBranch('branch_b');

        expect(get()).to.deep.equal([
            { key: 'root', parent: null },
            { key: 'branch_a_a', parent: 'branch_a' },
            { key: 'branch_b_a', parent: 'branch_b' },
            { key: 'branch_b_b', parent: 'branch_b' },
        ]);
    });
});
