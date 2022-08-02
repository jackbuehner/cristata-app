import axios from 'axios';
import { server } from '../constants';

const db = axios.create({
  baseURL: `${server.location}/v3`,
  withCredentials: true,
});

export { db };
