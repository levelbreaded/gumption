import { Command } from '../types.js';
import { REGISTERED_COMMANDS } from '../command-registry.js';

export const findCommand = ({
    accessor,
    matchAliases = true,
}: {
    accessor: string;
    matchAliases?: boolean;
}): Command | undefined => {
    const result = Object.entries(REGISTERED_COMMANDS).find(
        ([key, command]) => {
            if (accessor === key) return true;
            if (accessor === command.config.key) return true;
            if (
                matchAliases &&
                command.config.aliases &&
                command.config.aliases.includes(accessor)
            )
                return true;
            return false;
        }
    );

    if (!result) return;

    const [, command] = result;
    return command;
};
