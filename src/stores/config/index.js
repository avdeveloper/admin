import devConfig from './env.dev.js';
import prodConfig from './env.prod.js';

let config = { ...devConfig };

// eslint-disable-next-line
switch (process.env.NODE_ENV) {
  case 'production':
    config = { ...config, ...prodConfig };
    break;
}

export default config;
