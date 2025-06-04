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

// POST /api/order/list
router.post('/list', async (req, res) => {
  const { kunnr } = req.body; // expects { "kunnr": "0000000004" }
  logger.info('Order list request for KUNNR:', kunnr);

  const SAP_API_URL = 'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zssm34_p1_sales_ws?sap-client=100';
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
    <n0:ZSSM34_P1_SALES xmlns:n0="urn:sap-com:document:sap:rfc:functions">
      <IV_KUNNR>${kunnr}</IV_KUNNR>
    </n0:ZSSM34_P1_SALES>
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
      logger.error('SAP Order API Error:', error);
      return res.status(500).json({
        success: false,
        message: `Error connecting to SAP system: ${error.message}`
      });
    }

    try {
      logger.info('Raw SAP Order Response:', response.body);
      const parsedResponse = await parseXMLResponse(response.body);

      // Extract the sales list from the SOAP response
      const soapBody = parsedResponse.Envelope.Body;
      const salesResponse = soapBody.ZSSM34_P1_SALESResponse;
      console.log('salesResponse', salesResponse);
      let salesList = salesResponse.ET_SALES?.item;

      // Ensure salesList is always an array
      if (!salesList) {
        salesList = [];
      } else if (!Array.isArray(salesList)) {
        salesList = [salesList];
      }

      logger.info('Order List Type:', typeof salesList, 'IsArray:', Array.isArray(salesList), 'Length:', salesList.length);
      logger.info('Order List Data:', salesList);
      res.json({
        success: true,
        data: salesList
      });
    } catch (parseError) {
      logger.error('Error parsing SAP Order response:', parseError);
      res.status(500).json({
        success: false,
        message: 'Error processing SAP response: ' + parseError.message
      });
    }
  });
});

module.exports = router; 