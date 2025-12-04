#include "obd.h"
#include "dht.h"
#include <Arduino.h>

long lastMPHReadingTimestamp;
long lastGPHReadingTimestamp;

HardwareSerial obdSerial(1);

char* trimResponse(char* buf) {
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

void clearOBDBuffer() {
	while (obdSerial.available() > 0) {
		obdSerial.read();
		delay(250);
	}
}

char* getResponse(const char* command, char* buf) {
    clearOBDBuffer();
    obdSerial.println(command);

    int index = 0;
    long start = millis();

    while (millis() - start < 1000) {
        if (obdSerial.available()) {
            char c = obdSerial.read();

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

	response = getResponse("010D", buf);
	if (!response) {
		Serial.println("Error reading data");

	}
	else {
		mph = strtol(&response[0], nullptr, 16) * 0.621371;
		milesTraveled = mph * ((millis() - lastMPHReadingTimestamp) / 3600000.0f);
		lastMPHReadingTimestamp = millis();
	}

	response = getResponse("010C", buf);
	if (!response) {
		Serial.println("Error reading data");
	}
	else {
		rpm = ((strtol(&response[0], nullptr, 16) * 256) + strtol(&response[3], nullptr, 16)) / 4;
	}

	response = getResponse("012F", buf);
	if (!response) {
		Serial.println("Error reading data");
	}
	else {
		fuelPercent = (strtol(&response[0], nullptr, 16) * 100.0f) / 255.0f;
	}

	response = getResponse("0110", buf);
	if (!response) {
		Serial.println("Error reading data");
	}
	else {
		float mafGPS = (((strtol(&response[0], nullptr, 16) * 256) + strtol(&response[3], nullptr, 16)) / 100.0f);
		galPerHour = (mafGPS / AFR) * 3600.0f / DENSITY_G_PER_GAL;
		galUsed = galPerHour * ((millis() - lastGPHReadingTimestamp) / 3600000.0f);
		lastGPHReadingTimestamp = millis();
	}

	response = getResponse("0105", buf);
	if (!response) {
		Serial.println("Error reading data");
	}
	else {
		engineTemp = celsiusToFahrenheit(strtol(&response[0], nullptr, 16) - 40);
	}

	return OBDData(mph, milesTraveled, rpm, fuelPercent, galPerHour, galUsed, engineTemp);
}