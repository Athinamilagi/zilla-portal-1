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

// Get all invoices
router.get('/', async (req, res) => {
  const customerId = req.query.customerId;
  
  // SAP API Configuration
  const SAP_API_URL = 'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zssm34_p1_invoice_front_ws?sap-client=100';
  const SAP_HEADERS = {
    'Content-Type': 'text/xml',
    'Authorization': 'Basic SzkwMTQ1NzpTYW5qYXkxMjM0NQ==',
    'Cookie': 'sap-usercontext=sap-client=100'
  };

  // Create SOAP envelope
  const soapEnvelope = `<soap-env:Envelope xmlns:soap-env="http://schemas.xmlsoap.org/soap/envelope/">
    <soap-env:Header/>
    <soap-env:Body>
      <n0:ZSSM34_P1_INVOICE_FRONT xmlns:n0="urn:sap-com:document:sap:rfc:functions">
        <IV_KUNNR>${customerId}</IV_KUNNR>
      </n0:ZSSM34_P1_INVOICE_FRONT>
    </soap-env:Body>
  </soap-env:Envelope>`;

  // Make request to SAP API
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
      console.error('SAP API Error:', error);
      return res.status(500).json({
        success: false,
        message: `Error connecting to SAP system: ${error.message}`
      });
    }

    try {
      // Parse XML response
      const parsedResponse = await parseXMLResponse(response.body);
      console.log('Parsed Invoice List Response:', JSON.stringify(parsedResponse, null, 2));

      // Extract invoice list from response
      const invoiceList = parsedResponse.Envelope.Body.ZSSM34_P1_INVOICE_FRONTResponse.ET_INVOICE_FRONT.item;
      
      // Handle both single item and array responses
      const invoices = Array.isArray(invoiceList) ? invoiceList : [invoiceList];

      res.json({
        success: true,
        data: invoices.map(invoice => ({
          invoiceNumber: invoice.VBELN,
          date: invoice.FKDAT,
          amount: parseFloat(invoice.NETWR),
          currency: invoice.WAERK
        }))
      });
    } catch (parseError) {
      console.error('Error parsing SAP response:', parseError);
      res.status(500).json({
        success: false,
        message: 'Error processing SAP response: ' + parseError.message
      });
    }
  });
});

// Get invoice details by invoice number
router.get('/:invoiceNumber', async (req, res) => {
  const invoiceNumber = req.params.invoiceNumber;
  
  // SAP API Configuration
  const SAP_API_URL = 'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zssm34_p1_invoice_back_ws?sap-client=100';
  const SAP_HEADERS = {
    'Content-Type': 'text/xml',
    'Authorization': 'Basic SzkwMTQ1NzpTYW5qYXkxMjM0NQ==',
    'Cookie': 'sap-usercontext=sap-client=100'
  };

  // Create SOAP envelope
  const soapEnvelope = `<soap-env:Envelope xmlns:soap-env="http://schemas.xmlsoap.org/soap/envelope/">
    <soap-env:Header/>
    <soap-env:Body>
      <n0:ZSSM34_P1_INVOICE_BACK xmlns:n0="urn:sap-com:document:sap:rfc:functions">
        <IV_VBELN>${invoiceNumber}</IV_VBELN>
      </n0:ZSSM34_P1_INVOICE_BACK>
    </soap-env:Body>
  </soap-env:Envelope>`;

  // Make request to SAP API
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
      console.error('SAP API Error:', error);
      return res.status(500).json({
        success: false,
        message: `Error connecting to SAP system: ${error.message}`
      });
    }

    try {
      // Parse XML response
      const parsedResponse = await parseXMLResponse(response.body);
      console.log('Parsed Invoice Detail Response:', JSON.stringify(parsedResponse, null, 2));

      // Extract invoice details from response
      const invoiceResponse = parsedResponse.Envelope.Body.ZSSM34_P1_INVOICE_BACKResponse;
      const items = invoiceResponse.ET_ITEMS.item;

      // Transform the response
      const invoiceDetails = {
        success: true,
        data: {
          date: invoiceResponse.EV_FKDAT,
          amount: parseFloat(invoiceResponse.EV_NETWR),
          currency: invoiceResponse.EV_WAERK,
          items: Array.isArray(items) ? items : [items]
        }
      };

      res.json(invoiceDetails);
    } catch (parseError) {
      console.error('Error parsing SAP response:', parseError);
      res.status(500).json({
        success: false,
        message: 'Error processing SAP response: ' + parseError.message
      });
    }
  });
});

module.exports = router; 