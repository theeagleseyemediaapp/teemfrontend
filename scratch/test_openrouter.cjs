const fs = require('fs');
const path = require('path');

try {
  const envPath = path.join(process.cwd(), 'backend', '.env');
  const envContent = fs.readFileSync(envPath, 'utf8');
  let apiKey = '';
  envContent.split('\n').forEach(line => {
    if (line.startsWith('OPENROUTER_API_KEY=')) {
      apiKey = line.split('=')[1].trim().replace(/['"]/g, '');
    }
  });

  console.log('API Key Extracted (first 10 chars):', apiKey.substring(0, 10));

  fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://theeagleseyemedia.com',
      'X-Title': "The Eagle's Eye Media"
    },
    body: JSON.stringify({
      model: 'openrouter/free',
      messages: [{ role: 'user', content: 'Say hello in 5 words.' }]
    })
  })
  .then(res => res.json())
  .then(json => {
    console.log('STATUS:', json.error ? 'FAILED' : 'SUCCESS');
    console.log('RESPONSE:', JSON.stringify(json, null, 2));
  })
  .catch(err => {
    console.error('FETCH ERROR:', err);
  });
} catch (e) {
  console.error('SCRIPT ERROR:', e);
}
