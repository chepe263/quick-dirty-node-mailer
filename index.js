const dotenv = require('dotenv').config()
const mailgun = require("mailgun-js");
const express = require('express')
const app = express()
const port = process.env.PORT || 3000

const mg = mailgun({apiKey: process.env.MAILGUN_APIKEY, domain: process.env.MAILGUN_DOMAIN});

app.get('/', (req, res) => res.send('Hello World!'))
app.get('/mail', (req, res) => {
    console.log("req",req)
    console.log("res",res)
    const data = {
        from: 'Formulario Contacto <no-reply@ptypages.ga>',
        to: process.env.MAIL_TO,
        subject: 'Hello',
        text: 'Testing some Mailgun awesomness!',
        html: 'Testing some <i>Mailgun</i> awesomness!',
        'h:Reply-To': process.env.MAIL_REPLY_TO
    };
    mg.messages().send(data, function (error, body) {
        console.log(body);
    });
    res.send('Hello World!')
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))