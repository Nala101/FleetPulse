#ifndef _OBD_H
#define _OBD_H

#define OBD_RX_PIN 26
#define OBD_TX_PIN 25
#define OBD_BAUD 9600
#define OBD_MSG_LEN 20
#define AFR 14.7f
#define DENSITY_G_PER_GAL 7480.0f

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

char* trimResponse(char* buf);

void clearOBDBuffer();

char* getResponse(const char* command, char* buf);

void setupOBD();

const OBDData requestOBDData();

#endif /* _GPS_H */