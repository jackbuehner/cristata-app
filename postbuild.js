/**
 * This script moves the contents of the build folder into a
 * subdirectory based on `PUBLIC_URL` in `.env`.
 *
 * `react-scripts` generates the paths that expect the
 * directory configuration created by this script.
 */

const fs = require('fs-extra');
const dotenv = require('dotenv');

// get the tenant name from PUBLIC_URL in .env
dotenv.config();
const TENANT_NAME = process.env.PUBLIC_URL.slice(1).split('/')[0]; // get everything between first and second '/'

// copy build folder contents to folder with tenant name
fs.copySync('./build', `./${TENANT_NAME}`);

// empty build folder
fs.emptyDirSync('./build');

// move folder with tenant name into empty build folder
fs.moveSync(`./${TENANT_NAME}`, `./build/${TENANT_NAME}`);
