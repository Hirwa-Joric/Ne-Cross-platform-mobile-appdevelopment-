# Kigali Finance - Personal Finance Tracker

A cross-platform mobile application built with React Native that allows users to track their personal expenses. This app was developed for a practical examination project.

## Features

- **User Authentication**: Register and login functionality
- **Expense Management**: Add, edit, view, and delete expenses
- **Dashboard**: View a list of all expenses with a monthly summary
- **Categorization**: Categorize expenses with visual indicators
- **Custom UI**: Includes a custom numeric keypad for amount input

## Technologies Used

- React Native (with Expo)
- React Navigation for screen navigation
- Context API for state management
- Axios for API integration
- AsyncStorage for local data persistence
- Vector Icons for UI elements
- DateTimePicker and Picker for form inputs

## Getting Started

### Prerequisites

- Node.js (v14 or newer)
- npm or yarn
- Expo CLI
- Android Studio and/or Xcode (for running on emulators/simulators)
- Physical Android/iOS device with Expo Go app (optional)

### Installation

1. Clone the repository or download the source code

2. Navigate to the project directory:
   ```
   cd KigaliFinance
   ```

3. Install the dependencies:
   ```
   npm install
   ```
   or
   ```
   yarn install
   ```

### Running the App

- **Android**:
  ```
  npm run android
  ```
  or
  ```
  yarn android
  ```

- **iOS** (macOS only):
  ```
  npm run ios
  ```
  or
  ```
  yarn ios
  ```

- **Web**:
  ```
  npm run web
  ```
  or
  ```
  yarn web
  ```

- Using **Expo**:
  ```
  npx expo start
  ```
  Then scan the QR code with the Expo Go app (Android) or Camera app (iOS)

## API Integration

The app connects to a MockAPI backend with the following endpoints:

- Users: 
  - `GET /users?username={email}`
  - `POST /users`

- Expenses: 
  - `GET /expenses`
  - `POST /expenses`
  - `GET /expenses/{expenseId}`
  - `PUT /expenses/{expenseId}`
  - `DELETE /expenses/{expenseId}`

## Project Structure

- `/src`: Source code
  - `/api`: API integration functions
  - `/components`: Reusable UI components
  - `/context`: React Context for state management
  - `/navigation`: Navigation configuration
  - `/screens`: Screen components
  - `/utils`: Utility functions for formatting and other helpers
- `/assets`: Images and static assets

## License

This project was created for educational purposes.
