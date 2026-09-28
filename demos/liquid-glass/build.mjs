// Builds the self-contained liquid glass demo: inlines the room plate as a
// data URI so the page works as one file.
//   node demos/liquid-glass/build.mjs [artifact-out]
// Writes public/liquid-glass.html (served at <base>/liquid-glass.html) and,
// optionally, a skeleton-less copy for publishing as an Artifact.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const plate = readFileSync(here('../../src/assets/room-plate.webp')).toString('base64');
const page = readFileSync(here('./template.html'), 'utf8')
  .replace('__PLATE__', `data:image/webp;base64,${plate}`);

writeFileSync(
  here('../../public/liquid-glass.html'),
  `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n</head>\n<body>\n${page}\n</body>\n</html>\n`,
);
if (process.argv[2]) writeFileSync(process.argv[2], page);
