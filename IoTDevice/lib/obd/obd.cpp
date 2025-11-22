#include <Arduino.h>
#include <SoftwareSerial.h>

#define TX 26
#define RX 25

SoftwareSerial obdSerial(TX, RX);

char rxData[32];
byte rxIndex = 0;

int vehicleSpeed = 0;
int vehicleRPM = 0;

void getResponse();

void setupOBD() {
	obdSerial.begin(9600);
	// Reset the OBD-II UART
	obdSerial.println("ATZ");
	delay(2000);
	// Turn off command echo
	obdSerial.println("ATE0");
	delay(100);
	// Turn off linefeeds (we only want CR)
	obdSerial.println("ATL0");
	delay(100);
	// Use automatic protocol detection
	obdSerial.println("ATSP0");
	delay(100);
	// Clear out any extra data
	while (obdSerial.available()) obdSerial.read();
}

void testloop() {
  // === VEHICLE SPEED (PID 010D) ===
  while (obdSerial.available()) obdSerial.read();
  obdSerial.println("010D");

  getResponse();

  // Expected response: "41 0D XX"
  int A = 0;
  if (strlen(rxData) >= 6)
    A = strtol(&rxData[4], nullptr, 16); // skip "410D"
  vehicleSpeed = A;

  Serial.print("Speed: ");
  Serial.print(vehicleSpeed);
  Serial.println(" km/h");

  delay(200);

  // === ENGINE RPM (PID 010C) ===
  while (obdSerial.available()) obdSerial.read();
  obdSerial.println("010C");

  getResponse();  // discard echo

  // Expected response: "41 0C AA BB"
  int high = 0, low = 0;
  if (strlen(rxData) >= 8) {
    high = strtol(&rxData[4], nullptr, 16);
    low  = strtol(&rxData[6], nullptr, 16);
  }
  vehicleRPM = ((high * 256) + low) / 4;

  Serial.print("RPM: ");
  Serial.println(vehicleRPM);

  delay(500);

    // === ENGINE RPM (PID 010C) ===
  while (obdSerial.available()) obdSerial.read();
  obdSerial.println("012F");

  getResponse();  // discard echo

  // Expected response: "41 0C AA BB"

  delay(500);
}

// === FUNCTION: getResponse ===
// Reads a full OBD-II UART line until a carriage return ('\r')
// Strips spaces and null-terminates the result.
void getResponse() {
	char inChar = 0;
	rxIndex = 0;

	while (true) {
		if (obdSerial.available()) {
			inChar = obdSerial.read();

			// End of message
			if (inChar == '\r') {
				rxData[rxIndex] = '\0';
				Serial.print("OBD Response: [");
				Serial.print(rxData);
				Serial.println("]");
				if (rxData[0] != '4') {
					getResponse();
				}
				else {
					return;
				}
			}

			if (inChar != ' ' && rxIndex < sizeof(rxData) - 1) {
				rxData[rxIndex++] = inChar;
			}
		}
	}
}