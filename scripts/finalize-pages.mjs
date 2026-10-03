import { rename, writeFile } from "node:fs/promises";

// Le Route Handler racine exporte « index » ; Pages attend « index.html ».
await rename("out/index", "out/index.html");
await writeFile("out/.nojekyll", "");
