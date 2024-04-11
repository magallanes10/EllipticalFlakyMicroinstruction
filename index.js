const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = 3000;

const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0',
    // Add more user-agents here
];

function getRandomUserAgent() {
    return userAgents[Math.floor(Math.random() * userAgents.length)];
}

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

app.get('/gdphreg', async (req, res) => {
    try {
        const { username, password, fakeemail } = req.query;

        const headers = {
            'User-Agent': getRandomUserAgent(),
            'Referer': 'https://gdph.ps.fhgdps.com/tools/account/registerAccount.php',
            'Origin': 'https://gdph.ps.fhgdps.com/tools/account/registerAccount.php',
            'Content-Type': 'application/x-www-form-urlencoded'
        };

        const response = await axios.post('https://gdph.ps.fhgdps.com/tools/account/registerAccount.php',
            `username=${username}&password=${password}&repeatpassword=${password}&email=${fakeemail}&repeatemail=${fakeemail}`,
            { headers }
        );

        const responseUrl = response.request.res.responseUrl;
        console.log('Response URL:', responseUrl);

        await delay(Math.random() * 5000); // Random delay between 0 to 5 seconds

        const getPageResponse = await axios.get(responseUrl, { headers });
        const $ = cheerio.load(getPageResponse.data);

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
