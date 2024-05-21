import Fake from './fake.js';
import React from 'react';
import { delay } from '../utils/delay.js';
import { describe, expect, it } from 'vitest';
import { render } from '@levelbreaded/ink-testing-library';

describe('fake', () => {
    it('yada', async () => {
        const a = render(<Fake />);

        await delay(100);
        a.stdin.write('H');
        await delay(100);
        a.stdin.write('L');
        console.log('output', a.lastFrame(), a.frames);
        // // const t = lastFrame();
        // await delay(100);
        expect(a.lastFrame()).to.equal('Hello, world!HL');
        // console.log('t', t);
    });
});
