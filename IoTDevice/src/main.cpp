#include <Arduino.h>							// Includes the Arduino library for standard Arduino functions
#include <HTTPClient.h>                         // Includes the HTTP client library for functions used to send HTTP requests
#include <WiFi.h>                               // Includes the WiFi library used to handle WiFi connections for the ESP32
#include <WiFiClient.h>                         // Includes the WiFi client library used to provide a TCP connection client over WiFi
#include "Wire.h"                               // Includes the Wire library for I2C communication
#include "DHT20.h"                              // Includes the DHT20 library for interacting with the humidity/temperature sensor
#include <ArduinoJson.h>                        // Includes the Arduino JSON library for creating JSON payloads
#include <constants.h>							// Includes the constants file that contains the Wi-Fi SSID, Wi-Fi password, SAS token, ROOT CA, IoT hub name, IoT device name, and IoT hub endpoint url
#include "gps.h"								// Includes the library used to interact with the GPS sensor
#include "dht.h"								// Includes the library used to interact with the DHT sensor
#include "obd.h"								// Includes the library used to interact with the OBD sensor

// Sets the telemetry interval to 3 seconds
#define TELEMETRY_INTERVAL 3000
unsigned long lastTelemetryTime = 0;            // Used to track the timestamp of the last time telemetry data was sent to the Azure IoT Hub

// Setups the IoT device
void setup() {
	// Starts the serial console and setups each sensor
    Serial.begin(9600);
    setupGPS();
	setupDHT();
	setupOBD();

    WiFi.mode(WIFI_STA);                        // Sets the WiFi module to station mode since we are not hosting our own network
    delay(1000);                                // Waits 1 second for the WiFi mode change to complete
	Serial.printf("\n\nConnecting to %s\n", WIFI_SSID);
	WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
	while (WiFi.status() != WL_CONNECTED) {
        delay(500);                             // Waits half a second before rechecking the WiFi connection status
        Serial.printf(".%i", WiFi.status());    // Prints out the WiFi status code from the connection attempt
    }

	configTime(0, 0, "pool.ntp.org", "time.nist.gov");

	// Time sync code from chatgpt
	Serial.println("Waiting for NTP time sync...");
	time_t now = time(nullptr);
	while (now < 1700000000) {
		delay(200);
		now = time(nullptr);
	}

	Serial.println("\nWiFi connected");         // Prints out that the ESP32 successfully connected to the WiFi
    // Prints out the ESP32's assigned IP address
    Serial.println("IP address:");
    Serial.println(WiFi.localIP());
    // Prints out the ESP32's assigned MAC address
    Serial.println("MAC address:");
    Serial.println(WiFi.macAddress());
}

// The main loop function that sends telemetry data to the IoT Hub
void loop() {
	// If it has been longer than the telemetry interval, send another telemetry message
	if (millis() - lastTelemetryTime >= TELEMETRY_INTERVAL) {
		ArduinoJson::JsonDocument doc;
		// Gets the data from the GPS, prints each data value to the console, and stores each data value into the JSON payload
		Serial.println("------GPS------");
		const GPSData gpsData = requestGPSData();
		Serial.println(gpsData.fix);
		doc["fix"] = gpsData.fix;
		Serial.println(gpsData.satellites);
		doc["satellites"] = gpsData.satellites;
		Serial.println(gpsData.latitude, 14);
		doc["latitude"] = gpsData.latitude;
		Serial.println(gpsData.longitude, 14);
		doc["longitude"] = gpsData.longitude;

		// Gets the data from the DHT, prints each data value to the console, and stores each data value into the JSON payload
		Serial.println("------DHT------");
		const DHTData dhtData = requestDHTData();
		Serial.println(dhtData.temperature);
		doc["cabinTemperature"] = dhtData.temperature;
		Serial.println(dhtData.humidity);
		doc["cabinHumidity"] = dhtData.humidity;

		// Gets the data from the OBD, prints each data value to the console, and stores each data value into the JSON payload
		Serial.println("------OBD------");
		const OBDData obdData = requestOBDData();
		Serial.printf("%.2f mph\n", obdData.mph);
		doc["mph"] = obdData.mph;
		Serial.printf("%.10f mi\n", obdData.milesTraveled);
		doc["milesTraveled"] = obdData.milesTraveled;
		Serial.printf("%.2f rpm\n", obdData.rpm);
		doc["rpm"] = obdData.rpm;
		Serial.printf("%.2f %%\n", obdData.fuelPercent);
		doc["fuelPercent"] = obdData.fuelPercent;
		Serial.printf("%.2f gal/h\n", obdData.galPerHour);
		doc["galPerHour"] = obdData.galPerHour;
		Serial.printf("%.10f gal\n", obdData.galUsed);
		doc["galUsed"] = obdData.galUsed;
		Serial.printf("%.2f F\n", obdData.engineTemp);
		doc["engineTemp"] = obdData.engineTemp;

		// Flattens the JSON payload into buffer
		char buffer[512];
        serializeJson(doc, buffer, sizeof(buffer));

		// Prints out the JSON payload
		Serial.println(buffer);

		// Sets the ROOT CA certificate
        WiFiClientSecure client;
        client.setCACert(ROOT_CA);

		// Creates the HTTP object and header
		HTTPClient http;
        http.begin(client, url);
        http.addHeader("Content-Type", "application/json");
        http.addHeader("Authorization", SAS_TOKEN);
		// Sends the http object to the IoT hub
        int httpCode = http.POST(buffer);
		// If the http object was successfully received, print out the sent message
        if (httpCode == 204) {
            Serial.println("Telemetry sent: " + String(buffer));
        }
		// Otherwise, print out the error code
        else {
            Serial.println("Failed to send telemetry. HTTP code: " + String(httpCode));
        }
        http.end();

		lastTelemetryTime = millis();       // Records the current time as the timestamp of the last telemetry transmission
	}
}