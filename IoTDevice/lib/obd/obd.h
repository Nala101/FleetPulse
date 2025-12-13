#ifndef _OBD_H
#define _OBD_H

// Defines the pins and baud rate used by the OBD
#define OBD_RX_PIN 26
#define OBD_TX_PIN 25
#define OBD_BAUD 9600

// Defines the OBD message length and constants used in data calculations
#define OBD_MSG_LEN 20
#define AFR 14.7f
#define DENSITY_G_PER_GAL 2820.0f

// Declares a struct used to store data from the OBD sensor
struct OBDData {
    const float mph;
    const float milesTraveled;
    const float rpm;
    const float fuelPercent;
    const float galPerHour;
    const float galUsed;
    const float engineTemp;
    OBDData(const float& mph, const float& milesTraveled, const float& rpm, const float& fuelPercent, const float& galPerHour,
            const float& galUsed, const float& engineTemp) : mph(mph), milesTraveled(milesTraveled), rpm(rpm), fuelPercent(fuelPercent),
            galPerHour(galPerHour), galUsed(galUsed), engineTemp(engineTemp) {}
};

// Trims the beginning of the OBD response message stored in buf as to remove unnecessary characters and confirmation messages
char* trimResponse(char* buf);

// Clears the OBD buffer
void clearOBDBuffer();

// Sends the command to the OBD sensor, receives the reply from the sensor, formats the response, and returns it
char* getResponse(const char* command, char* buf);

// Setups the MPH and GPH timestamps, the OBD serial, and sends the starting commands to the OBD sensor
void setupOBD();

// Requests data from the OBD sensor and returns it as a OBDData object
const OBDData requestOBDData();

#endif /* _GPS_H */