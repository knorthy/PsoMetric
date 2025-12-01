# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install

   npx expo install @react-native-picker/picker

   npm install @react-native-community/slider

   npm i @gorhom/bottom-sheet

   expo install expo-image-picker

   npx expo install @expo/vector-icons

   npm i @react-native-async-storage/async-storage

   npx expo install @react-navigation/native @react-navigation/native-stack

   npx expo install react-native-screens react-native-safe-area-context
   ```

2. Start the app

   ```bash
   npx expo start
   ```

3. If expo sdk update is needed 

   ```bash
   # 1. Force-install the exact @types versions that SDK 54 requires (change to what SDK upd is req)
   npm install --save-exact @types/react@19.2.0 @types/react-dom@19.2.0 --force
   
   # 2. Clean everything
   rm -rf node_modules package-lock.json
   
   # 3. Fresh install of all dependencies
   npm install
   
   # 4. Let Expo fix every remaining package to SDK 54 versions
   npx expo install --fix
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
