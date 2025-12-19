# FleetPulse: Tackling Vehicle Tracking Head On

CS 147 Final Project

## System Architecture

Our final architecture is sensor-to-cloud. The architecture consists of three parts: the vehicle’s IoT device, cloud services, and web client.

The IoT device consists of an ESP32 wired to three sensors: a humidity/temperature sensor, a GPS breakout board, and an OBD-II UART interface board via a level shifter. A laptop powers the ESP32. The ESP32 communicates with the humidity/temperature sensor via hardware I2C communication and communicates with the GPS breakout board and OBD-II interface board via hardware UART communication. Using its on-board Wi-Fi module, the ESP32 uses the Wi-Fi wireless communication protocol to connect to a mobile Wi-Fi hotspot. This connection transmits sensor readings to the cloud services.

The cloud services part consists of an Azure IoT Hub instance, an Azure Stream Analytics job, and an Azure SQL database instance. The ESP32 transmits readings to the Azure IoT Hub through the Wi-Fi 5G mobile hotspot using HTTPS. For the stream analytics job, the Azure IoT Hub is the input, and the Azure SQL database is the output. The stream analytics job pulls the event messages from the Azure IoT Hub and inserts them as entries into the Azure SQL database.

The web client implements the user interfaces/visualizations via a locally-hosted website. The website has a backend server written in Express and Node.js that queries the Azure SQL database and implements a RESTful API. Written in React and Tailwind CSS, the frontend requests data from the backend server and receives it in JSON via HTTP. It displays the metrics via three separate user interfaces: a live dashboard, a 24-hour history, and a routes history. It also uses the Google Maps API to create maps and markers to visualize the vehicle’s locational data. This system acts as an integrated remote access point for a fleet manager.

![alt text](https://github.com/Nala101/FleetPulse/blob/main/BlockDiagram.png "Block Diagram")
