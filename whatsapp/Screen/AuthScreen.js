import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PageContainer from '../components/PageContainer';
import SignInForm from '../components/SignInForm';
import SignUpForm from '../components/SignUpForm';
import logo from '../assets/logo.png';

const AuthScreen = props => {

    const [isSignUp, setIsSignUp] = useState(false);

    return <SafeAreaView style={{ flex: 1 }}>
        <PageContainer >
            <ScrollView>
                <KeyboardAvoidingView 
                    style={styles.keyboardAvoidingView}
                    behavior={Platform.OS === "ios" ? "height" : undefined}
                    keyboardVerticalOffset={100}>
                <View style={styles.imageContainer}>
                    <Image
                        style={styles.Image}
                        source={logo}
                        resizeMode='center' />
                </View>

                {
                    isSignUp ?
                        <SignUpForm /> :
                        <SignInForm />
                }

                <TouchableOpacity
                    onPress={() => setIsSignUp(prevState => !prevState)}
                    style={styles.linkContainer}>
                    <Text style={styles.link}>{`Swithch to ${isSignUp ? "sign in" : "sign up"}`}</Text>
                </TouchableOpacity>
                </KeyboardAvoidingView>
            </ScrollView>
        </PageContainer>
    </SafeAreaView>
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    link: {
        color: 'lightgreen',
        fontFamily: 'bold',
        letterSpacing: 0.3

    },
    linkContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 15
    },
    imageContainer: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    image: {
        width: '50%',

    },
    keyboardAvoidingView:{
        flex:1,
        justifyContent:'center'
    }
})

export default AuthScreen; 