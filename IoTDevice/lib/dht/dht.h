#ifndef _DHT_H
#define _DHT_H

// Declares a struct used to store data from the DHT20 sensor
struct DHTData {
    const float temperature;
    const float humidity;
    DHTData() : temperature(0), humidity(0) {}
    DHTData(const float& temperature, const float& humidity) : temperature(temperature), humidity(humidity) {}
};

// Converts the input in degrees celsius to degrees fahrenheit
const float celsiusToFahrenheit(const float& celsius);

// Setups the DHT20 object
void setupDHT();

// Requests the humidity and temperature readings from the DHT20 sensor and returns the readings in a DHTData object
const DHTData requestDHTData();

#endif /* _DHT_H */