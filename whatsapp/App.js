import 'react-native-gesture-handler';
import { LogBox, Settings, StyleSheet, Text } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useState } from "react";
import * as Font from "expo-font";
import AppNavigator from './navigation/AppNavigator';
import { Provider } from 'react-redux';
import { store } from './store/store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MenuProvider } from 'react-native-popup-menu';

LogBox.ignoreLogs(['AsyncStorage has been extracted']);
AsyncStorage.getAllKeys().then(AsyncStorage.multiRemove)

SplashScreen.preventAutoHideAsync();


export default function App() {

  const [appIsLoaded, setAppIsLoaded] = useState(false);

  useEffect(() => {
    // Load fonts
    const prepare = async() =>{
      try {
        await Font.loadAsync({
          "black": require("./assets/Fonts/JosefinSans-LightItalic.ttf"),
          "bold": require("./assets/Fonts/JosefinSans-Bold.ttf"),
          "regular": require("./assets/Fonts/JosefinSans-Regular.ttf"),
          'Italic': require("./assets/Fonts/JosefinSans-MediumItalic.ttf")
        });
      } catch (error) {
        console.log(error);
      }
      finally{
        setAppIsLoaded(true);
      }
    };
    prepare();
  },[]);

  const onLayout = useCallback(async () => {
    if (appIsLoaded) {
      await SplashScreen.hideAsync();
      console.log("yyy")
    }
  }, [appIsLoaded]);

  if (!appIsLoaded) {
    return null;
  }else{
    SplashScreen.hideAsync();
  }

  return (
    <Provider store={store}>
    <SafeAreaProvider
      style={styles.container}
      onLayout={onLayout}>
        <MenuProvider>
          <AppNavigator />
        </MenuProvider>
    </SafeAreaProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
   
  },
  label: {
    color: 'black',
    fontSize: 18,
    fontFamily: "black"
  }
});
