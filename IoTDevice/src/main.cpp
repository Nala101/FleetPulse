#include <Arduino.h>
#include <HTTPClient.h>                         // Includes the HTTP client library for functions used to send HTTP requests
#include <WiFi.h>                               // Includes the WiFi library used to handle WiFi connections for the ESP32
#include <WiFiClient.h>                         // Includes the WiFi client library used to provide a TCP connection client over WiFi
#include "Wire.h"                               // Includes the Wire library for I2C communication
#include "DHT20.h"                              // Includes the DHT20 library for interacting with the humidity/temperature sensor
#include <ArduinoJson.h>                        // Incudess the Arduino JSON library for creating JSON payloads
#include <constants.h>
#include "gps.h"
#include "dht.h"
#include "obd.h"

#define TELEMETRY_INTERVAL 3000
unsigned long lastTelemetryTime = 0;            // Used to track the timestamp of the last time telemetry data was sent to the Azure IoT Hub

void setup() {
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

	Serial.println("Waiting for NTP time sync...");
	time_t now = time(nullptr);
	while (now < 1700000000) {   // ~2023 in Unix time
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

void loop() {
	if (millis() - lastTelemetryTime >= TELEMETRY_INTERVAL) {
		ArduinoJson::JsonDocument doc;      // Creates a JSON payload
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

		Serial.println("------DHT------");
		const DHTData dhtData = requestDHTData();
		Serial.println(dhtData.temperature);
		doc["cabinTemperature"] = dhtData.temperature;
		Serial.println(dhtData.humidity);
		doc["cabinHumidity"] = dhtData.humidity;

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

		char buffer[512];
        serializeJson(doc, buffer, sizeof(buffer));

		Serial.println(buffer);

        WiFiClientSecure client;
        client.setCACert(ROOT_CA);

		HTTPClient http;
        http.begin(client, url);
        http.addHeader("Content-Type", "application/json");
        http.addHeader("Authorization", SAS_TOKEN);
        int httpCode = http.POST(buffer);
        if (httpCode == 204) {
            Serial.println("Telemetry sent: " + String(buffer));
        }
        else {
            Serial.println("Failed to send telemetry. HTTP code: " + String(httpCode));
        }
        http.end();

		lastTelemetryTime = millis();       // Records the current time as the timestamp of the last telemetry transmission
	}
}