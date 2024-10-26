import React, { useState, useEffect } from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { View, StyleSheet, TouchableOpacity, Image, StatusBar } from 'react-native';
import HomeScreen1 from './TaskScreen';
import HomeScreen2 from './TaskScreen2';
import MoodScreen1 from './MoodScreen';
import MoodScreen2 from './MoodScreen2';
import CalendarScreen from './CalendarScreen';
import LocationScreen from './LocationScreen';
import SettingsScreen from './SettingsScreen';
import { UserDataProvider } from '../GlobalContext';
import { useGlobalContext } from './../GlobalContext';
import colors from '../../constants/colors';
import { useRouter } from 'expo-router';
import { auth } from '../../../Firebase.config';

const Tab = createMaterialTopTabNavigator();

const SideThemeCheck = () => {
const { globalState, updateGlobalState } = useGlobalContext();
return globalState.sideTheme
}

const colorsCheck = () => {
  switch (SideThemeCheck()) {
    case 'blue':
      return colors.blue.normal;
    case 'red':
      return colors.red.normal;
    case 'green':
      return colors.green.normal;
    case 'yellow':
      return colors.yellow.normal;
    default:
      return '#FFFFFF'; 
  }
};

const icons = [
  require('../../../assets/icon1.png'),
  require('../../../assets/icon2.png'),
  require('../../../assets/icon3.png'),
  require('../../../assets/icon4.png'),
  require('../../../assets/icon5.png'),
];

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) {
        router.replace('./../(auth)/SignIn');
      } else {
        setUser(currentUser);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const getIconSource = (label) => {
    switch (label) {
      case 'TaskScreen':
      case 'TaskScreen2':
        return icons[0];
      case 'MoodScreen':
      case 'MoodScreen2':
        return icons[1];
      case 'CalendarScreen':
        return icons[2];
      case 'LocationScreen':
        return icons[3];
      case 'SettingsScreen':
        return icons[4];
      default:
        return icons[4];
    }
  };

  const shouldDisplayIcon = (label, index) => {
    if ((label === 'TaskScreen' || label === 'TaskScreen2') && state.index < 2) {
      return state.index === index;
    }
    if ((label === 'MoodScreen' || label === 'MoodScreen2') && state.index >= 2 && state.index < 4) {
      return state.index === index;
    }
    return !['TaskScreen2', 'MoodScreen2'].includes(label);
  };

  const getDotStyles = (label, isFocused) => {
    if ((label === 'TaskScreen' || label === 'TaskScreen2') && state.index < 2) {
      return [
        { backgroundColor: state.index === 0 ? (isFocused ? colorsCheck() : '#FFFFFF') : (isFocused ? '#FFFFFF' : colorsCheck()) },
        { backgroundColor: state.index === 1 ? (isFocused ? colorsCheck() : '#FFFFFF') : (isFocused ? '#FFFFFF' : colorsCheck()) }
      ];
    }
    if ((label === 'MoodScreen' || label === 'MoodScreen2') && state.index >= 2 && state.index < 4) {
      return [
        { backgroundColor: state.index === 2 ? (isFocused ? colorsCheck() : '#FFFFFF') : (isFocused ? '#FFFFFF' : colorsCheck()) },
        { backgroundColor: state.index === 3 ? (isFocused ? colorsCheck() : '#FFFFFF') : (isFocused ? '#FFFFFF' : colorsCheck()) }
      ];
    }
    return [{ backgroundColor: isFocused ? colorsCheck() : '#404040' }];
  };

  return (
    <View style={styles.tabBar}>
      <StatusBar barStyle="light-content" backgroundColor="#404040" />

      
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel || options.title || route.name;
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        if (!shouldDisplayIcon(label, index)) {
          return null;
        }

        const dotStyles = getDotStyles(label, isFocused);

        return (
          <TouchableOpacity
            key={index}
            style={styles.tabItem}
            onPress={onPress}
          >
            <Image
              source={getIconSource(label)}
              style={[
                styles.icon,
                { tintColor: isFocused ? colorsCheck() : 'white' },
              ]}
            />
            <View style={styles.dotsContainer}>
              {dotStyles.map((style, idx) => (
                <View key={idx} style={[styles.dot, style]} />
              ))}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>

  );
};


export default function Layout() {
  return (
    <UserDataProvider>
    <Tab.Navigator tabBar={(props) => <CustomTabBar {...props} />}>
      <Tab.Screen name="TaskScreen" component={HomeScreen1} />
      <Tab.Screen name="TaskScreen2" component={HomeScreen2} />
      <Tab.Screen name="MoodScreen" component={MoodScreen1} />
      <Tab.Screen name="MoodScreen2" component={MoodScreen2} />
      <Tab.Screen name="CalendarScreen" component={CalendarScreen} />
      <Tab.Screen name="LocationScreen" component={LocationScreen} />
      <Tab.Screen name="SettingsScreen" component={SettingsScreen} />
    </Tab.Navigator>
    </UserDataProvider>
  );
}

const styles = StyleSheet.create({
  safeViewContainer:{
    backgroundColor: '#404040',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#404040',
    borderBottomWidth: 1,
    borderBottomColor: '#c9c7b020',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    position: 'relative',
  },
  icon: {
    color: 'white',
    paddingBottom: 5,
    width: 45,
    height: 45,
  },
  dotsContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 2,
  },
});
