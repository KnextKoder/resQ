<p align="center">
  <img src="./assets/icon.png" width="512" height="512" alt="resQ Logo" />
</p>

# resQ

**Safety at the speed of sound.**

resQ is an open-source emergency dispatch application designed to bridge the gap between a crisis and an accurate response. When every second counts, resQ turns your voice into a lifeline, instantly providing first responders with both the context of your situation and your precise location.

---

## It Features

- **One-Tap Emergency Dispatch**: A minimal interface designed for rapid interaction in high-stress situations.
- **Voice Intelligence**: Captures high-quality audio recordings to provide crucial context to emergency services.
- **Precision GPS Tracking**: Synchronously fetches high-accuracy coordinates (`Location.Accuracy.High`) the moment recording begins.
- **Reliability First**: Integrated guards ensure coordinates are locked before dispatch, so help never flies blind.
- **Minimalist Feedback**: A professional "breathing" ring animation provides immediate confirmation that the signal is active.
- **Secure by Design**: Integrated identity management powered by Clerk.

## Build Stack

- **Mobile Framework**: React Native with Expo (SDK 54)
- **State Management**: React Hooks
- **Styling**: NativeWind (Tailwind CSS)
- **Animations**: React Native Reanimated v4
- **Authentication**: Clerk Expo
- **Backend (External)**: Elysia server (Bun runtime)
- **Infrastructure**: EAS (Expo Application Services)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Bun](https://bun.sh/) (Recommended package manager)
- [Expo Go](https://expo.dev/client) app on your device for testing

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/knextkoder/resQ.git
    cd resQ
    ```

2.  **Install dependencies**:
    ```bash
    bun install
    ```

3.  **Setup Environment Variables**:
    Create a `.env` file in the root directory and add your keys:
    ```env
    EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
    EXPO_PUBLIC_SERVER_URL=your_api_url
    EXPO_PUBLIC_VERCEL_DEPLOYMENT_BYPASS_SECRET=your_secret
    ```

4.  **Start the development server**:
    ```bash
    bun start
    ```

## Building for Production

This project is configured for EAS Build.

- **To build an installable APK (Android)**:
  ```bash
  npx eas build --platform android --profile preview
  ```
- **To build for iOS**:
  ```bash
  npx eas build --platform ios
  ```

## 📄 License

This project is open-source and available under the MIT License.

---
*Dispatched with resQ — help arrives when it counts the most.*
