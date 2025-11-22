#include <Arduino.h>
#include "gps.h"
#include "dht.h"

#define TELEMETRY_INTERVAL 3000
unsigned long lastTelemetryTime = 0;            // Used to track the timestamp of the last time telemetry data was sent to the Azure IoT Hub

void setup() {
    Serial.begin(9600);
    setupGPS();
	setupDHT();
}

void loop() {
	if (millis() - lastTelemetryTime >= TELEMETRY_INTERVAL) {
		const GPSData gpsData = requestGPSData();
		Serial.println("------GPS------");
		Serial.println(gpsData.fix);
		Serial.println(gpsData.satellites);
		Serial.println(gpsData.latitude, 14);
		Serial.println(gpsData.longitude, 14);
		const DHTData dhtData = requestDHTData();
		Serial.println("------DHT------");
		Serial.println(dhtData.temperature);
		Serial.println(dhtData.humidity);
		lastTelemetryTime = millis();       // Records the current time as the timestamp of the last telemetry transmission
	}
}