#include "dht.h"                                // Includes the corresponding header file
#include "Wire.h"                               // Includes the Wire library for I2C communication

void setupDHT() {
    Wire.begin();                               // Starts the wire used for the I2C communication with the humidity/temperature sensor
    dht.begin();                                // Initializes the DHT20 sensor object and prepares it for humidity/temperature readings
}

const DHTData requestDHTData() {
    if (dht.read() != DHT20_OK) {
        Serial.println("Failed to read from DHT sensor");
        return DHTData(0, 0);
    }
    float temperature = dht.getTemperature();
    float humidity = dht.getHumidity();
    if (isnan(temperature) || isnan(humidity)) {
        Serial.println("Failed to read from DHT sensor");
        return DHTData(0, 0);
    }
    return DHTData(temperature, humidity);
}