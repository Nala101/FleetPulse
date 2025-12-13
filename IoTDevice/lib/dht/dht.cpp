#include "dht.h"                                // Includes the corresponding header file
#include <Arduino.h>                            // Includes the Arduino library for standard Arduino functions
#include "Wire.h"                               // Includes the Wire library for I2C communication
#include "DHT20.h"                              // Includes the DHT20 library for interacting with the humidity/temperature sensor

// Declares the DHT20 object used to interact with the humidity/temperature sensor
DHT20 dht;

// Converts the input in degrees celsius to degrees fahrenheit
const float celsiusToFahrenheit(const float& celsius) {
    return (celsius * 9.0 / 5.0) + 32.0;
}

// Setups the DHT20 object
void setupDHT() {
    Wire.begin();                               // Starts the wire used for the I2C communication with the humidity/temperature sensor
    dht.begin();                                // Initializes the DHT20 sensor object and prepares it for humidity/temperature readings
}

// Requests the humidity and temperature readings from the DHT20 sensor and returns the readings in a DHTData object
const DHTData requestDHTData() {
    // If it cannot get a read from the DHT20 sensor, print an error and return an empty DHTData object
    if (dht.read() != DHT20_OK) {
        Serial.println("Failed to read from DHT sensor");
        return DHTData();
    }
    // Gets the temperature and humidity readings from the DHT20 sensor
    float temperature = dht.getTemperature();
    float humidity = dht.getHumidity();
    // If either of the readings are empty, print an error and return an empty DHTData object
    if (isnan(temperature) || isnan(humidity)) {
        Serial.println("Failed to read from DHT sensor");
        return DHTData();
    }
    // Return the temperature in fahrenheit and the humidity in a DHTData object
    return DHTData(celsiusToFahrenheit(temperature), humidity);
}