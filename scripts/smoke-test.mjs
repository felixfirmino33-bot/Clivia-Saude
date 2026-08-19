import http from 'node:http';

const baseUrl = process.env.SMOKE_URL || 'http://localhost:4173';

const checkUrl = (url) => new Promise((resolve, reject) => {
  const req = http.get(url, (res) => {
    const { statusCode } = res;
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
      if (statusCode && statusCode >= 200 && statusCode < 500) {
        resolve({ statusCode, body: body.slice(0, 200) });
      } else {
        reject(new Error(`Unexpected status ${statusCode} for ${url}`));
      }
    });
  });

  req.on('error', reject);
});

const run = async () => {
  try {
    const home = await checkUrl(baseUrl);
    console.log('SMOKE_HOME_OK', home.statusCode, home.body.slice(0, 80));
    process.exit(0);
  } catch (error) {
    console.error('SMOKE_FAILED', error.message);
    process.exit(1);
  }
};

run();
