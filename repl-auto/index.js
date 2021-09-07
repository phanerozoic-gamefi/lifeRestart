import App from './app.js';
import { readFile, writeFile } from 'fs/promises';
import { Stream } from 'stream';
import fs from 'fs';
import seedrandom from 'seedrandom';

const seed = process.argv[2] || 'Phanerozoic';
const id = process.argv[3] || '1';

seedrandom(seed, { global: true });

async function main() {

    try {
        global.localStorage = JSON.parse(await readFile('__localStorage.json'));
    } catch (e) {
        global.localStorage = {};
    }

    global.dumpLocalStorage = async ()=>await writeFile('__localStorage.json', JSON.stringify( global.localStorage))

    const app = new App();

    // readable
    const readable = new Stream.Readable();
    const items = ['/remake', 's 0 1 2', 'n', 'rd']
    for(let i = 0; i < 500; i++) {
        items.push('n')
    }
    items.forEach(item => readable.push(item))
    readable.push(null);

    // writeable
    const writeable = new fs.createWriteStream(`${id}.txt`);

    app.io(
      repl => readable.on('data', data=>repl(data.toString().trim())),
      (data, isRepl) => writeable.write(`${data}${isRepl?'\n>':''}`, () => {console.log('write done, data:',data)}),
      async code=>{
          console.log('flushing..');
          writeable.end(() => {
              console.log('flush done.');
              process.once('exit', code => {
                  process.exitCode = code;
              });
          })
      }
    )

    await app.initial();
    app.start()


}

main();

// process.stdin.setRawMode(true);

// process.openStdin().on('keypress', function (chunk, key) {
//   process.stdout.write('Get Chunk: ' + chunk + '\n');
//   if (key && key.ctrl && key.name == 'c') process.exit();
// });