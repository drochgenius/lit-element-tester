import { LitElement, html, property } from '@polymer/lit-element';
import { TemplateResult } from 'lit-html';
import { Feedback, FeedbackType } from '../mixins/feedback.js';
import { applyMixins } from '../mixins/mixin-utils.js';

export class PageBanner extends LitElement implements Feedback {
    @property({ type: String })
    public message: string;
    @property({ type: Number })
    public value: number;
    
    // feedback mixin
    public getFeedback: (value: number) => FeedbackType;

    constructor() {
        super(); // always call super() first in the constructor.
        console.log('page banner is being built');
    }

    render(): TemplateResult {
        const { message, value } = this;
        return html`
            <h3>${message}</h3>
            <p>value = ${value}</p>
        `;
    }

    public otherFuncNotCovered() {
        this.blur();
    }
}

applyMixins(PageBanner, [Feedback]);

customElements.define('page-banner', PageBanner);
