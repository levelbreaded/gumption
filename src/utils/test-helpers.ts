/**
 * Taken from https://github.com/milesj/boost/blob/master/packages/cli/tests/helpers.ts
 */
export const KEYS = {
    // backspace: isWindows ? '\u0008' : '\u007F',
    // delete: isWindows ? '\u007F' : '\u001B[3~',
    backspace: '\u0008',
    delete: '\u007F',
    down: '\u001B[B',
    escape: '\u001B',
    left: '\u001B[D',
    pageDown: '\u001B[6~',
    pageUp: '\u001B[5~',
    return: '\r',
    right: '\u001B[C',
    tab: '\t',
    up: '\u001B[A',
};
