import React, { useState } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import userImage from '../assets/userImage.jpeg';
import { FontAwesome } from '@expo/vector-icons';
import { launchImagePicker, uploadImageAsync } from "../utils/imagePickerHelper";
import { updateSignedInUserData  } from "../utils/actions/authActions";
import { useDispatch } from 'react-redux';
import { updateLoggedInUserData } from "../store/authSlice";
import { updateChatData } from "../utils/actions/chatActions";


const ProfileImage = props => {

    const dispatch = useDispatch();

    const source = props.uri ? { uri: props.uri} : userImage;

    const [image, setImage] = useState(source);
    const [isLoading,setIsLoading] = useState(false);

    const showEditButton = props.showEditButton && props.showEditButton===true;
    const showRemoveButton = props.showRemoveButton && props.showRemoveButton===true;

    const userId = props.userId;
    const chatId = props.chatId; 

    const pickImage = async () => {
        try {
            const tempUri = await launchImagePicker();

            if (!tempUri) return;

            //upload image
            setIsLoading(true);
            const uploadUrl = await uploadImageAsync(tempUri, chatId !==undefined);
            setIsLoading(false);

            if(!uploadUrl){
                throw new Error("could not upload image");
            }
            if(chatId){
                 await updateChatData(chatId,userId,{chatImage: uploadUrl})
            }
            else{
                const newData = {profilePicture: uploadUrl}
            
                await updateSignedInUserData(userId, newData);
                dispatch(updateLoggedInUserData({newData: newData}));
            }
            setImage({uri: uploadUrl});

            //set image
        }
        catch (error) {
            console.log(error);
            setIsLoading(false);

        }
    }

    const Container = props.onPress || showEditButton ? TouchableOpacity : View;

    return (
        <Container style={props.style} onPress={props.onPress || pickImage}>
            {
                isLoading?
                <View height={props.size} width={props.size} style={styles.loadingContainer}>
                    <ActivityIndicator size={'small'} color='grey' />
                </View>:
                <Image
                style={{ ...styles.image, ...{ width: props.size, height: props.size } }}
                source={image} />
            }

            {
                showEditButton && !isLoading &&
                <View style={styles.editIconContainer}>
                <FontAwesome name="pencil" size={15} color="black" />
                </View>
            }
            {
                showRemoveButton && !isLoading &&
                <View style={styles.removeIconContainer}>
                <FontAwesome name="close" size={15} color="black" />
                </View>
            }
            

            
        </Container>
    )
};

const styles = StyleSheet.create({
    image: {
        borderRadius: 50,
        borderColor: 'grey',
        borderWidth: 1,
    },
    editIconContainer: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: 'lightgrey',
        borderRadius: 20,
        padding: 8
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    removeIconContainer: {
        position: 'absolute',
        bottom: -3,
        right: -3,
        backgroundColor: 'lightgrey',
        borderRadius: 20,
        padding: 3
    }
})

export default ProfileImage;