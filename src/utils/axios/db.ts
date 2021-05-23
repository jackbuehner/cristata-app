import axios from 'axios';

const db = axios.create({
  baseURL:
    process.env.NODE_ENV === 'production'
      ? `https://api.thepaladin.cristata.app/api/v2`
      : `http://localhost:3001/api/v2`,
  withCredentials: true,
});

export { db };
