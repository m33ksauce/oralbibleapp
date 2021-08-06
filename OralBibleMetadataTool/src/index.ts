import {Command, flags} from '@oclif/command'

import { Bundle } from './bundle';

class Oralbiblemetadatatool extends Command {
  static description = 'Bundle your metadata here'

  static flags = {
    // add --version flag to show CLI version
    version: flags.version({char: 'v'}),
    help: flags.help({char: 'h'}),
    // flag with a value (-n, --name=VALUE)
    name: flags.string({char: 'n', description: 'name to print'}),
    // flag with no value (-f, --force)
    force: flags.boolean({char: 'f'}),
  }

  async run() {
    const {args, flags} = this.parse(Oralbiblemetadatatool)

    var bundle = new Bundle();

    if (flags.name) {
      bundle.loadBundle(flags.name);
      return
    }

    bundle.createBundle();

  }
}

export = Oralbiblemetadatatool
