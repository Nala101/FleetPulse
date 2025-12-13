#ifndef _GPS_H
#define _GPS_H

// Defines the pins and baud rate used by the GPS
#define GPS_RX_PIN 32
#define GPS_TX_PIN 33
#define GPS_BAUD 9600

// Defines the default NMEA message length
#define NMEA_MSG_LEN 256

// Declares a struct used to store data from the GPS sensor
struct GPSData {
    const bool fix;
    const int satellites;
    const float latitude;
    const float longitude;
    GPSData() : fix(false), satellites(0), latitude(0.0f), longitude(0.0f) {}
    GPSData(const bool fix, const int satellites, const float latitude, const float longitude) 
            : fix(fix), satellites(satellites), latitude(latitude), longitude(longitude) {}
};

// A task that reads NMEA messages from the GPS's serial buffer into the concurrency safe queue
void nmeaMsgReaderTask(void* parameters);

// A task that parses NMEA messages from the concurrency safe queue and updates the latest GPS data snapshot values
void nmeaMsgParserTask(void* parameters);

// Setups the GPS sensor, creates the concurrency safe queue, and starts the reading and parsing tasks on core 0
void setupGPS();

// Returns the latest GPS data snapshot as a GPSData object
const GPSData requestGPSData();

#endif /* _GPS_H */