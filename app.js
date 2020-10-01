// node modules declaration
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const mailchimp = require('@mailchimp/mailchimp_marketing');
const https = require('https');
require('dotenv').config();

mailchimp.setConfig({
  apiKey: process.env.API_KEY,
  server: process.env.SERVER_ID,
});

// creation of the express app
const app = express();
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

//setting up home route
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/signup.html');
});

// processing the post request on the home route and storing info into variables
app.post('/', (req, res) => {
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const email = req.body.email;

  // creation of data object
  const data = {
    email_address: email,
    status: 'subscribed',
    merge_fields: {
      FNAME: firstName,
      LNAME: lastName,
    },
  };
  // flatpacking the data object into a JSON to send to mailchimp.
  const jsonData = JSON.stringify(data);

  const listId = process.env.LIST_ID;

  // creating the request
  async function run() {
    const response = await mailchimp.lists
      .addListMember(listId, data)
      .then((response) => {
        if (response.statusCode !== 200) {
          res.sendFile(__dirname + '/success.html');
        }
      })
      .catch((err) => {
        res.sendFile(__dirname + '/failure.html');
        console.log(err);
      });
  }
  run();
});

app.post('/failure', (req, res) => res.redirect('/'));

app.listen(process.env.PORT || 3000, () =>
  console.log('Server is running on port 3000.')
);
