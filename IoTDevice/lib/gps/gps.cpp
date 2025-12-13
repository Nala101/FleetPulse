#include "gps.h"                        // Includes the corresponding header file
#include <Arduino.h>					// Includes the Arduino library for standard Arduino functions
#include <Adafruit_GPS.h>				// Includes the Adafruit_GPS library

// Setups the GPS serial on UART2
HardwareSerial gpsSerial(2);
// Setups the GPS object using the GPS serial
Adafruit_GPS GPS(&gpsSerial);

// Defines a concurrency safe queue between tasks
static QueueHandle_t nmeaMsgQueue = NULL;
// Defines a reading task handler
TaskHandle_t nmeaMsgReaderTaskHandle = NULL;
// Defines a parsing task handler
TaskHandle_t nmeaMsgParserTaskHandle = NULL;

// Defines the global variables that make up the latest GPS data snapshot
volatile bool fix = false;
volatile int satellites = 0;
volatile float latitude = 0.0f;
volatile float longitude = 0.0f;

// A task that reads NMEA messages from the GPS's serial buffer into the concurrency safe queue
void nmeaMsgReaderTask(void* parameters) {
    static char buf[NMEA_MSG_LEN];
    int bufIndex = 0;

    // Constantly reads data from the GPS serial buffer, delaying for a bit until more data arrives
    while (true) {
        while (gpsSerial.available()) {
            // Reads the character from the GPS serial buffer
            char nmeaMsgChar = gpsSerial.read();
            // If there is no character, breaks to wait a bit before trying again 
            if (nmeaMsgChar < 0) {
                break;
            }
            // Adds the read character to buf
            buf[bufIndex] = nmeaMsgChar;
            ++bufIndex;

            // If it is the end of the NMEA message, add it to the shared queue
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

// A task that parses NMEA messages from the concurrency safe queue and updates the latest GPS data snapshot values
void nmeaMsgParserTask(void* parameters) {
    char buf[NMEA_MSG_LEN];
    // Contantly reads NMEA messages from the shared queue, updating the GPS data snapshot values using the latest queue pop
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

// Setups the GPS sensor, creates the concurrency safe queue, and starts the reading and parsing tasks on core 0
void setupGPS() {
    // Starts the GPS serial and GPS object
    gpsSerial.begin(GPS_BAUD, SERIAL_8N1, GPS_RX_PIN, GPS_TX_PIN);
    GPS.begin(GPS_BAUD);

    // Setups the NMEA message output type and time
    GPS.sendCommand(PMTK_SET_NMEA_OUTPUT_RMCGGA);
    GPS.sendCommand(PMTK_SET_NMEA_UPDATE_1HZ);

    // Creates the concurrency safe shared queue 
    nmeaMsgQueue = xQueueCreate(8, NMEA_MSG_LEN);
    // Prints an error if the queue failed to create
    if (nmeaMsgQueue == nullptr) {
        Serial.println("Failed to create NMEA queue");
        return;
    }

    // Starts the reader and parser tasks on core 0
    xTaskCreatePinnedToCore(nmeaMsgReaderTask, "nmeaMsgReader", 1536, NULL, 2, &nmeaMsgReaderTaskHandle, 0);
    xTaskCreatePinnedToCore(nmeaMsgParserTask, "nmeaMsgParser", 2048, NULL, 2, &nmeaMsgParserTaskHandle, 0);
}

// Returns the latest GPS data snapshot as a GPSData object
const GPSData requestGPSData() {
    return GPSData(fix, satellites, latitude, longitude);
}