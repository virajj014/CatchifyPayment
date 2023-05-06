var express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');
var app = express();
var port = process.env.PORT || 4000;

// enable CORS
app.use(cors({ origin: '*' }))
// parse application/json
app.use(bodyParser.json());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// confirm the paymentIntent
app.post('/pay', async (request, response) => {
    console.log(request.body);
    try {
        // Create the PaymentIntent
        let intent = await stripe.paymentIntents.create({
            payment_method: request.body.payment_method_id,
            description: "Test payment",
            amount: parseInt(request.body.amount*100),
            currency: 'SGD',
            confirmation_method: 'manual',
            confirm: true
        });
        // Send the response to the client
        response.send(generateResponse(intent));
    } catch (e) {
        // Display error on client
        console.log(e);
        return response.send({ error: e.message });
    }
});

const generateResponse = (intent) => {
    console.log('intent ',intent);
    if (intent.status === 'succeeded') {
        // The payment didn’t need any additional actions and completed!
        // Handle post-payment fulfillment
        return {
            success: true
        };
    } else {
        // Invalid status
        return {
            error: 'Invalid PaymentIntent status'
        };
    }
};

// request handlers
app.get('/', (req, res) => {
    res.send('Stripe Integration! - Clue Mediator');
});

app.listen(port, () => {
    console.log('Server started on: ' + port);
});