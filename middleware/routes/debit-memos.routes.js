const express = require('express');
const router = express.Router();
const request = require('request');
const xml2js = require('xml2js');

// Get debit memos for a customer
router.post('/debit-memos/list', async (req, res) => {
    try {
        const customerId = req.body.customerId.padStart(10, '0'); // Ensure 10 digits with leading zeros

        const options = {
            'method': 'POST',
            'url': 'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zssm34_p1_debit_ws?sap-client=100',
            'headers': {
                'Content-Type': 'text/xml',
                'Authorization': 'Basic SzkwMTQ1NzpTYW5qYXkxMjM0NQ==',
                'Cookie': 'sap-usercontext=sap-client=100'
            },
            body: `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                      xmlns:urn="urn:sap-com:document:sap:rfc:functions">
                <soapenv:Header/>
                <soapenv:Body>
                    <urn:ZSSM34_P1_DEBIT>
                        <IV_KUNNR>${customerId}</IV_KUNNR>
                    </urn:ZSSM34_P1_DEBIT>
                </soapenv:Body>
            </soapenv:Envelope>`
        };

        request(options, function (error, response) {
            if (error) {
                console.error('Error calling SAP service:', error);
                return res.status(500).json({ error: 'Failed to fetch debit memos from SAP' });
            }

            try {
                // Parse the XML response
                xml2js.parseString(response.body, (parseError, result) => {
                    if (parseError) {
                        console.error('Error parsing XML response:', parseError);
                        return res.status(500).json({ error: 'Failed to parse SAP response' });
                    }

                    try {
                        // Extract debit memos data from the parsed XML
                        const debitMemosResponse = result['soap-env:Envelope']['soap-env:Body'][0]['n0:ZSSM34_P1_DEBITResponse'][0];
                        
                        // Get the ET_INVOICE_FRONT table data
                        const invoiceData = debitMemosResponse.ET_INVOICE_FRONT ? debitMemosResponse.ET_INVOICE_FRONT[0].item : [];
                        
                        // Format the response
                        const formattedData = Array.isArray(invoiceData) ? invoiceData.map(item => ({
                            id: item.VBELN ? item.VBELN[0] : 'N/A',
                            date: item.FKDAT ? item.FKDAT[0] : '',
                            amount: item.NETWR ? parseFloat(item.NETWR[0]) : 0,
                            reference: item.VBELN ? item.VBELN[0] : 'N/A',  // Using VBELN as reference
                            description: `Invoice ${item.VBELN ? item.VBELN[0] : 'N/A'}`,
                            status: 'Pending',  // Default status if not provided
                            currency: item.WAERK ? item.WAERK[0] : 'INR'
                        })) : [];

                        res.json({
                            success: true,
                            data: formattedData
                        });
                    } catch (extractError) {
                        console.error('Error extracting data from parsed XML:', extractError);
                        res.status(500).json({ error: 'Failed to extract data from SAP response' });
                    }
                });
            } catch (parseError) {
                console.error('Error processing SAP response:', parseError);
                res.status(500).json({ error: 'Failed to process SAP response' });
            }
        });
    } catch (error) {
        console.error('Error in debit memos route:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router; 