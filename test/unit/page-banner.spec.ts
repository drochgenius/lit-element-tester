import { LitElement } from 'lit-element';
import { withSnippet } from '../browser/util.js';

const expect: Chai.ExpectStatic = chai.expect;

export default () => {
    describe('some example tests', () => {
        it('should be true', (): void => {
            expect(true).to.be.true;
        });

        it('print innerHTML', async (): Promise<void> => {
            withSnippet('first');
            const el: LitElement = document.querySelector('page-banner');
            await el.updateComplete;
            const message = 'Hello World!';
            expect(el.shadowRoot).not.to.be.undefined;
            const h3: HTMLHeadingElement = el.shadowRoot.querySelector('h3');

            expect(h3.innerText).to.equal(message);
        });
    });
};
