export interface Subcategory {}

export class Category {
    name: String;
    subcategories: Array<Subcategory>;
    backgroundURI: String;

    constructor(name?: String, subcat?: Array<Subcategory>, imageSrc?: String) {
        this.name = name || "";
        this.subcategories = subcat || new Array();
        this.backgroundURI = imageSrc || "";
    }
}