import { describe, expect, it } from 'vitest';
import { safeBranchNameFromCommitMessage } from './naming.js';

describe('safeBranchNameFromCommitMessage is working normally', () => {
    it('it converts commit messages to branch names as expected', () => {
        expect(
            safeBranchNameFromCommitMessage(
                'name/fix(module-test): do cool things [ENG-1111]'
            )
        ).to.equal('name/fix_module-test_do_cool_things_eng-1111_');
    });
    it('handles special characters', () => {
        // this is just an arbitrary string containing random special characters
        expect(
            safeBranchNameFromCommitMessage(
                '!"#$%&\'()*+,.:;<=>?@[\\]^{}~‒–—―‘’“”«»…〈〉【】《》+−*=≠≤≥±∞≈×÷∑∫∂∇√$¢£€¥₣₤₹₱₩§¶©®™℅℗∴¨^`´~¯ˇ˘˙˚˛←→↑↓↔↕↖↗↘↙♪♩♫♬☼☽☾☀☁☂☃✓✔✕✖✗✘┌┐└┘├┤┬┴┼─│█▀▄▌▐░▒▓★☆☎☏☑❄❅❆☐🙂❤️👍\n'
            )
        ).to.equal('_');
    });
});
