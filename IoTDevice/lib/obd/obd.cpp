#include "obd.h"										// Includes the corresponding header file
#include "dht.h"										// Includes the DHT header file for the function celsiusToFahrenheit
#include <Arduino.h>									// Includes the Arduino library for standard Arduino functions

// Declares the timestamp of the last MPH and GPH readings
long lastMPHReadingTimestamp;
long lastGPHReadingTimestamp;

// Setups the OBD serial on UART1
HardwareSerial obdSerial(1);

// Trims the beginning of the OBD response message stored in buf as to remove unnecessary characters and confirmation messages
char* trimResponse(char* buf) {
	// Loops through the messages that contain the confirmation and the actual data message
	for (int i = 0; i < 2; ++i) {
		for (; *buf != ' '; ++buf) {
			if (*buf == '\0') {
				return nullptr;
			}
		}
		++buf;
		if (*buf == '\0') {
			return nullptr;
		}
	}
	return buf;
}

// Clears the OBD buffer
void clearOBDBuffer() {
	while (obdSerial.available() > 0) {
		obdSerial.read();
		delay(250);
	}
}

// Sends the command to the OBD sensor, receives the reply from the sensor, formats the response, and returns it
char* getResponse(const char* command, char* buf) {
    clearOBDBuffer();
    obdSerial.println(command);

    int index = 0;
    long start = millis();

	// Repeats while the communication has not timed out
    while (millis() - start < 1000) {
		// Reads data from the serial buffer
        if (obdSerial.available()) {
            char c = obdSerial.read();

			// If the message starts with a '>', it contains the actual data
            if (c == '>') {
                buf[index] = '\0';
				char* response = trimResponse(buf);
				if (!response)
					Serial.printf("Response: %s\n", response);
                return response;
            }

            if (c != '\r' && c != '\n') {
                buf[index++] = c;
            }
        }
    }
    buf[index] = '\0';
	char* response = trimResponse(buf);
	if (response)
		Serial.printf("Response: %s\n", response);
    return response;
}

// Setups the MPH and GPH timestamps, the OBD serial, and sends the starting commands to the OBD sensor
void setupOBD() {
	lastMPHReadingTimestamp = millis();
	lastGPHReadingTimestamp = millis();
	obdSerial.begin(OBD_BAUD, SERIAL_8N1, OBD_RX_PIN, OBD_TX_PIN);
	static const char* commands[] = {"ATZ", "ATE0", "ATL0", "ATH0"};
	for (char i = 0; i < 4; ++i) {
		const char* command = commands[i];
		obdSerial.println(command);
		delay(1000);
	}
}

// Requests data from the OBD sensor and returns it as a OBDData object
const OBDData requestOBDData() {
	char buf[OBD_MSG_LEN];
	char* response;
	float mph = 0;
	float milesTraveled = 0;
	float rpm = 0;
	float fuelPercent = 0;
	float galPerHour = 0;
	float galUsed = 0;
	float engineTemp = 0;

	// Asks for the current mph from the OBD sensor
	response = getResponse("010D", buf);
	if (!response) {
		Serial.println("Error reading data");
	}
	else {
		// Converts the response into mph
		mph = strtol(&response[0], nullptr, 16) * 0.621371;
		// Calculates the miles traveled using the mph and the time since the last reading for mph
		milesTraveled = mph * ((millis() - lastMPHReadingTimestamp) / 3600000.0f);
		lastMPHReadingTimestamp = millis();
	}

	// Asks for the current rpm from the OBD sensor
	response = getResponse("010C", buf);
	if (!response) {
		Serial.println("Error reading data");
	}
	else {
		// Converts the response into rpm
		rpm = ((strtol(&response[0], nullptr, 16) * 256) + strtol(&response[3], nullptr, 16)) / 4;
	}

	// Asks for the current fuel percentage from the OBD sensor
	response = getResponse("012F", buf);
	if (!response) {
		Serial.println("Error reading data");
	}
	else {
		// Converts the response into fuel percentage
		fuelPercent = (strtol(&response[0], nullptr, 16) * 100.0f) / 255.0f;
	}

	// Asks for the current maf from the OBD sensor
	response = getResponse("0110", buf);
	if (!response) {
		Serial.println("Error reading data");
	}
	else {
		// Converts the response into gallons per hour and gallons used since the last reading for gallons used
		float mafGPS = (((strtol(&response[0], nullptr, 16) * 256) + strtol(&response[3], nullptr, 16)) / 100.0f);
		galPerHour = (mafGPS / AFR) * 3600.0f / DENSITY_G_PER_GAL;
		galUsed = galPerHour * ((millis() - lastGPHReadingTimestamp) / 3600000.0f);
		lastGPHReadingTimestamp = millis();
	}

	// Asks for the current engine temperature from the OBD sensor
	response = getResponse("0105", buf);
	if (!response) {
		Serial.println("Error reading data");
	}
	else {
		// Converts the response into engine temperature in fahrenheit
		engineTemp = celsiusToFahrenheit(strtol(&response[0], nullptr, 16) - 40);
	}

	// Returns the collected data as an OBDData object
	return OBDData(mph, milesTraveled, rpm, fuelPercent, galPerHour, galUsed, engineTemp);
}