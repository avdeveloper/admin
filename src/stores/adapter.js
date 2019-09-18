import axios from 'axios';
import config from './config';

const AXIOS_TIMEOUT = 1e3; // wait 1 second

export default axios.create({
  baseURL: config.host.href,
  timeout: AXIOS_TIMEOUT,
});
