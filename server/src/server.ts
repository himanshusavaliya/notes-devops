
import { createApp } from './app';
import { config } from './config';
import { createNoteRepository } from './repositories/repositoriesfactory';

console.log('Factory Function =', createNoteRepository);
console.log('Store Type =', config.storeType);

const repository = createNoteRepository('memory');

console.log('Server Repository =', repository);

const app = createApp(repository, config.publicDir);

app.listen(config.port, () => {
  console.log(`Notes API listening on port ${config.port}`);
});