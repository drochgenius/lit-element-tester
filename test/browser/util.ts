export function withSnippet(id: string, target: string = 'stage'): void {
    const template: HTMLTemplateElement = document.getElementById(id) as HTMLTemplateElement;
    const stage: HTMLElement = document.getElementById(target);

    const content: Node = template.content.cloneNode(true);
    stage.innerHTML = '';
    stage.appendChild(content);    
}
