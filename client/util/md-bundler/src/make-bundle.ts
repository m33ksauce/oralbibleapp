// This is the CLI Interface for generating bundles
// 
import * as path from 'path';
import { Bundle } from "./bundle";

if (process.argv.length < 4) {
    console.error("Missing paramters!");
    process.exit(1);
}

let inputPathArg = process.argv[2];
let outputPathArg = process.argv[3];

if (inputPathArg == undefined || inputPathArg === "") {
    console.log("No input path supplied! Exiting!");
    process.exit(1)
}

if (outputPathArg == undefined || outputPathArg === "") {
    console.log("No output path supplied! Exiting!");
    process.exit(1);
}

let inputPath = path.resolve(inputPathArg);
let outputPath = path.resolve(outputPathArg);

var bundler = new Bundle();

bundler.createBundle(inputPath, outputPath);
