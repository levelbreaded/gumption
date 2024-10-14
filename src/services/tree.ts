import { StoreService, createStoreService } from './store.js';

const FILENAME = 'config.json';

type BranchNode = { key: string; parent: string | null };
type Tree = BranchNode[];

type ParentBranch = string | symbol;

const registerRoot = (branch: string, deps: { storeService: StoreService }) => {
    _saveTree([_createBranchNode({ tree: [], branch, parent: null })], deps);
};

const attachTo = (
    {
        newBranch,
        parent,
    }: {
        newBranch: string;
        parent: ParentBranch;
    },
    deps: { storeService: StoreService }
) => {
    const tree = _readTree(deps);
    const parentBranch = _findParent({ parent, tree });
    const newTree: Tree = [
        ...tree,
        _createBranchNode({
            tree,
            branch: newBranch,
            parent: parentBranch.key,
        }),
    ];

    _saveTree(newTree, deps);
};

const moveOnto = (
    {
        branch,
        parent,
    }: {
        branch: string;
        parent: ParentBranch;
    },
    deps: { storeService: StoreService }
) => {
    // todo: validate they cant be the same branch
    const tree = _readTree(deps);

    const parentBranch = _findParent({ parent, tree });
    const targetBranch = _findBranch({ branch, tree });

    targetBranch.parent = parentBranch.key;
    _saveTree(tree, deps);
};

const removeBranch = (
    branch: string,
    deps: { storeService: StoreService }
): BranchNode | undefined => {
    const tree = _readTree(deps);
    const branchToRemove = _findBranch({ branch, tree });

    if (!branchToRemove) return;

    const root = _getRoot({ tree });
    if (root.key === branchToRemove.key) {
        throw Error('Nah, imma do my own thing');
    }

    _saveTree(
        tree.filter((b) => b.key !== branchToRemove.key),
        deps
    );

    return branchToRemove;
};

const _createBranchNode = ({
    tree,
    branch,
    parent,
}: {
    tree: Tree;
    branch: string;
    parent: string | null;
}): BranchNode => {
    if (parent === null && tree.length) {
        throw Error('Uhhhh');
    }

    // todo: good validation? 😳also cleanup
    return {
        key: branch,
        parent,
    };
};

const _getRoot = ({ tree }: { tree: Tree }) => {
    const root = tree.find((b) => b.parent === null);
    if (!root) {
        throw Error('Root not found 🤨');
    }

    return root;
};

const _findBranch = ({ tree, branch }: { tree: Tree; branch: string }) => {
    const branchNode = tree.find((b) => b.key === branch);
    if (!branchNode) {
        throw Error('Branch not found 😬');
    }

    return branchNode;
};

const _saveTree = (tree: Tree, deps: { storeService: StoreService }) => {
    const { storeService } = deps;
    storeService.write(tree);
};

const _readTree = (deps: { storeService: StoreService }) => {
    const { storeService } = deps;
    const data = storeService.read();

    if (typeof data !== 'object') return [];

    // todo: validation is for nerds
    return data as Tree;
};

const _findParent = ({
    parent,
    tree,
}: {
    parent: ParentBranch;
    tree: Tree;
}): BranchNode => {
    let parentBranch: BranchNode;
    switch (typeof parent) {
        case 'string':
            parentBranch = _findBranch({ branch: parent, tree });
            break;
        case 'symbol':
            if (parent !== ROOT) {
                throw Error('Only the root can be accessed by symbol.');
            }
            parentBranch = _getRoot({ tree });
            break;
        default:
            return parent;
    }

    return parentBranch;
};

export interface TreeService {
    registerRoot: (branch: string) => void;
    attachTo: (args: { newBranch: string; parent: string }) => void;
    moveOnto: (args: { branch: string; parent: string }) => void;
    removeBranch: (branch: string) => void;
    get: () => Tree;
    ROOT: symbol;
}

export const ROOT = Symbol.for('ROOT');

export const createTreeService = (): TreeService => {
    const storeService = createStoreService({ filename: FILENAME });

    return {
        registerRoot: (branch) => {
            return registerRoot(branch, { storeService });
        },
        attachTo: (args) => {
            return attachTo(args, { storeService });
        },
        moveOnto: (args) => {
            return moveOnto(args, { storeService });
        },
        removeBranch: (branch) => {
            return removeBranch(branch, { storeService });
        },
        get: () => {
            return _readTree({ storeService });
        },
        ROOT,
    };
};
