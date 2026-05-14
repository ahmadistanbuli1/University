import { loadEnv } from './config.js';
import { createApp } from './app.js';

const env = loadEnv();
const app = createApp(env);

app.listen(env.PORT, () => {
  console.log(`API listening on http://localhost:${env.PORT}`);
});
