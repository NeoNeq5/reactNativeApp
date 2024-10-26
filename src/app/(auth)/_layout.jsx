import { View, Text } from 'react-native'
import React from 'react'
import { Stack, Tabs } from 'expo-router'
import { UserDataProvider } from '../GlobalContext'

const _layout = () => {
  return (
<UserDataProvider>
    <Stack>
        <Stack.Screen name='SignIn' options={{
            headerShown: false
        }}/>
        <Stack.Screen name='SignUp' options={{
            headerShown: false
        }}/>
        <Stack.Screen name='ProfileConector' options={{
            headerShown: false
        }}/>
    </Stack>
</UserDataProvider>


  )
}

export default _layout