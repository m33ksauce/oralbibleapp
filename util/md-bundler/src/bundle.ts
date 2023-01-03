import * as bson from 'bson';
import * as fs from 'fs';
import * as process from 'process';
import * as path from 'path';
import { promisify } from 'util';

import { MediaBundle, AudioMedia } from "./MediaBundle";

const readFile = promisify(fs.readFile);

export class Bundle {
    private bundle: MediaBundle;
    private bundleInputPaths:  string = process.cwd();

    constructor() {
        this.bundle = new MediaBundle();
    }

    public createBundle(inputPath: string, outputPath?: string) {
        this.bundleInputPaths = inputPath;
        this.addMetadata()
            .then(() => this.addMedia())
            .then(() => this
                .exportBundle(outputPath || path.resolve("../../bible-media/outputs")));
    }
    
    private async addMetadata() {
        return readFile(path.join(this.bundleInputPaths, '/metadata/metadata.json')).then((buf) => {
            console.log("set metadata");
            this.bundle.Metadata = JSON.parse(buf.toString());
        });
    }

    private async addMedia() {
        var audios = this.bundle.Metadata.Audio;
        if (audios == undefined) return Promise.reject();

        return Promise.all(audios.map(audio => {
            console.log("writing audio")
            return readFile(path.join(this.bundleInputPaths, '/', audio.file))
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

    private exportBundle(outputPath: string) {
        console.log("exporting")
        var bundleFile = bson.serialize(this.bundle);
        var filePath = path.join(outputPath, '/bundle.obd');
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