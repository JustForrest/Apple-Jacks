const { execSync } = require('child_process');
const http = require('http');

console.log('Waiting for Appsmith to start...');

// Function to check if Appsmith is ready
function checkAppsmithReady() {
  return new Promise((resolve) => {
    const req = http.request({
      host: 'localhost',
      port: 80,
      path: '/api/v1/health',
      method: 'GET',
      timeout: 2000
    }, (res) => {
      if (res.statusCode === 200) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
    
    req.on('error', () => {
      resolve(false);
    });
    
    req.end();
  });
}

// Check every 5 seconds
async function waitForAppsmith(maxAttempts = 24) { // 2 minutes max
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    const ready = await checkAppsmithReady();
    if (ready) {
      console.log('Appsmith is ready!');
      return true;
    }
    
    console.log(`Waiting for Appsmith to start (attempt ${attempts + 1}/${maxAttempts})...`);
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
    attempts++;
  }
  
  console.error('Timed out waiting for Appsmith to start');
  return false;
}

// Main function
async function main() {
  const appsmithReady = await waitForAppsmith();
  
  if (appsmithReady) {
    console.log('Initializing Prisma...');
    try {
      execSync('npx prisma init', { stdio: 'inherit' });
      console.log('Prisma initialization complete!');
    } catch (error) {
      console.error('Failed to initialize Prisma:', error);
    }
  }
}

main().catch(console.error);