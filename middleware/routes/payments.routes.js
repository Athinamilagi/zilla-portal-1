const express = require('express');
const router = express.Router();
const request = require('request');
const xml2js = require('xml2js');
const { logger } = require('../utils/logger');

// Get payments and aging data for a customer
router.post('/payments/list', async (req, res) => {
    try {
        const customerId = req.body.customerId.padStart(10, '0'); // Ensure 10 digits with leading zeros

        const options = {
            'method': 'POST',
            'url': 'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zssm34_p1_aging_ws?sap-client=100',
            'headers': {
                'Content-Type': 'text/xml',
                'Authorization': 'Basic SzkwMTQ1NzpTYW5qYXkxMjM0NQ==',
                'Cookie': 'sap-usercontext=sap-client=100'
            },
            body: `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                      xmlns:urn="urn:sap-com:document:sap:rfc:functions">
                <soapenv:Header/>
                <soapenv:Body>
                    <urn:ZSSM34_P1_AGING>
                        <IV_KUNNR>${customerId}</IV_KUNNR>
                    </urn:ZSSM34_P1_AGING>
                </soapenv:Body>
            </soapenv:Envelope>`
        };

        request(options, function (error, response) {
            if (error) {
                logger.error('Error calling SAP service:', error);
                return res.status(500).json({ error: 'Failed to fetch payments from SAP' });
            }

            try {
                // Parse the XML response
                xml2js.parseString(response.body, (parseError, result) => {
                    if (parseError) {
                        logger.error('Error parsing XML response:', parseError);
                        return res.status(500).json({ error: 'Failed to parse SAP response' });
                    }

                    try {
                        // Extract payments data from the parsed XML
                        const paymentsResponse = result['soap-env:Envelope']['soap-env:Body'][0]['n0:ZSSM34_P1_AGINGResponse'][0];
                        
                        // Get the ET_RESULT table data
                        const paymentData = paymentsResponse.ET_RESULT ? paymentsResponse.ET_RESULT[0].item : [];
                        
                        // Format the response
                        const formattedData = Array.isArray(paymentData) ? paymentData.map(item => ({
                            id: item.VBELN ? item.VBELN[0] : 'N/A',
                            documentDate: item.FKDAT ? item.FKDAT[0] : '',
                            dueDate: item.DUE_DT ? item.DUE_DT[0] : '',
                            amount: item.NETWR ? parseFloat(item.NETWR[0]) : 0,
                            currency: item.WAERK ? item.WAERK[0] : 'EUR',
                            aging: item.AGING ? item.AGING[0] : 'N/A',
                            status: calculatePaymentStatus(item.AGING ? item.AGING[0] : '')
                        })) : [];

                        res.json({
                            success: true,
                            data: formattedData
                        });
                    } catch (extractError) {
                        logger.error('Error extracting data from parsed XML:', extractError);
                        res.status(500).json({ error: 'Failed to extract data from SAP response' });
                    }
                });
            } catch (parseError) {
                logger.error('Error processing SAP response:', parseError);
                res.status(500).json({ error: 'Failed to process SAP response' });
            }
        });
    } catch (error) {
        logger.error('Error in payments route:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Helper function to calculate payment status based on aging
function calculatePaymentStatus(aging) {
    if (!aging) return 'Unknown';
    
    const days = parseInt(aging);
    if (isNaN(days)) {
        const match = aging.match(/-?\d+/);
        if (match) {
            const numDays = parseInt(match[0]);
            if (numDays < 0) return 'Upcoming';
            if (numDays > 30) return 'Overdue';
            return 'Due Soon';
        }
        return 'Unknown';
    }
    
    if (days < 0) return 'Upcoming';
    if (days > 30) return 'Overdue';
    return 'Due Soon';
}

module.exports = router; 