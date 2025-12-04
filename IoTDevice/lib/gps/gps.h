#ifndef _GPS_H
#define _GPS_H

#define GPS_RX_PIN 32                       // connect to GPS TX
#define GPS_TX_PIN 33                       // connect to GPS RX
#define GPS_BAUD 9600
#define NMEA_MSG_LEN 256

struct GPSData {
    const bool fix;
    const int satellites;
    const float latitude;
    const float longitude;
    GPSData() : fix(false), satellites(0), latitude(0.0f), longitude(0.0f) {}
    GPSData(const bool fix, const int satellites, const float latitude, const float longitude) 
            : fix(fix), satellites(satellites), latitude(latitude), longitude(longitude) {}
};

void nmeaMsgReaderTask(void* parameters);

void nmeaMsgParserTask(void* parameters);

void setupGPS();

const GPSData requestGPSData();

#endif /* _GPS_H */