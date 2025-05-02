# Digital Twin with Autodesk Tandem

This project demonstrates the integration of Autodesk Tandem for creating and managing digital twins. It includes components for viewing, authentication, and connecting to Tandem services.

## Project Structure

The project is organized into several main components:

* `TandemEmbed/` - Frontend application for viewing and interacting with digital twins
* `TandemAuth/` - Authentication service for Tandem API
* `TandemConnection/` - Service for connecting and managing data streams

## Features

* **Digital Twin Viewer**: Visualize and interact with 3D models using Autodesk Tandem
* **Facility Management**: View and manage multiple facilities
* **Real-time Data Integration**: Connect and stream data to digital twin components
* **Authentication**: Secure access to Tandem services

## Prerequisites

* Node.js
* Autodesk Tandem account and API credentials
* Environment variables configured (see Configuration section)

## Configuration

Create a `.env` file with the following variables:

```env
VITE_TANDEM_ACCESS_TOKEN=your_access_token
VITE_TANDEM_API_KEY=your_api_key
LED_B_CONNECTION=your_led_connection_string
LED_G_CONNECTION=your_led_connection_string
LED_R_CONNECTION=your_led_connection_string
LED_SW_CONNECTION=your_led_connection_string
```

## Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```
3. Configure your environment variables
4. Start the services:

   ```bash
   # Start the authentication service
   cd TandemAuth
   npm start

   # Start the connection service
   cd TandemConnection
   npm start

   # Start the frontend application
   cd TandemEmbed
   npm run dev
   ```

## Research Topics

1. **Revit Project Parameter Integration**:

   #### Connect Revit Project parameters directly with Autodesk Tandem.

   1. First, configure the Type Mark in Revit to match the name of the Classification system to be uploaded to Tandem.


   | Code           | Description        | Level |
   |----------------|--------------------|-------|
   | StepLED        | StepLED System     | 1     |
   | StepLED.L.B.1  | Led 1 Red          | 2     |
   | StepLED.L.B.2  | Led 2 Green        | 2     |
   | StepLED.L.B.3  | Led 3 Blue         | 2     |
   | StepLED.Base   | Base Board         | 1     |
   | StepLED.C      | Control Component  | 2     |
   | StepLED.C.Sw   | Switch             | 2     |
   
   ![Screenshot 2025-05-02 at 10 21 45 AM](https://github.com/user-attachments/assets/b89f6ddc-58a5-4884-b95c-21759bc9cc96)

   2. Define the parameters to use as project parameters in Revit.
   
   ![Screenshot 2025-05-02 at 10 11 39 AM](https://github.com/user-attachments/assets/86c47e96-8747-4bdb-8fd8-e3c4b11b0a88)
   
   4. Create corresponding parameters in Tandem under Manage -> Parameters, matching the Revit project parameters.
   
   ![Screenshot 2025-05-02 at 10 12 08 AM](https://github.com/user-attachments/assets/c4a5eb10-476f-4a4b-96ad-0121d9b1c3c2)

   5. Create a Facility Template in Tandem and map the parameter created in step c with the Revit Type Mark.
   
   ![Screenshot 2025-05-02 at 10 12 29 AM](https://github.com/user-attachments/assets/596de3e1-7783-44e0-a133-52d478c781fa)

   6. After uploading the RVT file to Tandem, assign each element to the asset classification defined in the classification system. The parameters mapped to the classification will then appear in the properties window.
   
   ![Screenshot 2025-05-02 at 10 35 10 AM](https://github.com/user-attachments/assets/cf6f27f6-170d-4856-be14-1800b3edd029)


   **Note**: Refer to the TandemLED.xlsx and led.rvt files for guidance.

   ![Screenshot 2025-05-02 at 10 11 54 AM](https://github.com/user-attachments/assets/543779a4-1c6e-4aaa-a35d-1d0b8b955cd9)

---
2. **Tandem Connection and Sensor Data Mocking**:

   * Create Tandem Connections.
   * Mock sensor data and stream it into Tandem.

   1. Create a new Facility using the Facility Template created in step 1.
      
   2. Click the Create button in the Connections menu.
   
   ![Screenshot 2025-05-02 at 10 38 47 AM](https://github.com/user-attachments/assets/9add0e62-408b-4a15-9c8a-b64245fcdf1b)
      
   3. Enter the connection name and map it with the classification uploaded via the xlsx file.
   
   ![image](https://github.com/user-attachments/assets/ed8413ca-35f4-4765-aa9e-97cdb2d31428)
      
   4. Use the generated URL to send POST requests and observe data transmission.
   
   According to Tandem's official documentation, if no data is sent for over 15 minutes, the connection is considered inactive. It is recommended to include timestamps with your data.

---
3. **Tandem Stream Data Visualization**:

   * Visualize real-time Connection stream data as charts within the Tandem viewer.

   1. In the Streams menu, select Charts to view the incoming data for each connection visualized as charts.
   ![Screenshot 2025-05-02 at 10 13 25 AM](https://github.com/user-attachments/assets/129d5ab0-3a55-4185-be40-1e724cb72b10)
   
Below is an attached video demonstrating sending data via POST request using the code in the TandemConnection folder and viewing the resulting charts and values in Tandem.

https://github.com/user-attachments/assets/454c43fb-7719-4806-8fc0-36f5020c5501





## Todo

* [ ] **Tandem Embed Viewer WebUI Overlay**: Implement an overlay WebUI to allow sending sensor requests directly from the viewer interface and updating Tandem accordingly.
* [ ] **Real-Time Stream Charting**: Enable stream data visualization directly within the Tandem Embed Viewer.

## Development

### Project Structure

* `TandemEmbed/src/`

  * `App.tsx` - Main application component
  * `util/`

    * `TandemViewer.ts` - Viewer initialization and management
    * `TandemClient.ts` - API client for Tandem services

* `TandemAuth/`

  * `index.js` - Authentication server
  * `token.js` - Token management

* `TandemConnection/`

  * `src/index.ts` - Data connection and streaming service

## Acknowledgments

* Autodesk Tandem API
* React
* Express.js
* TypeScript
