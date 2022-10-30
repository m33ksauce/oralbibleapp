export enum MediaType {
    Category = 1,
    Audio,
}

export class MediaListItem {
    name: string
    type: MediaType
    index?: number
    children?: MediaListItem[]
    audioTargetId?: string

    constructor(name: string, type: MediaType) {
        this.name = name;
        this.type = type;
    }

    public hasChildren(): boolean {
        return (this.children != undefined) && (this.children.length > 0);
    }

    public getTotalChildMediaCount(): number {
        if (!this.hasChildren()) return 0;
        let ownChildrenCount = this.children.filter(child => child.hasTarget()).length;
        let childrenSubcounts =  this.children.filter(child => !child.hasTarget())
            .map(child => child.getTotalChildMediaCount())
            .reduce((total, subcount) => total += subcount,
                0);
        
        return ownChildrenCount + childrenSubcounts;
    }

    public hasTarget(): boolean {
        return this.audioTargetId != undefined && this.audioTargetId != null;
    }
}