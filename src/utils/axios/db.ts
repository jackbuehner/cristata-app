import axios from 'axios';

const db = axios.create({
  baseURL: `${process.env.REACT_APP_API_BASE_URL}/api/v2`,
  withCredentials: true,
});

export { db };
