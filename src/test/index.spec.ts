const { expect } = chai;

describe('some example tests', () => {
    it('should be true', () => {
        expect(true).to.be.true;
    });
    it('print innerHTML', () => {
        withSnippet('first');
        const message = 'Hello World!';
        const html: string = document.querySelector('page-banner').innerHTML;
        expect(html).to.contain(message);
        expect(html).to.contain('My banner shows this');
        const attribute: string = document.querySelector('page-banner').getAttribute('message');
        expect(attribute).to.equal(message);
    });
});
