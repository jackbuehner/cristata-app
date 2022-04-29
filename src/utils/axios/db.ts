import axios from 'axios';
import { server } from '../constants';

const db = axios.create({
  baseURL: `${server.location}/api/v2`,
  withCredentials: true,
});

export { db };
