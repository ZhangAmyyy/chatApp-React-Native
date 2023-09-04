import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Button, TextInput, ActivityIndicator, FlatList } from 'react-native';
import { HeaderButtons, Item } from 'react-navigation-header-buttons';
import CustomHeaderButton from '../components/CustomHeaderButton';
import PageContainer from '../components/PageContainer';
import { FontAwesome } from '@expo/vector-icons';
import { searchUsers } from '../utils/actions/userActions';
import DataItem from '../components/DataItem';
import { useDispatch, useSelector } from 'react-redux';
import { setStoredUsers } from '../store/userSlice';
import ProfileImage from '../components/ProfileImage';


const NewChatScreen = props => {

    const dispatch = useDispatch();

    const [isLoading, setIsLoading] = useState(false);
    const [users, setUsers] = useState();
    const [noResultsFound, setNoResultsFound] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [chatName, setChatName] = useState("");
    const [selectedUsers, setSelectedUsers] = useState([]);

    const chatId = props.route.params && props.route.params.chatId;
    const existingUsers = props.route.params && props.route.params.existingUsers;
    const userData = useSelector(state => state.auth.userData);
    const storedUsers = useSelector(state => state.users.storedUsers);
    const selectedUsersFlatList = useRef();
    const isGroupChat = props.route.params && props.route.params.isGroupChat;
    const isGroupChatDisabled = selectedUsers.length === 0 || (isNewChat && chatName === "");

    const isNewChat = !chatId;
    useEffect(() => {
        props.navigation.setOptions({
            headerLeft: () => {
                return <HeaderButtons HeaderButtonComponent={CustomHeaderButton}>
                    <Item
                        title="Close"
                        onPress={() => props.navigation.goBack()} />
                </HeaderButtons>
            },
            headerRight: () => {
                return <HeaderButtons HeaderButtonComponent={CustomHeaderButton}>
                    {
                        isGroupChat &&
                        <Item
                            title={isNewChat ?"Create": "Add"}
                            disabled={isGroupChatDisabled}
                            color={isGroupChatDisabled ? "#bdc3c7" : undefined}
                            onPress={() => {
                                const screenName = isNewChat? "ChatList" :"Setting"
                                props.navigation.navigate(screenName, {
                                    selectedUsers,
                                    chatName,
                                    chatId
                                })
                            }}/>
                    }
                </HeaderButtons>
            },
            headerTitle: isGroupChat ? "Add participants" : "New chat"
        })
    }, [chatName, selectedUsers]);

    useEffect(() => {
        const delaySearch = setTimeout(async () => {
            if (!searchTerm || searchTerm === "") {
                setUsers();
                setNoResultsFound(false);
                return;
            }
            setIsLoading(true);

            const usersResult = await searchUsers(searchTerm);
            delete usersResult[userData.userId];
            setUsers(usersResult);

            if (Object.keys(usersResult).length === 0) {
                setNoResultsFound(true);
            }
            else {
                setNoResultsFound(false);

                dispatch(setStoredUsers({ newUsers: usersResult }));
            }
            setIsLoading(false);
        }, 500);
        return () => clearTimeout(delaySearch);
    }, [searchTerm]);

    const userPressed = userId => {
        if (isGroupChat) {
            const newSelectedUsers = selectedUsers.includes(userId) ?
                selectedUsers.filter(id => id !== userId) :
                selectedUsers.concat(userId);

            setSelectedUsers(newSelectedUsers);
        }
        else {
            props.navigation.navigate("ChatList", {
                selectedUserId: userId
            })
        }
    }

    return <PageContainer>

        {
            isNewChat && isGroupChat &&
            <View style={styles.chatNameContainer}>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.textbox}
                            placeholder="Enter a name for your chat"
                            autoCorrect={false}
                            autoComplete={false}
                            onChangeText={text => setChatName(text)}
                        />
                    </View>
                </View>
        }   
        {
            isGroupChat &&   
                <View style={styles.selectedUsersContainer}>
                    <FlatList
                        style={styles.selectedUsersList}
                        data={selectedUsers}
                        horizontal={true}
                        keyExtractor={item => item}
                        contentContainerStyle={{alignItems:'center'}}
                        ref={ref => selectedUsersFlatList.current = ref}
                        onContentSizeChange={() => selectedUsersFlatList.current.scrollToEnd()}
                        renderItem={itemData => {
                            const userId = itemData.item;
                            const userData = storedUsers[userId];
                            return <ProfileImage
                                style={styles.selectedUserStyle}
                                size={40}
                                uri={userData.profilePicture}
                                onPress={() => userPressed(userId)}
                                showRemoveButton={true}
                            />
                        }}
                    />
                </View>
        }

        <View style={styles.searchContainer}>
            <FontAwesome name="search" size={15} color="lightgrey" />
            <TextInput
                placeholder='Search'
                style={styles.serchBox}
                onChangeText={(text) => setSearchTerm(text)}
            />
        </View>
        {
            isLoading &&
            <View style={styles.commonCenter}>
                <ActivityIndicator size={'large'} color='grey' />

            </View>
        }
        {
            !isLoading && !noResultsFound && users &&
            <FlatList
                data={Object.keys(users)}
                keyExtractor={(item, index) => index.toString()}
                renderItem={(itemData) => {
                    const userId = itemData.item;
                    const userData = users[userId];

                    if(existingUsers && existingUsers.includes(userId)){return;}
                    return <DataItem
                        title={`${userData.firstName} ${userData.lastName}`}
                        subTitle={userData.about}
                        image={userData.profilePicture}
                        onPress={() => userPressed(userId)}
                        type={isGroupChat ? "checkbox" : ""}
                        isChecked={selectedUsers.includes(userId)}
                    />
                }}
            />
        }
        {
            !isLoading && noResultsFound && (
                <View style={styles.commonCenter}>
                    <FontAwesome name="question" size={55} color="lightgrey" style={styles.noResultsIcon} />
                    <Text style={styles.noResultsText}>No users found!</Text>
                </View>
            )
        }
        {
            !isLoading && !users && (
                <View style={styles.commonCenter}>
                    <FontAwesome name="users" size={55} color="lightgrey" style={styles.noResultsIcon} />
                    <Text style={styles.noResultsText}>Enter a name to search a user!</Text>
                </View>
            )

        }
    </PageContainer>
};

const styles = StyleSheet.create({
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ededed',
        height: 30,
        marginVertical: 8,
        paddingHorizontal: 8,
        paddingVertical: 5,
        borderRadius: 5,
    },
    serchBox: {
        marginLeft: 8,
        fontSize: 15,
        width: '100%'
    },
    commonCenter: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    noResultsIcon: {
        marginBottom: 40
    },
    noResultsText: {
        color: 'grey',
        fontFamily: 'regular',
        letterSpacing: 0.3
    },
    chatNameContainer: {
        paddingVertical: 10
    },
    inputContainer: {
        width: '100%',
        paddingHorizontal: 10,
        paddingVertical: 15,
        backgroundColor: "#F4F8F7",
        flexDirection: 'row',
        borderRadius: 2
    },
    textbox: {
        color: "#1c1e21",
        width: '100%',
        fontFamily: 'regular',
        letterSpacing: 0.3
    },
    selectedUsersList: {
        height: '100%',
        paddingTop:10
         
    },
    selectedUsersContainer: {
        height: 50,
        justifyContent:'center',
    },
    selectedUserStyle: {
        marginRight: 10,
        marginBottom: 10
    }
})

export default NewChatScreen;