import * as fs from 'fs';
import * as path from 'path';
import { build as viteBuild } from 'vite';
import reactPlugin from '@vitejs/plugin-react';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

const srcDir = path.resolve(process.cwd(), 'fns');
const destDir = path.resolve(process.cwd(), 'dist');

export async function build() {
  try {
    if (!fs.existsSync(srcDir)) {
      console.log('No page functions found.');
      return;
    }
    const files = fs.readdirSync(srcDir);

    // check duplicate file name
    const fileNames = new Set();
    for (const file of files) {
      if (fileNames.has(file)) {
        throw new Error(`Duplicate page function name: ${file}`);
      }
      fileNames.add(file);
    }

    const inputFiles = [];
    for (const file of files) {
      const filePath = path.resolve(srcDir, file);
      if (fs.statSync(filePath).isDirectory()) {
        const indexFilePath = path.resolve(filePath, 'index.ts');
        const indexFilePathTSX = path.resolve(filePath, 'index.tsx');
        if (fs.existsSync(indexFilePath)) {
          inputFiles.push(indexFilePath);
        } else if (fs.existsSync(indexFilePathTSX)) {
          inputFiles.push(indexFilePathTSX);
        } else {
          throw new Error(
            `Missing index.ts in folder page function: ${filePath}`,
          );
        }
      } else {
        inputFiles.push(filePath);
      }
    }

    await viteBuild({
      plugins: [reactPlugin(), cssInjectedByJsPlugin()],
      build: {
        rollupOptions: {
          input: inputFiles,
          output: {
            entryFileNames: (chunkInfo) => {
              if (!chunkInfo.facadeModuleId) return '[name].js';
              const pathParts = chunkInfo.facadeModuleId.split('/');
              const fileName = pathParts[pathParts.length - 1];
              const folderName = pathParts[pathParts.length - 2];

              if (fileName.match(/^index\.(ts|tsx)$/)) {
                return `${folderName}.js`;
              }
              return '[name].js';
            },
          },
        },
        outDir: destDir,
        emptyOutDir: true,
        write: true,
      },
    });
    console.log('Build completed successfully.');
  } catch (err) {
    console.error('Build failed:', err);
  }
}
