const express = require('express');
const contactRoutes = require('./src/routes/contactRoute');

const app = express();

app.use(express.json());
app.use('/api', contactRoutes);

module.exports = app;

