// Simple CORS test script
const testCORS = async () => {
  const baseURL = 'http://localhost:5000';
  
  try {
    // Test basic GET
    console.log('Testing GET /api/cors-test...');
    const getResponse = await fetch(`${baseURL}/api/cors-test`);
    const getData = await getResponse.json();
    console.log('GET Success:', getData);
    
    // Test POST
    console.log('Testing POST /api/cors-test...');
    const postResponse = await fetch(`${baseURL}/api/cors-test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ test: 'data' })
    });
    const postData = await postResponse.json();
    console.log('POST Success:', postData);
    
  } catch (error) {
    console.error('CORS Test Failed:', error);
  }
};

testCORS();