// Load environment variables FIRST
require('dotenv').config();

// Import the Express app
const app = require('./app');

// Read PORT from environment variables or use default
const PORT = process.env.PORT || 5000;

// Start the server - listen on all network interfaces for device access
app.listen(PORT, '0.0.0.0', () => {
  console.log(` Server is running on port ${PORT}`);
  console.log(` Local: http://localhost:${PORT}/`);
  console.log(` Network: http://172.16.2.51:${PORT}/`);
  console.log(` API endpoint: http://localhost:${PORT}/api/analyze-user-text`);
  console.log(` Started at: ${new Date().toISOString()}`);
});

