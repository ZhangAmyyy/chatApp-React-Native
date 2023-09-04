import React, { useEffect, useState,useCallback } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { useSelector } from 'react-redux';
import { async } from 'validate.js';
import PageContainer from '../components/PageContainer';
import PageTitle from '../components/PageTitle';
import ProfileImage from '../components/ProfileImage';
import { getUserChats } from '../utils/actions/userActions';
import DataItem from '../components/DataItem';
import SubmitButton from '../components/SubmitButton';
import { removeUserFromChat } from '../utils/actions/chatActions';

const ContactScreen = props => {
    const storedUsers = useSelector(state => state.users.storedUsers);
    const currentUser = storedUsers[props.route.params.uid];
    const userData = useSelector(state => state.auth.userData);

    const storedChats = useSelector(state => state.chats.chatsData);
    const [commonChats, setCommonChats] = useState([]);

    const chatId = props.route.params.chatId;
    const chatData = chatId && storedChats[chatId];
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const getCommonUserChats = async () => {
            const currentUserChats = await getUserChats(currentUser.userId);
            setCommonChats(
                Object.values(currentUserChats).filter(cid => storedChats[cid] && storedChats[cid].isGroupChat)
            )
        }
        getCommonUserChats();
    }, [])

    const removeFromChat = useCallback(async() => {
        try {
            setIsLoading(true);
            // Remove user
            await removeUserFromChat(userData, currentUser, chatData);
            props.navigation.goBack();
        } catch (error) {
            console.log(error);
        }
        finally {
            setIsLoading(false);
        }
    }, [props.navigation, isLoading])

    return <PageContainer>
        <View style={styles.topContainer}>
            <ProfileImage
                uri={currentUser.profilePicture}
                size={80}
                style={{ marginBottom: 20 }}
            />

            <PageTitle text={`${currentUser.firstName} ${currentUser.lastName}`} />
            {
                currentUser.about ?
                    <Text style={styles.about} numberOfLines={2}>{currentUser.about}</Text> :
                    null
            }
        </View>
        {
            commonChats.length > 0 &&
            <>
                <Text style={styles.heading}>{commonChats.length} {commonChats.length === 1 ? "Group" : "Groups"} in Common</Text>
                {
                    commonChats.map(cid => {
                        const chatData = storedChats[cid];
                        return <DataItem
                            key={cid}
                            title={chatData.chatName}
                            subTitle={chatData.latestMessageText}
                            type="link"
                            onPress={() => props.navigation.push("Chat", { chatId: cid })}
                            image={chatData.chatImage}
                        />
                    })
                }
            </>
        }
        {
            chatData && chatData.isGroupChat &&
            (isLoading ?
            <ActivityIndicator size='small' color="#32d48e" /> :
            <SubmitButton
                title="Remove from chat"
                color='#e74c3c'
                onPress={removeFromChat}
            />)
        }
    </PageContainer>
}

const styles = StyleSheet.create({
    topContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 20
    },
    about: {
        fontFamily: 'regular',
        fontSize: 16,
        letterSpacing: 0.3,
        color: 'grey'
    },
    heading: {
        fontFamily: 'bold',
        letterSpacing: 0.3,
        color: "#1c1e21",
        marginVertical: 8
    }
});

export default ContactScreen;