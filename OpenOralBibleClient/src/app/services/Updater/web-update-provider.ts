import { AudioMetadata } from "src/app/interfaces/audio-metadata";
import { UpdateProvider } from "./update-provider";

export class WebUpdateProvider implements UpdateProvider {
    public getMetadata(version?: string): Promise<AudioMetadata> {
        return new Promise<AudioMetadata>(res => {
            return {
                Version: "1",
            }
        });
    }
    public getMedia(fileKey: string): Promise<ArrayBuffer> {
        return new Promise<ArrayBuffer>(res => new ArrayBuffer(1));
    }
}