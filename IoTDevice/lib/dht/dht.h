#ifndef _DHT_H
#define _DHT_H

#include <Arduino.h>                            // Includes the Arduino library for standard Arduino functions
#include "DHT20.h"                              // Includes the DHT20 library for interacting with the humidity/temperature sensor

DHT20 dht;

struct DHTData {
    const float temperature;
    const float humidity;
    DHTData(const float& temperature, const float& humidity) : temperature(temperature), humidity(humidity) {} 
};

void setupDHT();

const DHTData requestDHTData();

#endif /* _DHT_H */