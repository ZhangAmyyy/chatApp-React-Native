import React from "react";
import { StyleSheet, Text, TouchableWithoutFeedback, View } from "react-native";
import ProfileImage from "./ProfileImage";
import { Ionicons, AntDesign } from '@expo/vector-icons';

const imageSize = 40;
const DataItem = props => {
    const { title, subTitle, image, type, isChecked, icon } = props;

    const hideImage = props.hideImage && props.hideImage === true;

    return (
        <TouchableWithoutFeedback onPress={props.onPress}>
            <View style={styles.container}>
                {  
                    !icon && !hideImage &&
                    <ProfileImage
                        uri={image}
                        size={40}
                    />
                }
                {
                    icon &&
                    <View style={styles.leftIconContainer}>
                        <AntDesign name={icon} size={20} color="#3498db" />
                    </View>
                }
                <View style={styles.textContainer}>
                    <Text
                        numberOfLines={1}
                        style={{...styles.title,...{color: type==="button" ? "#3498db": "#1c1e21"}}}
                        >
                        {title}
                    </Text>
                    {   subTitle ?
                        <Text numberOfLines={1} style={styles.subTitle}>{subTitle}</Text>:
                        null
                    }
               </View>

                {
                    type === "checkbox" &&
                    <View style={{ ...styles.iconContainer, ...isChecked && styles.checkedStyle }}>
                        <Ionicons name="checkmark" size={18} color="white" />
                    </View>
                }

                {
                    type === "link" &&
                    <View>
                        <Ionicons name="chevron-forward-outline" size={18} color='grey' />
                    </View>
                }

            </View>
        </TouchableWithoutFeedback>
    )

}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingVertical: 7,
        borderBottomColor: '#ededed',
        borderBottomWidth: 1,
        alignItems: 'center',
        minHeight: 50
    },
    textContainer: {
        marginLeft: 14,
        flex: 1
    },
    title: {
        fontFamily: 'regular',
        fontSize: 16,
        letterSpacing: 0.3
    },
    subTitle: {
        fontFamily: 'black',
        color: 'grey',
        letterSpacing: 0.3
    },
    iconContainer: {
        borderWidth: 1,
        borderRadius: 50,
        borderColor: 'lightgrey',
        backgroundColor: 'white'
    },
    checkedStyle: {
        backgroundColor: "#3498db",
        borderColor: 'transparent'
    },
    leftIconContainer: {
        backgroundColor: '#ededed',
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        width: 40,
        height: 40
    }

});

export default DataItem;

