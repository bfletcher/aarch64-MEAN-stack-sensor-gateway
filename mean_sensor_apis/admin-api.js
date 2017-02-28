//
// Admin interface to sensor gateway 
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

// read schema files
var schemaJson = JSON.parse(fs.readFileSync('./reading_schema.json', 'utf8'));
var registrationJson = JSON.parse(fs.readFileSync('./registration_schema.json', 'utf8'));

var RegistrationSchema = new mongoose.Schema(
   generator.convert(registrationJson)
);
var Registration = mongoose.model('Registration', RegistrationSchema);

var registration = new Registration;

var ReadingsSchema = new mongoose.Schema(
   generator.convert(schemaJson)
);
var Readings = mongoose.model('Readings', ReadingsSchema);

var readings = new Readings;

//
// express - defining the REST end points
//

// parse JSON bodies
app.use(bodyParser.json());

app.get('/registration',function(req,res) {

   Registration.find(function (err, registration){
     if (err) return next(err);
     res.send(registration);
     console.log(registration)
   });
});

app.get('/readings',function(req,res) {
   // Optional params:
   //   sensor id 
   //   time_from, time_to (as a pair in ISO format)

   var query = new Object();
   var undef;
   if (req.query.id !== undef){
     query.id = req.query.id;
   }
   if ((req.query.time_from !== undef) && (req.query.time_to !== undef)){
     // console.log('** received dates ' + req.query.time_to + " and " + req.query.time_from) ;
     var startDate = new Date(req.query.time_from).toISOString();
     var endDate = new Date(req.query.time_to).toISOString(); 
     // console.log('** processed dates passed to query ' + startDate + " and " + endDate);
     query.updated_at = {
       $gte : startDate,
       $lt : endDate 
     }
   }

   console.log('query : ' + query);
   Readings.find( query , function (err, readings){
     if (err) return next(err);
     res.send(readings);
     console.log(readings)
   });
});

// ** 
// ** TEMPORARY!!
// **
// port
//app.listen(3001);
app.listen(4001);



