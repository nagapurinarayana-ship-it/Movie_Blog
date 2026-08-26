import { readFile } from 'node:fs/promises';

const files = [
  ['data/movies.json', value => {
    const movies = Array.isArray(value) ? value : value?.movies;
    return Array.isArray(movies) && movies.every(movie =>
      movie && typeof movie.id === 'string' && typeof movie.title === 'string' &&
      typeof (movie.release_date || movie.releaseDate) === 'string' &&
      Array.isArray(movie.cast) && Array.isArray(movie.genres)
    );
  }],
  ['data/entities.json', value => Array.isArray(value?.actors) && Array.isArray(value?.directors)],
  ['data/articles.json', value => Array.isArray(value?.articles)],
  ['data/box-office.json', value => typeof value?.movies === 'object' && value?.movies !== null],
  ['data/ott.json', value => typeof value?.movies === 'object' && value?.movies !== null],
  ['data/content-opportunities.json', value => Array.isArray(value?.opportunities)],
  ['data/sources.json', value => Array.isArray(value?.sources)]
];

let failed = false;
for (const [path, validator] of files) {
  try {
    const raw = await readFile(path, 'utf8');
    const value = JSON.parse(raw);
    if (!validator(value)) throw new Error('schema check failed');
    console.log(`PASS ${path}`);
  } catch (error) {
    failed = true;
    console.error(`FAIL ${path}: ${error.message}`);
  }
}

if (failed) process.exit(1);
console.log('MovieBlog data validation passed.');
