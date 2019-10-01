const mailgun = require("mailgun-js");
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3001;
const ejs = require('ejs');
const fs = require('fs');
if(process.env.DO_LOAD_DOTENV == undefined){
	const dotenv = require('dotenv').config();	
}
const mg = mailgun({apiKey: process.env.MAILGUN_APIKEY, domain: process.env.MAILGUN_DOMAIN});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => res.redirect(process.env.REDIRECT_HOME || 'http://google.com'))

var allowCrossDomain = function(req, res, next) {
	var allowed_from = process.env.CORS_ALLOW_ORIGINS.split(";");
	var should_allow = allowed_from.indexOf(req.get('origin')) !== -1;
	if(should_allow){
		console.log("Welcome to my mailer!");
		res.header('Access-Control-Allow-Origin', '*');
		res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
		res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

		// intercept OPTIONS method
		if ('OPTIONS' == req.method) {
		  res.sendStatus(200);
		}
		else {
		  next();
		}
	} else {
		console.log("Get out of here!", req.get('origin'));
		res.status(403).json({"result": "you are not allowed to talk to me"})
	}

};

app.use(allowCrossDomain);
app.post('/mail-ami', (req, res) => {
	var missing_info = [];
	if(!req.body.nombre || req.body.nombre.toString().length < 3){
		missing_info.push("nombre < 3");
	}
	if(!req.body.email ||req.body.email.toString().length < 3){
		missing_info.push("email < 3");
	}
	if(!req.body.telefono || req.body.telefono.toString().length < 6){
		missing_info.push("telefono < 3");
	}
	if(!req.body.servicio || req.body.servicio.toString().length < 3){
		missing_info.push("servicio < 3");
	}
	if(!req.body.mensaje || req.body.mensaje.toString().length < 3){
		missing_info.push("mensaje < 3");
	}
	if (missing_info.length > 0){		
		res.status(403).json({status: "error", "data": missing_info});
		return;
	}
	//load templates
	var contents_html = fs.readFileSync('templates/legales-ami.html', 'utf8');
	var contents_text = fs.readFileSync('templates/legales-ami.txt', 'utf8');
	//parse templates
	var compiled_html = ejs.render(contents_html, {
			nombre: req.body.nombre,
			email: req.body.email,
			telefono: req.body.telefono,
			servicio: req.body.servicio,
			mensaje: req.body.mensaje,
			
		});
	var compiled_text = ejs.render(contents_text, {
			nombre: req.body.nombre,
			email: req.body.email,
			telefono: req.body.telefono,
			servicio: req.body.servicio,
			mensaje: req.body.mensaje,
			
		});
    const data = {
        from: 'Formulario Contacto <no-reply-legales-ami@ptypages.ga>',
        to: process.env.MAIL_TO_LEGALES_AMI,
        subject: 'Formulario de Contacto',
        text: compiled_text,
        html: compiled_html,
        'h:Reply-To': process.env.MAIL_REPLY_TO
    };
    var message_status = mg.messages().send(data, function (error, body) {
        //console.log(body);
		if(body.message == 'Queued. Thank you.'){
			res.json({"result": "ok"})
		} else {
			res.json({"result": "nope"})
		}
		return body;
    });
    //res.send('Hello World!')
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))