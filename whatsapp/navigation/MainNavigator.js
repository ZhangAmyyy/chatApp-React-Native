import React, { useEffect, useState } from "react";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ChatListScreen from '../Screen/ChatListScreen';
import ChatSettingScreen from '../Screen/ChatSettingScreen';
import SettingsScreen from '../Screen/SettingsScreen';
import ChatScreen from "../Screen/ChatScreen";
import NewChatScreen from "../Screen/NewChatScreen";
import { useDispatch, useSelector } from 'react-redux';
import { getFirebaseApp } from "../utils/firebaseHelper";
import { ref, child, getDatabase, off, onValue, push, get } from "firebase/database";
import { setChatsData } from "../store/chatSlice";
import { ActivityIndicator, StyleSheet, View, KeyboardAvoidingView, Platform } from "react-native";
import { setStoredUsers } from "../store/userSlice";
import { setChatMessages, setStarredMessages } from "../store/messagesSlice";
import ContactScreen from "../Screen/ContactScreen";
import DataListScreen from "../Screen/DataListScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
    return (
        <Tab.Navigator screenOptions={{
            headerTitle: "",
            headerShadowVisible: false,
        }}>
            <Tab.Screen name="ChatList" component={ChatListScreen} options={{
                tabBarLabel: 'Chats',
                tabBarIcon: ({ color, size }) => {
                    return <Ionicons name="chatbubble-outline" size={size} color={color} />
                }
            }} />
            <Tab.Screen name="Settings" component={SettingsScreen} options={{
                tabBarLabel: 'Settings',
                tabBarIcon: ({ size, color }) => (
                    <Ionicons name="settings-outline" size={size} color={color} />),
            }} />
        </Tab.Navigator>
    );
};

const StackNavigator = () => {
    return (
        <Stack.Navigator>
            <Stack.Group>
                <Stack.Screen name="Home" component={TabNavigator} options={{ headerShown: false }} />
                <Stack.Screen name="Chat" component={ChatScreen} options={{
                    headerTitle: '',
                    headerBackTitle: "Go Back",
                }} />
                <Stack.Screen name="Setting" component={ChatSettingScreen} options={{
                    headerTitle: "",
                    headerBackTitle: "Go Back",
                    headerShadowVisible: false,
                    headerShadowVisible: false
                }} />
            </Stack.Group>
            <Stack.Group screenOptions={{ presentation: 'containedModal' }}>
                <Stack.Screen name="NewChat" component={NewChatScreen}
                />

            </Stack.Group>
            <Stack.Screen
                name="Contact"
                component={ContactScreen}
                options={{
                    headerTitle: "Contact info",
                    headerBackTitle: "Back",
                }}
            />
            <Stack.Screen
                name="DataList"
                component={DataListScreen}
                options={{
                    headerTitle: "",
                    headerBackTitle: "Back",
                }}
            />
        </Stack.Navigator>
    )
}

const MainNavigator = (props) => {

    const dispatch = useDispatch();

    const [isLoading, setIsLoading] = useState(true);

    const userData = useSelector(state => state.auth.userData);
    const storedUsers = useSelector(state => state.users.storedUsers);

    useEffect(() => {
        const app = getFirebaseApp();
        const dbRef = ref(getDatabase(app));
        const userChatsRef = child(dbRef, `userChats/${userData.userId}`);
        const refs = [userChatsRef];

        onValue(userChatsRef, (querySnapshot) => {
            const chatIdsData = querySnapshot.val() || {};
            const chatIds = Object.values(chatIdsData);

            const chatsData = {};
            let chatsFoundCount = 0;

            for (let i = 0; i < chatIds.length; i++) {
                const chatId = chatIds[i];
                const chatRef = child(dbRef, `chats/${chatId}`);
                refs.push(chatRef);

                onValue(chatRef, (chatSnapshot) => {
                    chatsFoundCount++;

                    const data = chatSnapshot.val();

                    if (data) {
                        if(!data.users.includes(userData.userId)){
                            return;
                        }
                        data.key = chatSnapshot.key;

                        data.users.forEach(userId => {
                            if (storedUsers[userId]) return;

                            const userRef = child(dbRef, `users/${userId}`);

                            get(userRef, userSnapshot => {
                                const userSnapshotData = userSnapshot.val();
                                dispatch(setStoredUsers({ newUsers: userSnapshotData }))
                            });
                            refs.push(userRef);
                        })

                        chatsData[chatSnapshot.key] = data;
                    }

                    if (chatsFoundCount >= chatIds.length) {
                        dispatch(setChatsData({ chatsData }));
                        setIsLoading(false);
                    }
                })

                const messagesRef = child(dbRef, `messages/${chatId}`);
                refs.push(messagesRef);

                onValue(messagesRef, messagesSnapshot => {
                    const messagesData = messagesSnapshot.val();
                    dispatch(setChatMessages({ chatId, messagesData }));
                })

                if (chatsFoundCount == 0) {
                    setIsLoading(false);
                }
            }
        })

        const userStarredMessagesRef = child(dbRef, `userStarredMessages/${userData.userId}`);
        refs.push(userStarredMessagesRef);
        onValue(userStarredMessagesRef, querySnapshot => {
            const starredMessages = querySnapshot.val() ?? {};
            dispatch(setStarredMessages({ starredMessages }));
        })

        return () => {
            refs.forEach(ref => off(ref));
        }

    }, [])

    if (isLoading) {
        <View style={styles.common}>
            <ActivityIndicator size={'large'} color='grey' />
        </View>
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <StackNavigator />
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    common: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
})

export default MainNavigator;