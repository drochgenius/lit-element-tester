class PageBanner extends HTMLElement {
    public message: string;

    static get observedAttributes() {
        return ['message'];
    }

    constructor() {
        super(); // always call super() first in the constructor.
        console.log('page banner is being built');
    }

    attributeChangedCallback(attrName: string, oldVal: any, newVal: any) {
        if (attrName === 'message') {
            const h3: HTMLHeadingElement = document.createElement('h3');
            this.appendChild(h3);
            h3.innerHTML = `My banner shows this: ${newVal}`;
        }
    }

    public otherFuncNotCovered(){
        this.blur();
    }
}

customElements.define('page-banner', PageBanner);
