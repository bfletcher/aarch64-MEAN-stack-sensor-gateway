/**
 * SensorHttpJSONClient.ino
 *
 *  Created on: 20.02.2017
 *
 */

#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <ESP8266WiFiMulti.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>

#include "DHT.h"

#define USE_SERIAL Serial


#define CLIENT_ID "1234"

// Networking 

#define ENDPT0 "http://192.168.0.101:3000/configuration"
#define ENDPT1 "http://192.168.0.101:3000/time"
#define ENDPT2 "http://192.168.0.101:3000/schema"
#define ENDPT3 "http://192.168.0.101:3000/readings"

#define JSON_BUF 400

// General sensor configuration
const char* sensors[] = {
// 10 sensor slots 
// namestring, slot, sensor
0,             /* 0 NULL */
"temperature", /* 1 DHT22 Temp */
"humidity",    /* 2 DHT22 Humidity */
0,             /* 3 NULL */
0,             /* 4 NULL */
0,             /* 5 NULL */
0,             /* 6 NULL */
0,             /* 7 NULL */
0,             /* 8 NULL */
0              /* 9 RTC  */
};

// sensor read functions array
float (*read_fns[10]) (void);
// up to 10 sensor read functions
float read_DHT22_Temp(void);
float read_DHT22_Humidity(void);

// Specific sensor configuration
// DHT22
#define DHTTYPE DHT22   // DHT 22  (AM2302), AM2321
#define DHTPIN 2        // what digital pin we're connected to
DHT dht(DHTPIN, DHTTYPE);

// Globals
ESP8266WiFiMulti WiFiMulti;

const char* ptr;
unsigned goodPayload = 0;
String payload;

// state counter
int cycle = 0;

void setup() {

    USE_SERIAL.begin(115200);
    // USE_SERIAL.setDebugOutput(true);

    // Initialize function array 
    read_fns[1] = read_DHT22_Temp;
    read_fns[2] = read_DHT22_Humidity;
    // end of initialize function array 

    // sensor initialisation
    dht.begin();

    USE_SERIAL.println();
    USE_SERIAL.println();
    USE_SERIAL.println();

    for(uint8_t t = 4; t > 0; t--) {
        USE_SERIAL.printf("[SETUP] WAIT %d...\n", t);
        USE_SERIAL.flush();
        delay(1000);
    }

    WiFiMulti.addAP("TP-LINK_8792", "your_wifipassword");

}

void loop() {
    // wait for WiFi connection
    if((WiFiMulti.run() == WL_CONNECTED)) {

        HTTPClient http;
        int httpCode;
        
        StaticJsonBuffer<JSON_BUF> jsonInBuffer;
        StaticJsonBuffer<JSON_BUF> jsonOutBuffer;

        USE_SERIAL.print("[HTTP] begin...\n");
 
        // cycle through (4) states
        switch(cycle%4){

          case 0:
          http.begin(ENDPT0); // Config
          USE_SERIAL.print("[HTTP] GET Config \n");
          // start connection and send HTTP header
          httpCode = http.GET();
          break;
        
          case 1:
          http.begin(ENDPT1); // Time
          USE_SERIAL.print("[HTTP] GET Time \n");
          // start connection and send HTTP header
          httpCode = http.GET();
          break;
        
          case 2:
          http.begin(ENDPT2); // Schema
          USE_SERIAL.print("[HTTP] GET Schema \n");
          // start connection and send HTTP header
          httpCode = http.GET();
          break;

          case 3:
          USE_SERIAL.print("[HTTP] POST Readings \n");
          // if the last HTTP transfer was good, 'payload' contains the schema
          char outboundBuffer[JSON_BUF];
          if(goodPayload) {
            JsonObject& rootIn = jsonInBuffer.parseObject(payload.c_str());
            // Test if parsing succeeds.
              if (!rootIn.success()) {
                Serial.println("parsing schema failed");
              } else {             
                // Build the outbound JSON object with the readings
                Serial.printf("Building the outbound object\n");
                JsonObject& rootOut = jsonOutBuffer.createObject();
                // loop through the keys in the schema
                for (JsonObject::iterator it=rootIn.begin(); it!=rootIn.end(); ++it)
                {
                  // for each key create a new key in the 'out' buffer with zero value
                  rootOut[it->key] = 0;
                  // For each sensor slot, if it is not null, check it against the schema 
                  // if that key and the sensor entry match, update it with a call to the
                  // sensor read function
       
                  for(unsigned ii=0; ii< sizeof(sensors)/sizeof(ptr); ii++ ){
                    if(sensors[ii] && !strcmp(it->key, sensors[ii])){
                      rootOut[it->key] = (*read_fns[ii]) ();
                      Serial.printf("updated sensor %s in schema keys \n",sensors[ii]);
                      break;
                    }  
                  }
                  rootOut["id"] = CLIENT_ID;
                }
                rootOut.printTo(Serial); 
                rootOut.printTo(outboundBuffer,sizeof(outboundBuffer)); 
                Serial.printf("Output length is %d \n",rootOut.measureLength());
              }    
          } else {
            Serial.printf("Bad payload signalled\n");
          }
          http.begin(ENDPT3); // Readings
          USE_SERIAL.print("[HTTP] POST...\n");
          // start connection and send HTTP header
          http.addHeader("Content-Type", "application/json");
          httpCode = http.POST(outboundBuffer);
          break;
       
        }

        cycle++;

        // httpCode will be negative on error
        if(httpCode > 0) {
            // HTTP header has been send and Server response header has been handled
            USE_SERIAL.printf("[HTTP] ... code: %d\n", httpCode);

            if(httpCode == HTTP_CODE_OK) {
                payload = http.getString();
                goodPayload = 1;
                
                // Diagnostic output for now
                USE_SERIAL.println(payload);
                JsonObject& rootIn = jsonInBuffer.parseObject(payload.c_str());

                // Test if parsing succeeds.
                if (!rootIn.success()) {
                  Serial.println("parseObject() failed");
                } else {
                  Serial.println("Print all the keys in the object");
                  for (JsonObject::iterator it=rootIn.begin(); it!=rootIn.end(); ++it)
                  {
                    Serial.println(it->key);
                  }
                } 
            }  
        } else {
            USE_SERIAL.printf("[HTTP] ... failed, code: %d error: %s\n", httpCode, http.errorToString(httpCode).c_str());
        }

        http.end();
    }

    delay(10000);
}


/* Sensor read functions */

float read_DHT22_Temp(void){
   float ret;
   ret = dht.readTemperature();
   return ret;
}

float read_DHT22_Humidity(void){
   float ret;
   ret = dht.readHumidity();
   return ret;
}


