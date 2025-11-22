#include <Arduino.h>
#include "gps.h"

// void setup() {
//     Serial.begin(9600);
//     setupGPS();
// }

// void loop() {
//     const GPSData& data = requestGPSData();
//     Serial.println(data.fix);
//     Serial.println(data.satellites);
//     Serial.println(data.latitude, 14);
//     Serial.println(data.longitude, 14);
// }

#include <Adafruit_GPS.h>
#include <SoftwareSerial.h>

#define RX_PIN 32   // connect to GPS TX
#define TX_PIN 33   // connect to GPS RX
#define GPS_BAUD 9600

// HardwareSerial gpsSerial(2);
SoftwareSerial gpsSerial(RX_PIN, TX_PIN);
Adafruit_GPS GPS(&gpsSerial);

unsigned long lastPrint = 0;

void setup() {
  Serial.begin(9600);
  delay(200);
  Serial.println();
  Serial.println("GPS Outdoor Diagnostic starting...");

    pinMode(27, OUTPUT);
  digitalWrite(27, LOW);   // turn OFF
  delay(500);
  digitalWrite(27, HIGH);  // turn ON
  delay(1000);
  Serial.println("GPS power-cycled via EN pin");

  // Start hardware UART2, pins explicit
//   gpsSerial.begin(GPS_BAUD, SERIAL_8N1, RX_PIN, TX_PIN);
  gpsSerial.begin(GPS_BAUD);
  GPS.begin(GPS_BAUD);

  // Enable GGA + RMC (position + fix status)
  GPS.sendCommand(PMTK_SET_NMEA_OUTPUT_RMCGGA);
  GPS.sendCommand(PMTK_SET_NMEA_UPDATE_1HZ);

  Serial.println("[CONFIG] UART2 started on RX=" + String(RX_PIN) + " TX=" + String(TX_PIN));
  Serial.println("[CONFIG] Waiting for NMEA sentences...");
}

void loop() {
  // 1) Feed parser as bytes arrive and echo raw chars to serial
  while (gpsSerial.available()) {
    char c = GPS.read();
    // echo raw bytes so you can visually inspect NMEA flow
    Serial.write(c);
  }

  // 2) When Adafruit parser has a full sentence, parse & print status
  if (GPS.newNMEAreceived()) {
    if (GPS.parse(GPS.lastNMEA())) {
      // don't spam — print once per second
      if (millis() - lastPrint >= 1000) {
        lastPrint = millis();
        Serial.println();
        Serial.print("Fix: "); Serial.println(GPS.fix ? "YES" : "NO");
        Serial.print("Satellites: "); Serial.println((int)GPS.satellites);
        Serial.print("Lat: "); Serial.println(GPS.latitudeDegrees, 6);
        Serial.print("Lon: "); Serial.println(GPS.longitudeDegrees, 6);
        Serial.println("------------------------");
      }
    }
  }
}
