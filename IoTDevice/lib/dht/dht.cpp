#include "dht.h"                                // Includes the corresponding header file
#include <Arduino.h>                            // Includes the Arduino library for standard Arduino functions
#include "Wire.h"                               // Includes the Wire library for I2C communication
#include "DHT20.h"                              // Includes the DHT20 library for interacting with the humidity/temperature sensor

DHT20 dht;

const float celsiusToFahrenheit(const float celsius) {
    return (celsius * 9.0 / 5.0) + 32.0;
}

void setupDHT() {
    Wire.begin();                               // Starts the wire used for the I2C communication with the humidity/temperature sensor
    dht.begin();                                // Initializes the DHT20 sensor object and prepares it for humidity/temperature readings
}

const DHTData requestDHTData() {
    if (dht.read() != DHT20_OK) {
        Serial.println("Failed to read from DHT sensor");
        return DHTData();
    }
    float temperature = dht.getTemperature();
    float humidity = dht.getHumidity();
    if (isnan(temperature) || isnan(humidity)) {
        Serial.println("Failed to read from DHT sensor");
        return DHTData();
    }
    return DHTData(celsiusToFahrenheit(temperature), humidity);
}