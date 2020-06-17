import { recursiveReaddir } from 'https://deno.land/x/recursive_readdir/mod.ts';

export interface ScanOptions {
  directoryBanlist?: string[]; // not working
  fileFilter?: string[]; // not working
  replaceFunction?: (route: string) => string;
}

const defaultScanOptions: ScanOptions = {
  directoryBanlist: [],
  fileFilter: ['*.js', '*.ts', '!*.test.js', '!*.test.ts'],
};

type ScanImports = unknown & {
  // eslint-disable-next-line
  [key: string]: any;
};

export interface ScanResults {
  [key: string]: ScanImports;
}

export async function scan(root: string, imports: string[], scanOptions?: ScanOptions): Promise<ScanResults> {
  // Resolve root from working dir & apply options over defaults.
  const options = { ...defaultScanOptions, ...scanOptions };

  // Convert '\' to '/' in file paths
  const normalisedBanlist: string[] = [];
  if (options.directoryBanlist) {
    options.directoryBanlist.forEach((filter) => {
      normalisedBanlist.push(filter.replace(/\\/g, '/'));
    });
  }

  // Get file list from directory structure
  const files = await recursiveReaddir(root);

  const _i: ScanResults = {};

  // Iterate file list, normalise and run replace function
  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    const normalisedPath = file.replace(/\\/g, '/');
    const routeImport = await import(`file:///${await Deno.realPath(file)}`);

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
  }

  return _i;
}
