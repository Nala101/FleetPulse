/**
 * server.js - The main entry point for your Node.js Backend
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Load environment variables from .env file


const app = express();
const PORT = process.env.PORT || 3000;


// CORS allows your frontend (e.g., React runing on port 5173) to talk to this backend
app.use(cors()); 

// Built-in middleware to parse JSON bodies (replaces body-parser)
app.use(express.json()); 


// Root Route: Simple check to see if server is alive
app.get('/', (req, res) => {
    res.send('Welcome to the Node.js Backend!');
});

// API Route (GET): Fetch data
app.get('/api/hello', (req, res) => {
    res.json({
        message: "Hello from the server!",
        timestamp: new Date(),
        status: "success"
    });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Error');
});


app.listen(PORT, () => {
    console.log(`---------------------------------------`);
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`---------------------------------------`);
});

