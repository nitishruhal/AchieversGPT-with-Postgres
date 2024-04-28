const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const PORT = 5000;
const API_KEY = process.env.API_KEY;

// PostgreSQL database configuration
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'signup',
    password: 'ruhal',
    port: 5432, // Default PostgreSQL port
});

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// API endpoint for GPT-3.5 completions
app.post('/completions', async (req, res) => {
    const options = {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: req.body.message }],
            max_tokens: 100
        })
    };
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', options);
        const data = await response.json();
        res.send(data);
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred");
    }
});

// API endpoint for user signup
app.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const result = await pool.query('INSERT INTO users (username, email, password) VALUES ($1, $2, $3)', [username, email, password]);
        res.status(200).json({ message: 'Signup successful' });
    } catch (error) {
        console.error('Error executing the query:', error);
        res.status(500).json({ message: 'An error occurred' });
    }
});

// API endpoint for user login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1 AND password = $2', [email, password]);
        if (result.rows.length === 0) {
            console.log("Invalid credentials");
            return res.status(200).json({ message: 'Invalid credentials' });
        }
        console.log(result.rows[0]);
        return res.status(200).json({ result: result.rows[0], message: 'Login successful' });
    } catch (error) {
        console.error('Error executing the query:', error);
        res.status(500).json({ message: 'An error occurred' });
    }
});

app.listen(PORT, () => {
    console.log("Your Server is running on PORT: " + PORT);
});
