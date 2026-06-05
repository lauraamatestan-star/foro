const fs = require('fs');
const path = require('path');

const trimUrl = (url) => url.replace(/\/+$/, '');

const apiUrl = trimUrl(process.env.API_URL || 'https://TU-API.onrender.com/api');
const frontendUrl = trimUrl(
  process.env.FRONTEND_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://127.0.0.1:4200')
);

if (process.env.VERCEL && apiUrl.includes('TU-API.onrender.com')) {
  console.error('ERROR: Define API_URL en Vercel (ej. https://foro-api-6z8f.onrender.com/api)');
  process.exit(1);
}

const content = `export const environment = {
  production: true,
  apiUrl: '${apiUrl.replace(/'/g, "\\'")}',
  frontendUrl: '${frontendUrl.replace(/'/g, "\\'")}',
};
`;

fs.writeFileSync(path.join(__dirname, '../src/environments/environment.prod.ts'), content);
console.log('Generated environment.prod.ts');
console.log('  apiUrl:', apiUrl);
console.log('  frontendUrl:', frontendUrl);
