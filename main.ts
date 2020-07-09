import * as path from 'path';
import fs from 'fs';

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
  const options = { ...defaultScanOptions, ...scanOptions };

  const normalisedBanlist: string[] = [];
  if (options.directoryBanlist) {
    options.directoryBanlist.forEach((filter) => {
      // Convert '\' to '/' in file paths
      normalisedBanlist.push(filter.replace(/\\/g, '/'));
    });
  }
  if (!fs.existsSync(path.resolve(process.cwd(), root))) {
    return {};
  }
  const getAllFiles = (root: string, arrayOfFiles: string[]): string[] => {
    const fileList = fs.readdirSync(path.resolve(process.cwd(), root));

    fileList.forEach((file) => {
      const filePath = root + '/' + file;
      const fr = fs.statSync(filePath);

      if (fr.isDirectory()) {
        const normalisedPath = filePath.replace(/\\/g, '/');
        let allowPath = true;
        for (let i = 0; i < normalisedBanlist.length; i += 1) {
          const filter = `${root}/${normalisedBanlist[i]}`;
          if (normalisedPath === filter) allowPath = false;
        }
        if (allowPath) arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
      } else {
        arrayOfFiles.push(filePath);
      }
    });

    return arrayOfFiles;
  };

  const files: string[] = getAllFiles(root, []);
  files.forEach((fi, i) => {
    files[i] = fi.replace(root, '');
  });

  const _i: ScanResults = {};
  if (files.length === 0) return _i;
  // Iterate file list, normalise and run replace function
  await files.forEach(async (file) => {
    const normalisedPath = file.replace(/\\/g, '/').replace(/^\/?/g, '');
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
