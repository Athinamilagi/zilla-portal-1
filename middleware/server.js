const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { logger, loggerMiddleware } = require('./utils/logger');

// Import routes
const authRoutes = require('./routes/auth.routes');
const inquiryRoutes = require('./routes/inquiry.routes');
const orderRoutes = require('./routes/order.routes');
const deliveryRoutes = require('./routes/delivery.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const debitMemosRoutes = require('./routes/debit-memos.routes');
const creditMemosRoutes = require('./routes/credit-memos.routes');
const paymentsRoutes = require('./routes/payments.routes');
const invoiceRoutes = require('./routes/invoice.routes');
const invoiceFormRoutes = require('./routes/invoice-form.routes');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(loggerMiddleware);

// Routes
app.use('/api', authRoutes);
app.use('/api/inquiry', inquiryRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api', dashboardRoutes);
app.use('/api', debitMemosRoutes);
app.use('/api', creditMemosRoutes);
app.use('/api', paymentsRoutes);
app.use('/api/invoice', invoiceRoutes);
app.use('/api/invoice-form', invoiceFormRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  });
  res.status(500).json({
    success: false,
    message: 'An unexpected error occurred'
  });
});

// Start server
app.listen(port, () => {
  logger.info(`Server running at http://localhost:${port}`);
}); 