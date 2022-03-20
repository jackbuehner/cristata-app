import axios from 'axios';

const db = axios.create({
  baseURL: `${process.env.PUBLIC_URL}/api`,
  withCredentials: true,
});

export { db };
