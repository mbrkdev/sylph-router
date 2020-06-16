import { default as readdirp, EntryInfo } from 'readdirp';
import * as path from 'path';

export interface ScanOptions {
  directoryBanlist: string[];
  fileFilter?: string[];
}

const defaultScanOptions: ScanOptions = {
  directoryBanlist: [],
  fileFilter: ['*.js', '*.ts', '!*.test.js', '!*.test.ts'],
};

export interface ScanResults {
  routes: string[];
}

export async function scan(root: string, imports: string[], scanOptions?: ScanOptions): Promise<ScanResults> {
  // Resolve root from working dir & apply options over defaults.
  const resolvedRoot = path.resolve(process.cwd(), root);
  const options = { ...defaultScanOptions, ...scanOptions };

  // Convert '\' to '/' in file paths
  const normalisedBanlist: string[] = [];
  options.directoryBanlist.forEach((filter) => {
    normalisedBanlist.push(filter.replace('\\', '/'));
  });

  const files = await readdirp.promise(resolvedRoot, {
    fileFilter: options.fileFilter,

    directoryFilter: (entry: EntryInfo): boolean => {
      for (let i = 0; i < normalisedBanlist.length; i += 1) {
        const filter = normalisedBanlist[i];
        const normalisedPath = entry.path.replace('\\', '/');
        if (normalisedPath === filter) return false;
      }
      return true;
    },
  });
  console.log('------------');
  const _r: string[] = [];
  files.forEach((file) => {
    console.log(` - ${file.path}`);
    _r.push(file.path);
  });
  console.log(_r);

  return { routes: _r };
}
