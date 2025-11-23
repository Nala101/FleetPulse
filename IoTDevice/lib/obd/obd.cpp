#include "obd.h"
#include "dht.h"
#include <Arduino.h>
#include <SoftwareSerial.h>

#define RX_PIN 26
#define TX_PIN 25

long lastMPHReadingTimestamp;
long lastGPHReadingTimestamp;

SoftwareSerial obdSerial(RX_PIN, TX_PIN);

char* trimResponse(char* buf) {
	for (int i = 0; i < 2; ++i) {
		for (; *buf != ' '; ++buf) {
			if (*buf == '\0') {
				return nullptr;
			}
		}
		++buf;
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

    while (millis() - start < 10000) {
        if (obdSerial.available()) {
            char c = obdSerial.read();

            if (c == '>') {
                buf[index] = '\0';
				// Serial.println(buf);
				char* response = trimResponse(buf);
				Serial.println(response);
                return response;
            }

            if (c != '\r' && c != '\n') {
                buf[index++] = c;
            }
        }
    }
    buf[index] = '\0';
	Serial.println(buf);
    return trimResponse(buf);
}

void setupOBD() {
	lastMPHReadingTimestamp = millis();
	lastGPHReadingTimestamp = millis();
	obdSerial.begin(OBD_BAUD);
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
	if (response == nullptr) {
		Serial.println("Error reading data");

	}
	else {
		mph = strtol(&response[0], nullptr, 16) * 0.621371;
		Serial.printf("%.2f mph\n", mph);
		milesTraveled = mph * ((millis() - lastMPHReadingTimestamp) / 3600);
		Serial.printf("%.10f mi\n", milesTraveled);
		lastMPHReadingTimestamp = millis();
	}

	response = getResponse("010C", buf);
	if (response == nullptr) {
		Serial.println("Error reading data");
	}
	else {
		rpm = ((strtol(&response[0], nullptr, 16) * 256) + strtol(&response[3], nullptr, 16)) / 4;
		Serial.printf("%.2f rpm\n", rpm);
	}

	response = getResponse("012F", buf);
	if (response == nullptr) {
		Serial.println("Error reading data");
	}
	else {
		fuelPercent = (strtol(&response[0], nullptr, 16) * 100.0f) / 255.0f;
		Serial.printf("%.2f %%\n", fuelPercent);
	}

	response = getResponse("0110", buf);
	if (response == nullptr) {
		Serial.println("Error reading data");
	}
	else {
		float mafGPS = (((strtol(&response[0], nullptr, 16) * 256) + strtol(&response[3], nullptr, 16)) / 100.0f);
		galPerHour = (mafGPS / AFR) * 3600.0f / DENSITY_G_PER_GAL;
		Serial.printf("%.2f gal/h\n", galPerHour);
		galUsed = galPerHour * ((millis() - lastGPHReadingTimestamp) / 3600000.0f);
		Serial.printf("%.10f gal\n", galUsed);
		lastGPHReadingTimestamp = millis();
	}

	response = getResponse("0105", buf);
	if (response == nullptr) {
		Serial.println("Error reading data");
	}
	else {
		engineTemp = strtol(&response[0], nullptr, 16) - 40;
		Serial.printf("%.2f F\n", celsiusToFahrenheit(engineTemp));
	}

	return OBDData(mph, milesTraveled, rpm, fuelPercent, galPerHour, galUsed, engineTemp);
}