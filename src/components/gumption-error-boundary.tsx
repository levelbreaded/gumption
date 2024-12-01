import ErrorDisplay from './error-display.js';
import React, { ReactNode } from 'react';
import { RebaseConflict } from './rebase-conflict.js';
import { SelectRootBranch } from './select-root-branch.js';
import { UntrackedBranch } from './untracked-branch.js';

interface GumptionErrorBoundaryProps {
    children: ReactNode;
}

interface GumptionErrorBoundaryState {
    hasError: boolean;
    error: Error | undefined;
}

export class GumptionErrorBoundary extends React.Component<
    GumptionErrorBoundaryProps,
    GumptionErrorBoundaryState
> {
    constructor(props: GumptionErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: undefined };
    }

    // @ts-expect-error - I'm tired
    componentDidCatch(error: any) {
        this.setState({ hasError: true, error: error as unknown as Error });
    }

    // @ts-expect-error - I'm tired
    render() {
        if (!this.state.hasError || !this.state.error) {
            return this.props.children;
        }

        if (this.state.error.name === 'NoRootBranchError') {
            return <SelectRootBranch />;
        }

        if (this.state.error.name === 'UntrackedBranchError') {
            return <UntrackedBranch />;
        }

        if (this.state.error.name === 'RebaseConflictError') {
            return <RebaseConflict />;
        }

        return <ErrorDisplay error={this.state.error} />;
    }
}
