import React, { useCallback, useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Button, ImageBackground, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, FlatList, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import backgroundImage from '../assets/bg.png'
import { Feather } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import PageContainer from '../components/PageContainer';
import Bubble from '../components/Bubble';
import { createChat, sendTextMessages, sendImage } from '../utils/actions/chatActions';
import ReplyTo from "../components/ReplyTo";
import { launchImagePicker, uploadImageAsync,openCamera } from "../utils/imagePickerHelper";
import AwesomeAlert from 'react-native-awesome-alerts';
import { HeaderButtons, Item } from "react-navigation-header-buttons";
import CustomHeaderButton from "../components/CustomHeaderButton";

const ChatScreen = props => {
    const [chatUsers, setChatUsers] = useState([]);
    const [messageText, setMessageText] = useState("");
    const [chatId, setChatId] = useState(props.route?.params?.chatId);
    const [errorBannerText, setErrorBannerText] = useState("");
    const [replyingTo, setReplyingTo] = useState();
    const [tempImageUri, setTempImageUri] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const flatList = useRef();

    const userData = useSelector(state => state.auth.userData);
    const storedUsers = useSelector(state => state.users.storedUsers);
    const storedChats = useSelector(state => state.chats.chatsData);
    const chatMessages = useSelector(state => {
        if (!chatId) return [];
        const chatMessageData = state.messages.messagesData[chatId];
        if (!chatMessageData) return [];
        const messageList = [];
        for (const key in chatMessageData) {
            const message = chatMessageData[key];
            messageList.push({
                key,
                ...message
            });
        }
        return messageList;
    });
    const chatData = (chatId && storedChats[chatId]) || props.route?.params?.newChatData || {};

    const getChatTitleFromName = () => {
        const otherUserId = chatUsers.find(uid => uid !== userData.userId);
        const otherUserData = storedUsers[otherUserId];

        return otherUserData && `${otherUserData.firstName} ${otherUserData.lastName}`;
    }
    
    useEffect(() => {
        if(!chatData)return;
        props.navigation.setOptions({
            headerTitle: chatData.chatName ?? getChatTitleFromName(),
            headerRight: () => {
                return <HeaderButtons HeaderButtonComponent={CustomHeaderButton} >
                  {
                    chatId && 
                    <Item
                      title="Chat settings"
                      iconName="settings-outline"
                      style={{paddingEnd:2}}
                      onPress={() => chatData.isGroupChat ?
                        props.navigation.navigate("Setting", {chatId}) :
                        props.navigation.navigate("Contact", { uid: chatUsers.find(uid => uid !== userData.userId) })}
                    />
                  }
                </HeaderButtons>
              }
        })
        setChatUsers(chatData.users)
    }, [chatUsers])

    const sendMessage = useCallback(async () => {

        try {
            let id = chatId;
            if (!id) {
                // No chat Id. Create the chat
                id = await createChat(userData.userId, props.route.params.newChatData);
                setChatId(id);
            }
            await sendTextMessages(id, userData.userId, messageText, replyingTo && replyingTo.key);
            setMessageText("");
            setReplyingTo(null);
        } catch (error) {
            console.log(error)
            setErrorBannerText("Message failed to send");
            setTimeout(() => setErrorBannerText(""), 5000);

        }
    }, [messageText, chatId]);

    const pickImage = useCallback(async () => {
        try {
            const tempUri = await launchImagePicker();
            if (!tempUri) return;

            setTempImageUri(tempUri);
        } catch (error) {
            console.log(error);
        }
    }, [tempImageUri]);

    const takePhoto = useCallback(async () => {
        try {
          const tempUri = await openCamera();
          if (!tempUri) return;
    
          setTempImageUri(tempUri);
        } catch (error) {
          console.log(error);
        }
      }, [tempImageUri]);

    const uploadImage = useCallback(async () => {
        setIsLoading(true);

        try {
            let id = chatId;
            if (!id) {
                // No chat Id. Create the chat
                id = await createChat(userData.userId, props.route.params.newChatData);
                setChatId(id);
            }
            const uploadUrl = await uploadImageAsync(tempImageUri, true);
            setIsLoading(false);

            // Send Image
            await sendImage(id, userData.userId, uploadUrl, replyingTo && replyingTo.key)
            setReplyingTo(null);
            setTimeout(() => setTempImageUri(""), 500);
        } catch (error) {
            console.log(error);

        }
    }, [isLoading, tempImageUri, chatId])

    return (
        <SafeAreaView
            edges={['right', 'left', 'bottom']}
            style={styles.container}>
                <ImageBackground source={backgroundImage} style={styles.backgroundImage}>
                    <PageContainer style={{ backgroundColor: 'transparent' }}>
                        {
                            !chatId && <Bubble text='This is a new chat. Say hi!' type="system" />
                        }
                        {
                            errorBannerText !== "" && <Bubble text={errorBannerText} type="error" />
                        }
                        {
                            chatId &&
                            <FlatList
                                ref={(ref) => flatList.current = ref}
                                onContentSizeChange={() => flatList.current.scrollToEnd({ animated: false })}
                                onLayout={() => flatList.current.scrollToEnd({ animated: false })}
                                data={chatMessages}
                                renderItem={(itemData) => {
                                    const message = itemData.item;
                                    const isOwnMessage = message.sentBy === userData.userId;
                                    let messageType;
                                    if(message.type && message.type === "info"){
                                        messageType="info";
                                    }
                                    else if(isOwnMessage){
                                        messageType="myMessage"; 
                                    }
                                    else{
                                        messageType="theirMessage";
                                    }
                                    const sender = message.sentBy && storedUsers[message.sentBy];
                                    const name = sender && `${sender.firstName} ${sender.lastName}`;
                                    return <Bubble
                                        type={messageType}
                                        text={message.text}
                                        messageId={message.key}
                                        userId={userData.userId}
                                        chatId={chatId}
                                        date={message.sentAt}
                                        name={!chatData.isGroupChat || isOwnMessage ? undefined: name}
                                        setReply={() => setReplyingTo(message)}
                                        replyingTo={message.replyTo && chatMessages.find(i => i.key === message.replyTo)}
                                        imageUrl={message.imageUrl}
                                    />
                                }}
                            />
                        }

                    </PageContainer>
                    {
                        replyingTo &&
                        <ReplyTo
                            text={replyingTo.text}
                            user={storedUsers[replyingTo.sentBy]}
                            onCancel={() => setReplyingTo(null)}
                        />
                    }
                </ImageBackground>

                <View style={styles.inputContainer}>
                    <TouchableOpacity
                        style={styles.mediaButton}
                        onPress={pickImage}>
                        <Feather name="plus" size={24} color="black" />
                    </TouchableOpacity>

                    <TextInput
                        style={styles.textBox}
                        value={messageText}
                        onChangeText={text => setMessageText(text)}
                        //按回车页发送
                        onSubmitEditing={sendMessage} />


                    {
                        messageText === "" &&
                        <TouchableOpacity
                            style={styles.mediaButton}
                            onPress={takePhoto}>
                            <Feather name="camera" size={24} color="black" />
                        </TouchableOpacity>
                    }

                    {
                        messageText !== "" && (
                            <TouchableOpacity
                                //{{}}是Object, ...是所有的都要，两个style，后面的会overwrite前面的 
                                style={{ ...styles.mediaButton, ...styles.sendButton }}
                                onPress={sendMessage}>
                                <Feather name="send" size={20} color="white" />
                            </TouchableOpacity>
                        )}
                    <AwesomeAlert
                        show={tempImageUri !== ""}
                        title='Send image?'
                        closeOnTouchOutside={true}
                        closeOnHardwareBackPress={false}
                        showCancelButton={true}
                        showConfirmButton={true}
                        cancelText='Cancel'
                        confirmText="Send image"
                        confirmButtonColor="#32d48e"
                        cancelButtonColor='#e74c3c'
                        titleStyle={styles.popupTitleStyle}
                        onCancelPressed={() => setTempImageUri("")}
                        onConfirmPressed={uploadImage}
                        onDismiss={() => setTempImageUri("")}
                        customView={(
                            <View>
                                {
                                    isLoading &&
                                    <ActivityIndicator size='small' color="#32d48e" />
                                }
                                {
                                    !isLoading && tempImageUri !== "" &&
                                    <Image source={{ uri: tempImageUri }} style={{ width: 200, height: 200 }} />
                                }
                            </View>
                        )}
                    />
                </View>
        </SafeAreaView>
    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column'
    },
    screen: {
        flex: 1,
    },
    backgroundImage: {
        flex: 1,
    },
    inputContainer: {
        flexDirection: 'row',
        paddingVertical: 8,
        paddingHorizontal: 10,
        height: 50,
    },
    textBox: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 50,
        borderColor: '#bdc3c7',
        marginHorizontal: 15,
        paddingHorizontal: 12,
    },
    mediaButton: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 35,
    },
    sendButton: {
        backgroundColor: 'black',
        borderRadius: 50,
        padding: 8,
        width: 35
    },
    popupTitleStyle: {
        fontFamily: 'regular',
        letterSpacing: 0.3,
        color: "#1c1e21"
    }
})

export default ChatScreen;