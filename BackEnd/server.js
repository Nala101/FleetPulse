/**
 * server.js - The main entry point for your Node.js Backend
 */
import express from 'express';
import cors from 'cors'


const app = express();
const PORT = process.env.PORT || 3000;

export default app;


// CORS allows your frontend (e.g., React runing on port 5173) to talk to this backend
app.use(cors()); 

// Built-in middleware to parse JSON bodies (replaces body-parser)
app.use(express.json()); 


// Root Route: Simple check to see if server is alive
app.get('/', (req, res) => {
    res.send('Connected');
});

// API Route (GET): Fetch data
app.get('/api/car-status', (req, res) => {
    res.json({
        stats: {
          "Speed" : 0,
          "Rpm" : 0,
          "Fuel" : 0,
          "Tempurature" :0
        },
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

