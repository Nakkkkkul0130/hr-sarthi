import https from 'https';
import http from 'http';

const API_BASE = 'http://localhost:5000';

// Test endpoints
const endpoints = [
  { path: '/', method: 'GET', name: 'Root' },
  { path: '/api', method: 'GET', name: 'API Info' },
  { path: '/api/health', method: 'GET', name: 'Health Check' },
  { path: '/api/auth/login', method: 'POST', name: 'Login', body: { email: 'admin@hrsarthi.com', password: 'admin123' } },
  { path: '/api/employees', method: 'GET', name: 'Employees' },
  { path: '/api/wellness/programs', method: 'GET', name: 'Wellness Programs' },
  { path: '/api/helpdesk/faq', method: 'GET', name: 'FAQ' },
  { path: '/api/analytics/dashboard', method: 'GET', name: 'Dashboard Analytics' }
];

async function testEndpoint(endpoint) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: endpoint.path,
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          name: endpoint.name,
          status: res.statusCode,
          success: res.statusCode < 400,
          path: endpoint.path,
          method: endpoint.method,
          response: data.length > 0 ? JSON.parse(data) : null
        });
      });
    });

    req.on('error', (error) => {
      resolve({
        name: endpoint.name,
        status: 'ERROR',
        success: false,
        path: endpoint.path,
        method: endpoint.method,
        error: error.message
      });
    });

    if (endpoint.body) {
      req.write(JSON.stringify(endpoint.body));
    }

    req.end();
  });
}

async function runTests() {
  console.log('🚀 Testing HR SARTHI API Endpoints...\n');
  
  const results = [];
  
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    results.push(result);
    
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.name}: ${result.method} ${result.path} - ${result.status}`);
    
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  }
  
  console.log('\n📊 Test Summary:');
  const passed = results.filter(r => r.success).length;
  const total = results.length;
  console.log(`Passed: ${passed}/${total}`);
  
  if (passed < total) {
    console.log('\n❌ Failed Tests:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`- ${r.name}: ${r.status} ${r.error || ''}`);
    });
  }
}

runTests().catch(console.error);