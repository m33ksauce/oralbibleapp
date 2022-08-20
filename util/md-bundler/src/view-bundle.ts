// This is the CLI Interface for generating bundles
// 
import * as path from 'path';
import { Bundle } from "./bundle";

let bundleFileArg = process.argv[2];

if (bundleFileArg == undefined) {
    console.log("No file supplied! Exiting!");
    process.exit(1)
}

var bundler = new Bundle();

bundler.loadBundle(bundleFileArg);
