# Digital Twin with Autodesk Tandem

This project demonstrates the integration of Autodesk Tandem for creating and managing digital twins. It includes components for viewing, authentication, and connecting to Tandem services.

## Project Structure

The project is organized into several main components:

- `TandemEmbed/` - Frontend application for viewing and interacting with digital twins
- `TandemAuth/` - Authentication service for Tandem API
- `TandemConnection/` - Service for connecting and managing data streams

## Features

- **Digital Twin Viewer**: Visualize and interact with 3D models using Autodesk Tandem
- **Facility Management**: View and manage multiple facilities
- **Real-time Data Integration**: Connect and stream data to digital twin components
- **Authentication**: Secure access to Tandem services

## Prerequisites

- Node.js
- Autodesk Tandem account and API credentials
- Environment variables configured (see Configuration section)

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
   yarn start

   # Start the connection service
   cd TandemConnection
   yarn start

   # Start the frontend application
   cd TandemEmbed
   yarn dev
   ```

## Usage

### Viewing Digital Twins

The main application (`TandemEmbed`) provides a 3D viewer for digital twins. It supports:
- Loading and viewing facilities
- Selection and interaction with 3D models
- Real-time data visualization

### Authentication

The authentication service (`TandemAuth`) handles:
- OAuth flow for Tandem API
- Token management
- Secure access to Tandem services

### Data Connection

The connection service (`TandemConnection`) manages:
- Real-time data streaming
- Device integration
- Data synchronization with digital twin components

## Development

### Project Structure

- `TandemEmbed/src/`
  - `App.tsx` - Main application component
  - `util/`
    - `TandemViewer.ts` - Viewer initialization and management
    - `TandemClient.ts` - API client for Tandem services

- `TandemAuth/`
  - `index.js` - Authentication server
  - `token.js` - Token management

- `TandemConnection/`
  - `src/index.ts` - Data connection and streaming service


## Acknowledgments

- Autodesk Tandem API
- React
- Express.js
- TypeScript
