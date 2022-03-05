import * as bson from 'bson';
import * as fs from 'fs';
import * as process from 'process';
import * as path from 'path';
import { promisify } from 'util';

import { MediaBundle, AudioMedia } from "./MediaBundle";

const readFile = promisify(fs.readFile);

export class Bundle {
    private bundle: MediaBundle;

    constructor() {
        this.bundle = new MediaBundle();
    }

    public createBundle() {
        this.addMetadata()
            .then(() => this.addMedia())
            .then(() => this.exportBundle());
    }
    
    private async addMetadata() {
        return readFile(path.join(process.cwd(), 'inputs/metadata/metadata.json')).then((buf) => {
            console.log("set metadata");
            this.bundle.Metadata = JSON.parse(buf.toString());
        });
    }

    private async addMedia() {
        var audios = this.bundle.Metadata.Audio;
        if (audios == undefined) return Promise.reject();

        return Promise.all(audios.map(audio => {
            console.log("writing audio")
            return readFile(path.join(process.cwd(), 'inputs/', audio.file))
                .then(dataBuf => {
                    this.bundle.Media.push({
                        target: audio.id,
                        file: audio.file,
                        data: dataBuf
                    })
                    console.log("write complete")
                })
                .catch(err => console.log(err))
        }))
    }

    private exportBundle() {
        console.log("exporting")
        var bundleFile = bson.serialize(this.bundle);
        var filePath = path.join(process.cwd(), 'artifacts', 'bundle.obd');
        fs.writeFile(filePath, bundleFile, () => {});
    }

    loadBundle(name: string) {
        fs.readFile(path.join(process.cwd(), name), (err, buf) => {
            this.bundle = bson.deserialize(buf) as MediaBundle;
            this.displayBundleMetadata();
        });
    }

    displayBundleMetadata() {
        console.log(this.bundle);
    }
}