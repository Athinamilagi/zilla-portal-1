const express = require('express');
const router = express.Router();
const request = require('request');
const xml2js = require('xml2js');

// Get dashboard data for a customer
router.get('/dashboard-data/:customerId', async (req, res) => {
    try {
        const customerId = req.params.customerId.padStart(10, '0'); // Ensure 10 digits with leading zeros

        const options = {
            'method': 'POST',
            'url': 'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zssm34_p1_dash_ws?sap-client=100',
            'headers': {
                'Content-Type': 'text/xml',
                'Authorization': 'Basic SzkwMTQ1NzpTYW5qYXkxMjM0NQ==',
                'Cookie': 'sap-usercontext=sap-client=100'
            },
            body: `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                      xmlns:urn="urn:sap-com:document:sap:rfc:functions">
                <soapenv:Header/>
                <soapenv:Body>
                    <urn:ZSSM34_P1_DASH>
                        <IV_KUNNR>${customerId}</IV_KUNNR>
                    </urn:ZSSM34_P1_DASH>
                </soapenv:Body>
            </soapenv:Envelope>`
        };

        request(options, function (error, response) {
            if (error) {
                console.error('Error calling SAP service:', error);
                return res.status(500).json({ error: 'Failed to fetch dashboard data from SAP' });
            }

            // Parse XML response
            xml2js.parseString(response.body, (parseError, result) => {
                if (parseError) {
                    console.error('Error parsing XML response:', parseError);
                    return res.status(500).json({ error: 'Failed to parse SAP response' });
                }

                try {
                    // Extract customer data from the parsed XML
                    const dashboardResponse = result['soap-env:Envelope']['soap-env:Body'][0]['n0:ZSSM34_P1_DASHResponse'][0];
                    
                    // Format the response
                    const customerData = {
                        CITY: dashboardResponse.CITY[0] || '',
                        COUNTRY: dashboardResponse.COUNTRY[0] || '',
                        LAND1: dashboardResponse.LAND1[0] || '',
                        NAME1: dashboardResponse.NAME1[0] || '',
                        POSTPIN: dashboardResponse.POSTPIN[0] || '',
                        STREET: dashboardResponse.STREET[0] || ''
                    };

                    res.json(customerData);
                } catch (extractError) {
                    console.error('Error extracting data from parsed XML:', extractError);
                    res.status(500).json({ error: 'Failed to extract data from SAP response' });
                }
            });
        });
    } catch (error) {
        console.error('Error in dashboard route:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router; 