import {
    Subcategory
} from './Category';

export let Books = {
    Genesis: 0,
    Exodus: 1,
    Leviticus: 2,
    Numbers: 3,
    Deuteronomy: 4,
    Joshua: 5,
    Judges: 6,
    Ruth: 7,
    FirstSamuel: 8,
    SecondSamuel: 9,
    FirstKings: 10,
    SecondKings: 11,
    FirstChronicles: 12,
    SecondChronicles: 13,
    Ezra: 14,
    Nehemiah: 15,
    Esther: 16,
    Job: 17,
    Psalms: 18,
    Proverbs: 19,
    Ecclesiastes: 20,
    SongOfSolomon: 21,
    Isaiah: 22,
    Jeremiah: 23,
    Lamentations: 24,
    Ezekiel: 25,
    Daniel: 26,
    Hosea: 27,
    Joel: 28,
    Amos: 29,
    Obadiah: 30,
    Jonah: 31,
    Micah: 32,
    Nahum: 33,
    Habakkuk: 34,
    Zephaniah: 35,
    Haggai: 36,
    Zechariah: 37,
    Malachi: 38,
    Matthew: 39,
    Mark: 40,
    Luke: 41,
    John: 42,
    Acts: 43,
    Romans: 44,
    FirstCorinthians: 45,
    SecondCorinthians: 46,
    Galatians: 47,
    Ephesians: 48,
    Philippians: 49,
    Colossians: 50,
    FirstThessalonians: 51,
    SecondThessalonians: 52,
    FirstTimothy: 53,
    SecondTimothy: 54,
    Titus: 55,
    Philemon: 56,
    Hebrews: 57,
    James: 58,
    FirstPeter: 59,
    SecondPeter: 60,
    FirstJohn: 61,
    SecondJohn: 62,
    ThirdJohn: 63,
    Jude: 64,
    Revelation: 65,
    properties: {
        0: { displayName: "Genesis" },
        1: { displayName: "Exodus" },
        2: { displayName: "Leviticus" },
        3: { displayName: "Numbers" },
        4: { displayName: "Deuteronomy" },
        5: { displayName: "Joshua" },
        6: { displayName: "Judges" },
        7: { displayName: "Ruth" },
        8: { displayName: "1st Samuel" },
        9: { displayName: "2nd Samuel" },
        10: { displayName: "1st Kings" },
        11: { displayName: "2nd Kings" },
        12: { displayName: "1st Chronicles" },
        13: { displayName: "2nd Chronicles" },
        14: { displayName: "Ezra" },
        15: { displayName: "Nehemiah" },
        16: { displayName: "Esther" },
        17: { displayName: "Job" },
        18: { displayName: "Psalms" },
        19: { displayName: "Proverbs" },
        20: { displayName: "Ecclesiastes" },
        21: { displayName: "SongOfSolomon" },
        22: { displayName: "Isaiah" },
        23: { displayName: "Jeremiah" },
        24: { displayName: "Lamentations" },
        25: { displayName: "Ezekiel" },
        26: { displayName: "Daniel" },
        27: { displayName: "Hosea" },
        28: { displayName: "Joel" },
        29: { displayName: "Amos" },
        30: { displayName: "Obadiah" },
        31: { displayName: "Jonah" },
        32: { displayName: "Micah" },
        33: { displayName: "Nahum" },
        34: { displayName: "Habakkuk" },
        35: { displayName: "Zephaniah" },
        36: { displayName: "Haggai" },
        37: { displayName: "Zechariah" },
        38: { displayName: "Malachi" },
        39: { displayName: "Matthew" },
        40: { displayName: "Mark" },
        41: { displayName: "Luke" },
        42: { displayName: "John" },
        43: { displayName: "Acts" },
        44: { displayName: "Romans" },
        45: { displayName: "1st Corinthians" },
        46: { displayName: "2nd Corinthians" },
        47: { displayName: "Galatians" },
        48: { displayName: "Ephesians" },
        49: { displayName: "Philippians" },
        50: { displayName: "Colossians" },
        51: { displayName: "1st Thessalonians" },
        52: { displayName: "2nd Thessalonians" },
        53: { displayName: "1st Timothy" },
        54: { displayName: "2nd Timothy" },
        55: { displayName: "Titus" },
        56: { displayName: "Philemon" },
        57: { displayName: "Hebrews" },
        58: { displayName: "James" },
        59: { displayName: "1st Peter" },
        60: { displayName: "2nd Peter" },
        61: { displayName: "1st John" },
        62: { displayName: "2nd John" },
        63: { displayName: "3rd John" },
        64: { displayName: "Jude" },
        65: { displayName: "Revelation" }
    }
}

export interface AudioData {}

export class Media {
    Title: String
    Content: AudioData
}

export class Book implements Subcategory {
    public Title: String;
    private Media: Map < String, Media > ;

    constructor(title: String) {
        this.Title = title;
        this.Media = new Map < String, Media > ();
    }

    setMedia(m: Media) {
        this.Media.set(m.Title, m);
    }

    getMediaItem(title: String): Media {
        return this.Media.get(title);
    }
}