import { default as readdirp, EntryInfo } from 'readdirp';
import * as path from 'path';

export interface ScanOptions {
  directoryBanlist?: string[];
  fileFilter?: string[];
  replaceFunction?: (route: string) => string;
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
  if (options.directoryBanlist) {
    options.directoryBanlist.forEach((filter) => {
      normalisedBanlist.push(filter.replace('\\', '/'));
    });
  }

  // Get file list from directory structure
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

  const _r: string[] = [];

  // Iterate file list, normalise and run replace function
  files.forEach((file) => {
    const normalisedPath = file.path.replace('\\', '/');
    if (options.replaceFunction) {
      _r.push(options.replaceFunction(normalisedPath));
    } else {
      _r.push(normalisedPath);
    }
  });

  return { routes: _r };
}
