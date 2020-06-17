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

type ScanImports = unknown & {
  // eslint-disable-next-line
  [key: string]: () => any;
};

export interface ScanResults {
  [key: string]: ScanImports;
}

export async function scan(root: string, imports: string[], scanOptions?: ScanOptions): Promise<ScanResults> {
  // Resolve root from working dir & apply options over defaults.
  const resolvedRoot = path.resolve(process.cwd(), root);
  const options = { ...defaultScanOptions, ...scanOptions };

  // Convert '\' to '/' in file paths
  const normalisedBanlist: string[] = [];
  if (options.directoryBanlist) {
    options.directoryBanlist.forEach((filter) => {
      normalisedBanlist.push(filter.replace(/\\/g, '/'));
    });
  }

  // Get file list from directory structure
  const files = await readdirp.promise(resolvedRoot, {
    fileFilter: options.fileFilter,

    directoryFilter: (entry: EntryInfo): boolean => {
      for (let i = 0; i < normalisedBanlist.length; i += 1) {
        const filter = normalisedBanlist[i];
        const normalisedPath = entry.path.replace(/\\/g, '/');
        if (normalisedPath === filter) return false;
      }
      return true;
    },
  });

  const _i: ScanResults = {};

  // Iterate file list, normalise and run replace function
  await files.forEach(async (file) => {
    const normalisedPath = file.path.replace(/\\/g, '/');
    const routeImport = await import(path.resolve(process.cwd(), root, normalisedPath));

    const importRecord: ScanImports = {};
    imports.forEach((importKey: string) => {
      importRecord[importKey] = routeImport[importKey];
    });
    if (options.replaceFunction) {
      const replacedPath = options.replaceFunction(normalisedPath);
      _i[replacedPath] = importRecord;
    } else {
      _i[normalisedPath] = importRecord;
    }
  });

  return _i;
}
