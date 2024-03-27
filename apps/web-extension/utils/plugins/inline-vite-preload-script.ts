/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * solution for multiple content scripts
 * https://github.com/Jonghakseo/chrome-extension-boilerplate-react-vite/issues/177#issuecomment-1784112536
 */
export default function inlineVitePreloadScript() {
  let vitePreload = "";
  return {
    name: "replace-vite-preload-script-plugin",
    async renderChunk(
      code: string,
      chunk: { fileName: string },
      options: any,
      meta: any,
    ) {
      if (!/content/.test(chunk.fileName)) {
        return null;
      }
      if (!vitePreload) {
        const chunkName: string | undefined = Object.keys(meta.chunks).find(
          (key) => /preload/.test(key),
        );
        if (!chunkName) {
          return null;
        }
        const modules = meta.chunks?.[chunkName]?.modules;
        vitePreload = modules?.[Object.keys(modules)?.[0]]?.code;
        vitePreload = vitePreload?.replaceAll("const ", "var ");
        if (!vitePreload) {
          return null;
        }
      }
      return {
        code: vitePreload + code.split(`\n`).slice(1).join(`\n`),
      };
    },
  };
}
