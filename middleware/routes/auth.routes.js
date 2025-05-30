const express = require('express');
const router = express.Router();
const request = require('request');
const xml2js = require('xml2js');

// Helper function to parse XML response
const parseXMLResponse = (xmlString) => new Promise((resolve, reject) => {
  xml2js.parseString(xmlString, { 
    explicitArray: false, 
    trim: true,
    tagNameProcessors: [xml2js.processors.stripPrefix]
  }, (err, result) => err ? reject(err) : resolve(result));
});

// Login endpoint
router.post('/login', async (req, res) => {
  const { userId, password } = req.body;
  console.log('Login attempt for user:', userId);
  
  // SAP API Configuration for login
  const SAP_API_URL = 'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zssm34_p1_login?sap-client=100';
  const SAP_HEADERS = {
    'Content-Type': 'text/xml',
    'Authorization': 'Basic SzkwMTQ1NzpTYW5qYXkxMjM0NQ==',
    'Cookie': 'sap-usercontext=sap-client=100'
  };

  // Create SOAP envelope
  const soapEnvelope = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
   <soapenv:Header/>
   <soapenv:Body>
      <urn:ZSSM34_P1_LOGIN>
         <IV_KUNNR>0</IV_KUNNR>
         <IV_PASSWORD>${password}</IV_PASSWORD>
         <IV_USERID>${userId}</IV_USERID>
      </urn:ZSSM34_P1_LOGIN>
   </soapenv:Body>
</soapenv:Envelope>`;

  console.log('Attempting to connect to SAP at:', SAP_API_URL);

  // Make request to SAP API with timeout
  const options = {
    method: 'POST',
    url: SAP_API_URL,
    headers: SAP_HEADERS,
    body: soapEnvelope,
    timeout: 10000,
    proxy: false,
    strictSSL: false
  };

  request(options, async function (error, response) {
    if (error) {
      console.error('SAP API Error Details:', {
        code: error.code,
        message: error.message,
        syscall: error.syscall,
        address: error.address,
        port: error.port
      });

      if (error.code === 'ETIMEDOUT') {
        return res.status(504).json({
          success: false,
          message: 'Connection to SAP system timed out. Please check your network connection and VPN status.'
        });
      }

      if (error.code === 'ECONNREFUSED') {
        return res.status(503).json({
          success: false,
          message: 'Could not connect to SAP system. Please check if the SAP server is accessible.'
        });
      }

      return res.status(500).json({
        success: false,
        message: `Error connecting to SAP system: ${error.message}`
      });
    }

    try {
      console.log('SAP Response Status:', response.statusCode);
      console.log('SAP Response Headers:', response.headers);
      console.log('Raw SAP Response:', response.body);

      // Parse XML response
      const parsedResponse = await parseXMLResponse(response.body);
      console.log('Successfully parsed XML:', JSON.stringify(parsedResponse, null, 2));

      // Extract the response data from the SOAP envelope
      const soapBody = parsedResponse.Envelope.Body;
      const loginResponse = soapBody.ZSSM34_P1_LOGINResponse;

      console.log('Extracted login response:', loginResponse);

      // Check the response structure and determine success
      if (loginResponse && loginResponse.EV_MESSAGE === 'WELCOME USER') {
        res.json({
          success: true,
          message: 'Login successful',
          kunnr: loginResponse.EV_KUNNR || userId
        });
      } else {
        res.json({
          success: false,
          message: loginResponse?.EV_MESSAGE || 'Invalid credentials'
        });
      }
    } catch (parseError) {
      console.error('Error parsing SAP response:', parseError);
      console.error('Parse error details:', {
        name: parseError.name,
        message: parseError.message,
        stack: parseError.stack
      });
      res.status(500).json({
        success: false,
        message: 'Error processing SAP response: ' + parseError.message
      });
    }
  });
});

module.exports = router; 