import * as fs from 'fs';
import * as path from 'path';
import { createServer } from 'vite';
import reactPlugin from '@vitejs/plugin-react';
import typescript from 'typescript';

// const srcDir = path.resolve(process.cwd(), 'fns');
// const destDir = path.resolve(process.cwd(), 'dist');

export async function dev(port) {
  try {
    if (!fs.existsSync(srcDir)) {
      console.log('No page functions found.');
      return;
    }
    
    // reset destDir
    if (fs.existsSync(destDir)) {
      fs.rmSync(destDir, { recursive: true });
    }
    fs.mkdirSync(destDir);

    const files = fs.readdirSync(srcDir);

    // check duplicate file name
    const fileNames = new Set();
    for (const file of files) {
      if (fileNames.has(file)) {
        throw new Error(`Duplicate page function name: ${file}`);
      }
      fileNames.add(file);
    }

    for await (const file of files) {
      const filePath = path.resolve(srcDir, file);
      if (fs.statSync(filePath).isDirectory()) {
        await createServer({
          configFile: false,
          root: filePath,
          plugins: [reactPlugin()],
          server: {
            port,
            hmr: {
              protocol: 'ws',
            },
          },
        })
          .then((server) => {
            return server.listen();
          })
          .then((server) => {
            server.printUrls();
            const output = `await import('http://localhost:${port}/@vite/client');\nawait import('http://localhost:${port}/@react-refresh').then(({default: RefreshRuntime}) => {RefreshRuntime.injectIntoGlobalHook(window);window.$RefreshReg$ = () => {};window.$RefreshSig$ = () => (type) => type;window.__vite_plugin_react_preamble_installed__ = true;}); await import('http://localhost:${port}/index.tsx');
            `;
            const destFilePath = path.resolve(
              destDir,
              file.split('.')[0] + '.js',
            );
            fs.writeFileSync(destFilePath, output);
          })
          .catch((err) => {
            console.error(err);
            process.exit(1);
          });
      } else if (file.match(/\.ts?$/)) {
        const destFilePath = path.resolve(
          destDir,
          file.replace(/\.ts$/, '.js'),
        );
        const ts = fs.readFileSync(filePath, 'utf-8');
        const js = typescript.transpileModule(ts, {
          compilerOptions: {
            target: typescript.ScriptTarget.ESNext,
            module: typescript.ModuleKind.ESNext,
          },
        }).outputText;
        fs.writeFileSync(destFilePath, js);
      } else {
        const destFilePath = path.resolve(destDir, file);
        fs.copyFileSync(filePath, destFilePath);
      }
    }
  } catch (err) {}
}
