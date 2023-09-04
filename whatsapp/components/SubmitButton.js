import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native"

const SubmitButton = props =>{
    const enabledBgColor = props.color || '#32d48e';
    const disabledBgColor = 'lightgrey';
    const bgColor = props.disabled ? disabledBgColor : enabledBgColor;

    return <TouchableOpacity 
            onPress={props.disabled ? ()=> {}: props.onPress}
            style={{ ...styles.button,...props.style,...{ backgroundColor: bgColor }}}>
        <Text style={{color: props.disabled? 'grey' : 'white'}}>{props.title}</Text>
    </TouchableOpacity>
};

const styles=StyleSheet.create({
    button: {
        paddingHorizontal:30,
        paddingVertical:10,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        width: '90%'
    }

});

export default SubmitButton;