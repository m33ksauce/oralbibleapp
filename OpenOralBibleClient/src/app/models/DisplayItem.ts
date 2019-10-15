export interface Displayable {
    title: string;
    target: string;
}

export class DisplayItem implements Displayable {
    title: string;
    target: string;
    
    constructor(title: string, target?: string) {
        this.title = title;
        this.target = target;
    }
}