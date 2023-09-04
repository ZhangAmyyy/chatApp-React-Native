import { useState } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';


/* //props.style 是<PageContainer style={{ backgroundColor:'blue'}}></PageContainer> */
const Input = props => {

    const [value,setValue] = useState(props.initialValue)

    const onChangeText = text =>{
        setValue(text);
        props.onInputChanged(props.id, text);
    }

    return <View style={styles.container}>
        <Text style={styles.label}>{props.label}</Text>
        <View style={styles.inputContainer}>
            {props.icon&&<props.iconPack name={props.icon} size={24} color="grey" style={styles.icon} />}
            <TextInput {...props} style={styles.input} onChangeText={onChangeText} value={value}/>
        </View>
        {
            props.errorText &&
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}> {props.errorText[0]} </Text>
            </View>
        }
    </View>
};
//通过props.children读到所有在<PageContainer>之间的内容

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    inputContainer: {
        width: '100%',
        backgroundColor: 'red',
        paddingHorizontal: 10,
        paddingVertical: 15,
        borderRadius: 2,
        backgroundColor: '#F4F8F7',
        flexDirection: 'row'
    },
    icon: {
        marginRight: 10,
    },
    label: {
        marginVertical: 8,
        fontFamily: 'bold',
        letterSpacing: 0.3,
        color: "#1c1e21",

    },
    input: {
        color: "#1c1e21",
        flex: 1,
        fontFamily: 'black',
        letterSpacing: 0.3,
        paddingTop: 0
    },
    errorContainer: {
        marginVertical: 5
    },
    errorText: {
        color: 'red',
        fontSize: 13,
        fontFamily: 'black',
        letterSpacing: 0.3
    }
})
export default Input;