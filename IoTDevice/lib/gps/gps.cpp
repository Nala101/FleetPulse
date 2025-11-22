// #include "gps.h"

// HardwareSerial gpsSerial(2);
// // The Adafruit_GPS object created using the software serial object
// Adafruit_GPS GPS(&gpsSerial);

// // Setups the Adafruit Ultimate GPS board
// void setupGPS() {
// 	gpsSerial.begin(GPS_BAUD_RATE, SERIAL_8N1, GPS_RX, GPS_TX);
// 	GPS.begin(GPS_BAUD_RATE);
// 	GPS.sendCommand(PMTK_SET_NMEA_OUTPUT_RMCONLY);
// 	GPS.sendCommand(PMTK_SET_NMEA_UPDATE_1HZ);
// }

// void clearGPSBuffer() {
// 	while (gpsSerial.available()) {
//         GPS.read();
//     }
// }

// const GPSData requestGPSData() {
// 	unsigned long start = millis();
// 	while (millis() - start < GPS_TIMEOUT_MS) {
// 		GPS.read();

// 		if (GPS.newNMEAreceived()) {
// 			if (GPS.parse(GPS.lastNMEA()) && GPS.fix) {
// 				return GPSData(GPS.fix, GPS.satellites, GPS.latitudeDegrees, GPS.longitudeDegrees);
// 			}
// 		}
// 	}

// 	return GPSData(GPS.fix, GPS.satellites, GPS.latitudeDegrees, GPS.longitudeDegrees);
// }
