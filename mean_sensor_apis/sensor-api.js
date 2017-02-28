//
// Sensor gateway with REST interface and MongoDB backend 
//
// Sensor messages and DB schema are based on the same JSON template
// The sensor can ask for the schema and return its readings in JSON
// such that they can be saved without needing any parsing/reformatting 
//

var fs = require('fs');

// express etc
var express = require('express');
var app = express();
var bodyParser = require('body-parser');

// mongoose etc
var mongoose = require('mongoose');
var generator = require('mongoose-gen');
mongoose.Promise = global.Promise;

// connect to the (local) database
mongoose.connect('mongodb://localhost:27017/readingsdatabase')
  .then(() =>  console.log('connection succesful'))
  .catch((err) => console.error(err));

// read config files
var config = JSON.parse(fs.readFileSync('./sensor_config.json', 'utf8')); 
var schemaJson = JSON.parse(fs.readFileSync('./reading_schema.json', 'utf8'));
var registrationJson = JSON.parse(fs.readFileSync('./registration_schema.json', 'utf8'));

// Generate a schema for registration & a model

var RegistrationSchema = new mongoose.Schema(
   generator.convert(registrationJson)
);
var Registration = mongoose.model('Registration', RegistrationSchema);

// Generate a schema for readings & a model

var ReadingsSchema = new mongoose.Schema(
   generator.convert(schemaJson)
);
var Readings = mongoose.model('Readings', ReadingsSchema);

//
// express - defining the REST end points
//

// parse JSON bodies
app.use(bodyParser.json());

// sensor readings as json received in the req.body of the POST request
app.post('/readings',function(req,res) {
   // Add a server side timestamp
   var d = new Date().toISOString();
   req.body.updated_at = d;
   // Create an instance of the Readings model in memory
   // and fill it with req.body JSON which should match the schema
   var readings = new Readings(req.body);
   // Save it to database
   readings.save(function(err){
     if(err) console.log(err);
   });
   res.send("ack");
});

// sensor registration as json received in the req.body of the POST request
app.post('/registration',function(req,res) {
   // Add a server side timestamp
   var d = new Date().toISOString();
   req.body.updated_at = d;
   // Create an instance of the Registration model in memory
   // and fill it with req.body JSON which should match the schema
   var registration = new Registration(req.body);
   // Save it to database
   registration.save(function(err){
     if(err) console.log(err);
   });
   res.send("ack");
});

// sensor configuration update in the body of the GET response
app.get('/configuration',function(req,res) {
    res.send(config);
});

// sensor schema in the body of the GET response
app.get('/schema',function(req,res) {
    res.send(schemaJson);
});

// registration schema in the body of the GET response
app.get('/registration',function(req,res) {
    res.send(registrationJson);
});

// gateway time returned in the body of the GET response
app.get('/time',function(req,res) {
    var d = new Date();
    var time = { 
        "h" : d.getHours(),
        "m" : d.getMinutes(),
        "s" : d.getSeconds()
    }
    res.send(time);
});

// port
app.listen(4000);



