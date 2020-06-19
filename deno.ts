import { join } from 'https://deno.land/std/path/mod.ts';

async function recursiveReaddir(path: string, options: ScanOptions) {
  const files: string[] = [];
  const getFiles = async (path: string) => {
    for await (const dirEntry of Deno.readDir(path)) {
      if (dirEntry.isDirectory) {
        await getFiles(join(path, dirEntry.name));
      } else if (dirEntry.isFile) {
        files.push(join(path, dirEntry.name));
      }
    }
  };
  await getFiles(path);
  const _r: string[] = [];
  if (options.fileFilter) {
    const { fileFilter } = options;
    files.map((file) => {
      let matches = false;
      fileFilter.forEach((filter) => {
        if (file.match(filter)) {
          matches = true;
        }
        // if (!file.includes('.js') && !file.includes('.test.ts'))
      });
      if (!matches) _r.push(file);
    });
  }
  return _r;
}

export interface ScanOptions {
  directoryBanlist?: string[]; // not working
  fileFilter?: RegExp[]; // not working
  replaceFunction?: (route: string) => string;
}

const defaultScanOptions: ScanOptions = {
  directoryBanlist: [],
  fileFilter: [/\.js$/, /\.test\.ts$/, /\.test\.js$/],
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
  const files = await recursiveReaddir(root, options);

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
