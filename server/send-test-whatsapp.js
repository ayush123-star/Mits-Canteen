const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const axios = require('axios');

const targetPhone = process.argv[2];

if (!targetPhone) {
  console.log('Usage: node server/send-test-whatsapp.js <Your_10_Digit_WhatsApp_Number>');
  console.log('Example: node server/send-test-whatsapp.js 9876543210');
  process.exit(1);
}

async function sendTest() {
  const token = process.env.META_WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const version = process.env.WHATSAPP_API_VERSION || 'v21.0';

  const clean = targetPhone.replace(/\D/g, '');
  const to = clean.length === 10 ? `91${clean}` : clean;

  console.log(`\n--- Sending Live WhatsApp Test ---`);
  console.log(`Sending to Phone Number: +${to}`);
  console.log(`From Phone Number ID: ${phoneId}`);

  try {
    const res = await axios.post(
      `https://graph.facebook.com/${version}/${phoneId}/messages`,
      {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'text',
        text: {
          preview_url: false,
          body: `🎉 *MITS Canteen — WhatsApp Notification Test*\n\nHello! Your Meta WhatsApp Cloud API is connected and working with MITS Canteen.\n\nYou will receive automatic updates whenever orders are placed, accepted, or ready at Counter 1! 🚀`,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    console.log('\n[SUCCESS] WhatsApp Message Sent Successfully!');
    console.log('Message ID (wamid):', res.data?.messages?.[0]?.id);
    console.log('\nCheck your WhatsApp now! 🎉');
  } catch (err) {
    const errorData = err.response?.data?.error || {};
    console.error('\n[FAILED] Meta API Call Error:');
    if (err.response) {
      console.error('HTTP Status:', err.response.status);
      console.error('Error Code:', errorData.code);
      console.error('Error Subcode:', errorData.error_subcode);
      console.error('Message:', errorData.message);
    } else {
      console.error(err.message);
    }

    // If outside 24h window (code 131047), try official Meta default 'hello_world' template
    if (errorData.code === 131047) {
      console.log('\n[INFO] Outside 24h customer window. Attempting Meta default "hello_world" template...');
      try {
        const tmplRes = await axios.post(
          `https://graph.facebook.com/${version}/${phoneId}/messages`,
          {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to,
            type: 'template',
            template: {
              name: 'hello_world',
              language: { code: 'en_US' }
            }
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            timeout: 10000,
          }
        );
        console.log('[SUCCESS] Meta "hello_world" Template Sent!');
        console.log('Message ID (wamid):', tmplRes.data?.messages?.[0]?.id);
        console.log('\nCheck your WhatsApp now! 🎉');
        return;
      } catch (tmplErr) {
        console.error('Template send error:', tmplErr.response?.data || tmplErr.message);
      }
    }

    if (errorData.code === 190) {
      console.log('\n👉 SOLUTION FOR CODE 190:');
      console.log('Your Meta WhatsApp Access Token in server/.env has EXPIRED.');
      console.log('Go to https://developers.facebook.com/ -> WhatsApp -> API Setup, copy the fresh token and update META_WHATSAPP_TOKEN in server/.env');
    } else if (errorData.code === 131030) {
      console.log('\n👉 SOLUTION FOR CODE 131030:');
      console.log(`Phone number +${to} is NOT in the allowed test recipient list.`);
      console.log('Go to Meta Dashboard -> WhatsApp -> API Setup -> "To" field -> Add Phone Number and verify with OTP.');
    }
  }
}

sendTest();
