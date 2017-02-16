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

// 
// mongoose - setting up the schema and model
//

var ReadingsSchema = new mongoose.Schema(
   generator.convert(schemaJson)
);
var Readings = mongoose.model('Readings', ReadingsSchema);

// Create an instance of the Readings model in memory 
var readings = new Readings;

//
// express - defining the REST end points
//

// parse JSON bodies
app.use(bodyParser.json());


app.get('/readings',function(req,res) {
   // Find specific sensor data in the Readings collection. 
   // sensor id is a query param
   Readings.find( function (err, readings) {
     if (err) return next(err);
     res.send(readings);
     console.log(readings)
   });
});

// port
app.listen(3001);



