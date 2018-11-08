import { LitElement, html, property } from '@polymer/lit-element';
import { TemplateResult } from 'lit-html';

export class PageBanner extends LitElement {
    @property({ type: String })
    public message: string;

    constructor() {
        super(); // always call super() first in the constructor.
        console.log('page banner is being built');
    }

    render(): TemplateResult {
        const { message } = this;
        return html`
            <h3>${message}</h3>
        `;
    }

    public otherFuncNotCovered() {
        this.blur();
    }
}

customElements.define('page-banner', PageBanner);
