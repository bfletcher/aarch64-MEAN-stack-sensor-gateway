# aarch64 MEAN stack sensor gateway

## About

A simple sensor gatway demonstrating end-to-end use of JSON as an interchange format. It leverages the 
MEAN stack (MongoDB, Express, Angular*, NodeJS) to provide web api endpoints for simple RESTful APIs.
Sensor readings are stored locally on the gateway via the sensor API and aggregated readings can be 
retrieved via the admin API or viewed via the UI API.

The NodeJS applications and the MongoDB instance run in Docker containers. As MongDB is only supported
on Ubuntu for aarch64, Ubuntu Xenial is used as a base for all the containers.

Tested with Debian on Qualcomm Dragonboard DB410C. APIs tested with Postman (Chrome plugin).

## Install

Build the containers

In the mongodb directory
```
$ docker build -t mongodb .
```
In the mean_sensor_gateway directory
```
$ docker build -t mean-sensor-gateway .
```
## Start

Start the containers

The same container image is used for all the api instances, but started with a different argument.
```
$ docker run -p 27017:27017 --name mongo_instance -d mongodb
$ docker run -p 3000:3000 --net=host -d --name sensor-api mean-sensor-gateway sensor-api
$ docker run -p 3001:3001 --net=host -d --name admin-api mean-sensor-gateway admin-api
$ docker run -p 3002:3002 --net=host -d --name ui-api mean-sensor-gateway ui-api
```
## API Reference

### Sensor API (port 3000)
```
URL: /registration
Method: POST
Post body: Filled registration object
Success Response: ack

URL: /configuration
Method: GET
Success Response: JSON configuration data

URL: /time
Method: GET
Success Response: JSON time object

URL: /schema
Method: GET
Success Response: JSON schema object

URL: /readings
Method: POST
Post Body: filled JSON schema
Success Response: "ack"
```
### Admin API (port 3001)
```
URL: /readings
Method: GET
URL Params: id (optional)
Success Response: array of schema entries

URL: /registration
Method: GET
Success Response: array of registration entries 
```
 
### UI API (port 3002)
```
URL: /readings
Method: GET
URL Params: id (optional)
Success Response: formatted table of schema entries

URL: /registration
Method: GET
Success Response: formatted table of registration entries 
```

## JSON Objects

### Example Configuration
```
{
   "wifi_retries": 5,
   "wifi_retries_period": 120,
   "gateway_retries": 5,
   "gateway_retries_period": 10,
   "readings_interval": 900,
   "averaging": "on",
   "post_failures_max": 3
}
```
### Example Schema
```
{
  "id": {"type": "String"},
  "temperature": {"type": "Number"},
  "humidity": {"type": "Number"},
  "pir": {"type": "Number"},
  "lux": {"type": "Number"},
  "updated_at": { "type": "Date" }
}
```
