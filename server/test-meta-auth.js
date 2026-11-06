const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const axios = require('axios');

async function testAuth() {
  const token = process.env.META_WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const version = process.env.WHATSAPP_API_VERSION || 'v21.0';

  console.log('--- Testing Meta WhatsApp API Credentials ---');
  console.log('Phone Number ID:', phoneId);

  try {
    const res = await axios.get(`https://graph.facebook.com/${version}/${phoneId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      timeout: 10000
    });
    console.log('\n[SUCCESS] Meta API Connected Successfully!');
    console.log('Registered Phone Details:', JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error('\n[ERROR] Meta API Check Failed:');
    if (err.response) {
      console.error('HTTP Status:', err.response.status);
      console.error('Error Details:', JSON.stringify(err.response.data, null, 2));
    } else {
      console.error(err.message);
    }
  }
}

testAuth();
