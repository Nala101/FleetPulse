#ifndef _DHT_H
#define _DHT_H

struct DHTData {
    const float temperature;
    const float humidity;
    DHTData(const float& temperature, const float& humidity) : temperature(temperature), humidity(humidity) {} 
};

void setupDHT();

const DHTData requestDHTData();

#endif /* _DHT_H */