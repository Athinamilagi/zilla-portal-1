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

// Get invoice form PDF
router.get('/', async (req, res) => {
  const { customerId, salesDocNumber } = req.query;
  console.log('customerId', customerId);
  console.log('salesDocNumber', salesDocNumber);

  if (!customerId || !salesDocNumber) {
    return res.status(400).json({
      success: false,
      message: 'Customer ID and Sales Document Number are required'
    });
  }

  // SAP API Configuration
  const SAP_API_URL = 'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zssm34_p1_invoiceform_ws2?sap-client=100';
  const SAP_HEADERS = {
    'Content-Type': 'text/xml',
    'Authorization': 'Basic SzkwMTQ1NzpTYW5qYXkxMjM0NQ==',
    'Cookie': 'sap-usercontext=sap-client=100'
  };

  // Create SOAP envelope
  const soapEnvelope = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
    <soapenv:Header/>
    <soapenv:Body>
      <urn:ZSSM34_P1_INVOICE_FORM>
        <IV_KUNNR>${customerId}</IV_KUNNR>
        <IV_VBELN>${salesDocNumber}</IV_VBELN>
      </urn:ZSSM34_P1_INVOICE_FORM>
    </soapenv:Body>
  </soapenv:Envelope>`;

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
      console.log('Parsed Invoice Form Response:', JSON.stringify(parsedResponse, null, 2));

      // Extract PDF data from response
      const pdfData = parsedResponse.Envelope.Body.ZSSM34_P1_INVOICE_FORMResponse.EV_PDF_DATA;

      if (!pdfData) {
        return res.status(404).json({
          success: false,
          message: 'Invoice form not found'
        });
      }

      // Send PDF data in response
      res.json({
        success: true,
        data: pdfData
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

module.exports = router; 