const express = require('express');
const router = express.Router();
const request = require('request');
const xml2js = require('xml2js');
const { logger } = require('../utils/logger');

// Helper to parse XML response
const parseXMLResponse = (xmlString) => new Promise((resolve, reject) => {
  xml2js.parseString(xmlString, {
    explicitArray: false,
    trim: true,
    tagNameProcessors: [xml2js.processors.stripPrefix]
  }, (err, result) => err ? reject(err) : resolve(result));
});

// POST /api/inquiry/list
router.post('/list', async (req, res) => {
  const { kunnr } = req.body; // expects { "kunnr": "0000000004" }
  logger.info('Inquiry list request for KUNNR:', kunnr);

  const SAP_API_URL = 'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zssm34_p1_inquiry_ws?sap-client=100';
  const SAP_HEADERS = {
    'Content-Type': 'text/xml',
    'Authorization': 'Basic SzkwMTQ1NzpTYW5qYXkxMjM0NQ==',
    'Cookie': 'sap-usercontext=sap-client=100'
  };

  // Build SOAP envelope
  const soapEnvelope = `
<soap-env:Envelope xmlns:soap-env="http://schemas.xmlsoap.org/soap/envelope/">
  <soap-env:Header/>
  <soap-env:Body>
    <n0:ZSSM34_P1_INQUIRY xmlns:n0="urn:sap-com:document:sap:rfc:functions">
      <IV_KUNNR>${kunnr}</IV_KUNNR>
    </n0:ZSSM34_P1_INQUIRY>
  </soap-env:Body>
</soap-env:Envelope>`;

  const options = {
    method: 'POST',
    url: SAP_API_URL,
    headers: SAP_HEADERS,
    body: soapEnvelope,
    timeout: 10000,
    proxy: false,
    strictSSL: false
  };

  request(options, async (error, response) => {
    if (error) {
      logger.error('SAP Inquiry API Error:', error);
      return res.status(500).json({
        success: false,
        message: `Error connecting to SAP system: ${error.message}`
      });
    }

    try {
      logger.info('Raw SAP Inquiry Response:', response.body);
      const parsedResponse = await parseXMLResponse(response.body);

      // Extract the inquiry list from the SOAP response
      const soapBody = parsedResponse.Envelope.Body;
      const inquiryResponse = soapBody.ZSSM34_P1_INQUIRYResponse;
      let inquiryList = inquiryResponse.ET_INQUIRY?.item;

      // Ensure inquiryList is always an array
      if (!inquiryList) {
        inquiryList = [];
      } else if (!Array.isArray(inquiryList)) {
        inquiryList = [inquiryList];
      }

      console.log('Inquiry List Type:', typeof inquiryList, 'IsArray:', Array.isArray(inquiryList), 'Length:', inquiryList.length);
      console.log('Inquiry List Data:', inquiryList);
      res.json({
        success: true,
        data: inquiryList
      });
    } catch (parseError) {
      logger.error('Error parsing SAP Inquiry response:', parseError);
      res.status(500).json({
        success: false,
        message: 'Error processing SAP response: ' + parseError.message
      });
    }
  });
});

module.exports = router; 