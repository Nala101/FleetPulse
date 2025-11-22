// #ifndef _GPS_H
// #define _GPS_H

// #include <Arduino.h>					// Includes the Arduino library for standard Arduino functions
// #include <Adafruit_GPS.h>				// Includes the Adafruit_GPS library
// #include <SoftwareSerial.h>				// Includes the SoftwareSerial library for using software UART communication

// #define GPS_TX 16
// #define GPS_RX 17
// #define GPS_BAUD_RATE 9600
// #define GPS_TIMEOUT_MS 30000

// struct GPSData {
//     const bool fix;
//     const int satellites;
//     const float latitude;
//     const float longitude;
//     GPSData(const bool fix, const int satellites, const float latitude, const float longitude) 
//             : fix(fix), satellites(satellites), latitude(latitude), longitude(longitude) {}
// };

// void clearGPSBuffer();

// void setupGPS();

// const GPSData requestGPSData();

// #endif /* _GPS_H */