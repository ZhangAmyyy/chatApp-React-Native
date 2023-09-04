import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

const ReplyTo = props => {
    const { text, user, onCancel } = props;
    const name = `${user.firstName} ${user.lastName}`;

    return <View style={styles.container}>
        <View style={styles.textContainer}>

            <Text numberOfLines={1} style={styles.name}>{name}</Text>
            <Text numberOfLines={1}>{text}</Text>

        </View>
        <TouchableOpacity onPress={onCancel}>
            <AntDesign name="closecircleo" size={24} color="#3498db" />
        </TouchableOpacity>
    </View>
}

const styles = StyleSheet.create({
    container:{
        backgroundColor: '#ededed',
        padding: 8,
        flexDirection: 'row',
        alignItems: 'center',
        borderLeftColor: "#3498db",
        borderLeftWidth: 4
    },
    textContainer: {
        flex: 1,
        marginRight: 5
    },
    name: {
        color: "#3498db",
        fontFamily: 'black',
        letterSpacing: 0.3
    }
});

export default ReplyTo;