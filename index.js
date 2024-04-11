const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = 3000;

app.get('/gdphreg', async (req, res) => {
    try {
        const { username, password, fakeemail } = req.query;

        // Set headers with Chrome-like user-agent
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Referer': 'https://gdph.ps.fhgdps.com/tools/account/registerAccount.php',
            'Origin': 'https://gdph.ps.fhgdps.com/tools/account/registerAccount.php',
            'Content-Type': 'application/x-www-form-urlencoded'
        };

        // Simulate POST request to register account
        const response = await axios.post('https://gdph.ps.fhgdps.com/tools/account/registerAccount.php',
            `username=${username}&password=${password}&repeatpassword=${password}&email=${fakeemail}&repeatemail=${fakeemail}`,
            { headers }
        );

        // Log the response URL
        const responseUrl = response.request.res.responseUrl;
        console.log('Response URL:', responseUrl);

        // Make a GET request to the response URL
        const getPageResponse = await axios.get(responseUrl, { headers });

        // Load HTML content using cheerio
        const $ = cheerio.load(getPageResponse.data);

        // Check if "go to tools" or "tools" is detected
        const successTextDetected = $('body').text().toLowerCase().includes('go to tools') || $('body').text().toLowerCase().includes('tools');

        if (successTextDetected) {
            console.log('Registration successful!');
            res.json({ status: 'success', message: 'Registration successful!' });
        } else {
            console.log('Registration failed.');
            res.json({ status: 'error', message: 'Registration failed.' });
        }

    } catch (error) {
        console.error('Error registering account:', error);
        res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
