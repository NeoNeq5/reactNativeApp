import { Redirect } from 'expo-router';
import React from 'react';

const Index = () => {
    return (
        <Redirect href={'(auth)/SignIn'} />
    )
}

export default Index;


