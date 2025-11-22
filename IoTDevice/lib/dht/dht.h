#ifndef _DHT_H
#define _DHT_H

struct DHTData {
    const float temperature;
    const float humidity;
    DHTData() : temperature(0), humidity(0) {}
    DHTData(const float& temperature, const float& humidity) : temperature(temperature), humidity(humidity) {}
};

const float celsiusToFahrenheit(const float celsius);

void setupDHT();

const DHTData requestDHTData();

#endif /* _DHT_H */