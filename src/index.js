import { initMongoDB } from './db/initMongoConntection.js';
import { startServer } from './server.js';

const bootstrap = async () => {
  await initMongoDB();
  startServer();
};

bootstrap();
