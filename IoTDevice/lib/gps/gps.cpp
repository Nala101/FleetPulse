#include "gps.h"                        // Includes the corresponding header file
#include <Arduino.h>					// Includes the Arduino library for standard Arduino functions
#include <Adafruit_GPS.h>				// Includes the Adafruit_GPS library

HardwareSerial gpsSerial(2);
Adafruit_GPS GPS(&gpsSerial);

static QueueHandle_t nmeaMsgQueue = NULL;
TaskHandle_t nmeaMsgReaderTaskHandle = NULL;
TaskHandle_t nmeaMsgParserTaskHandle = NULL;


volatile bool fix = false;
volatile int satellites = 0;
volatile float latitude = 0.0f;
volatile float longitude = 0.0f;

void nmeaMsgReaderTask(void* parameters) {
    static char buf[NMEA_MSG_LEN];
    int bufIndex = 0;

    while (true) {
        while (gpsSerial.available()) {
            char nmeaMsgChar = gpsSerial.read();
            if (nmeaMsgChar < 0) {
                break;
            }
            buf[bufIndex] = nmeaMsgChar;
            ++bufIndex;

            if (nmeaMsgChar == '\n' || bufIndex >= (NMEA_MSG_LEN - 1)) {
                buf[bufIndex] = '\0';
                if (nmeaMsgQueue) {
                    xQueueSend(nmeaMsgQueue, buf, pdMS_TO_TICKS(50));
                }
                bufIndex = 0;
            }
        }
        vTaskDelay(pdMS_TO_TICKS(5));
    }
}

void nmeaMsgParserTask(void* parameters) {
    char buf[NMEA_MSG_LEN];
    while (true) {
        if (xQueueReceive(nmeaMsgQueue, buf, portMAX_DELAY) == pdTRUE) {
            if (GPS.parse(buf)) {
                fix = GPS.fix;
                satellites = GPS.satellites;
                latitude = GPS.latitudeDegrees;
                longitude = GPS.longitudeDegrees;
            }
        }
    }
}

void setupGPS() {
    gpsSerial.begin(GPS_BAUD, SERIAL_8N1, RX_PIN, TX_PIN);
    GPS.begin(GPS_BAUD);

    GPS.sendCommand(PMTK_SET_NMEA_OUTPUT_RMCGGA);
    GPS.sendCommand(PMTK_SET_NMEA_UPDATE_1HZ);

    nmeaMsgQueue = xQueueCreate(8, NMEA_MSG_LEN);
    if (!nmeaMsgReaderTask) {
        Serial.println("Failed to create NMEA queue");
        return;
    }

    xTaskCreatePinnedToCore(nmeaMsgReaderTask, "nmeaMsgReader", 1536, NULL, 2, &nmeaMsgReaderTaskHandle, 1);
    xTaskCreatePinnedToCore(nmeaMsgParserTask, "nmeaMsgParser", 2048, NULL, 2, &nmeaMsgParserTaskHandle, 1);
}

// Returns latest GPS data snapshot
const GPSData requestGPSData() {
    return GPSData(fix, satellites, latitude, longitude);
}
