//
// Human readable interface to sensor gateway 
//

var fs = require('fs');

// express etc
var express = require('express');
var app = express();
var bodyParser = require('body-parser');

// mustache - for the templates
var mustache = require('mustache'); 

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

// 
// mongoose - setting up the schema and model
//

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

app.get('/registration/:slug', function(req, res){ // get the url and slug info
  var slug =[req.params.slug][0]; // grab the page slug
   Registration.find(function (err, registration){
     if (err) return next(err);
     console.log("Records found:  " + registration.length)
     var rData = {records:registration}; // wrap the data in a global object... (mustache starts from an object then parses)
     var page = fs.readFileSync(slug, "utf8"); // bring in the HTML file
     var html = mustache.to_html(page, rData); // replace all of the data
     res.send(html); // send to client
   });

});

app.get('/readings/:slug', function(req, res){ // get the url and slug info
  var slug =[req.params.slug][0]; // grab the page slug
   // query start
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
     console.log("Records found:  " + readings.length)
     var rData = {records:readings}; // wrap the data in a global object... (mustache starts from an object then parses)
     var page = fs.readFileSync(slug, "utf8"); // bring in the HTML file
     var html = mustache.to_html(page, rData); // replace all of the data
     res.send(html); // send to client
   });

});

// ** 
// ** TEMPORARY!!
// **
// port
//app.listen(3002);
app.listen(4002);


