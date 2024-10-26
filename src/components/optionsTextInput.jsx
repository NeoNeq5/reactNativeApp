import React, { useRef, useState, useEffect } from 'react';
import { Animated, StyleSheet, TextInput, View } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';


SplashScreen.preventAutoHideAsync();

export default function AnimatedInputOpt({ value, onChange, placeholder, multiline, secureTextEntry }) {
    const [loaded, error] = useFonts({
        'moda': require('./../../assets/fonts/BodoniModaSC-VariableFont_opsz,wght.ttf'),
    });

    useEffect(() => {
        if (loaded || error) {
            SplashScreen.hideAsync();
        }
    }, [loaded, error]);

    if (!loaded && !error) {
        return null;
    }

    const [inputHeight, setHeight] = useState(0);
    const [placeholderWidth, setWidth] = useState(0);
    const animation = useRef(new Animated.Value(value ? 1 : 0)).current;

    const translateY = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -inputHeight / 2],
    });

    const translateX = animation.interpolate({
        inputRange: [0, 1.5],
        outputRange: [0, ((-placeholderWidth /2) + (placeholderWidth/10))],
    });

    const scale = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0.5],
    });

    useEffect(() => {
        Animated.spring(animation, {
            toValue: value ? 1 : 0,
            bounciness: 0,
            useNativeDriver: true,
        }).start();
    }, [value]);

    const onFocus = () => animate(1);
    const onBlur = () => !value && animate(0);

    const animate = (val) => {
        Animated.spring(animation, {
            toValue: val,
            bounciness: 0,
            useNativeDriver: true,
        }).start();
    };

    return (
        <View
            style={styles.inputContainer}
            onLayout={e => {
                if (inputHeight === 0) {
                    setHeight(e.nativeEvent.layout.height);
                }
            }}
        >
            <View style={[{ height: inputHeight }, styles.placeholderContainer]}>
                <Animated.Text
                    style={[
                        styles.placeholder,
                        { transform: [{ translateY }, { translateX }, { scale }] },
                    ]}
                    onTextLayout={e => {
                        if (placeholderWidth === 0) {
                            setWidth(e.nativeEvent.lines[0]?.width || 0);
                        }
                    }}
                >
                    {placeholder}
                </Animated.Text>
            </View>
            <TextInput
                style={[
                    styles.input,
                    multiline && { height: 100, textAlignVertical: 'top' },
                ]}

                onFocus={onFocus}
                onBlur={onBlur}
                onChangeText={onChange}
                multiline={multiline}
                value={value}
                secureTextEntry={secureTextEntry}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    inputContainer: {
        width: 200,
        borderRadius: 10,
        borderColor: '#999',
        paddingLeft: 5,
        shadowColor: 'black',
    },
    input: {
        color: 'white',
        paddingHorizontal: 5,
        paddingVertical: 10,
        fontSize: 18,
        justifyContent: 'center',
    },
    placeholderContainer: {
        position: 'absolute',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
    },
    placeholder: {
        fontSize: 24,
        position: 'absolute',
        marginHorizontal: 0,
        paddingHorizontal: 10,
        backgroundColor: 'transparent',
        color: '#FFFFFF66',
    },
});
