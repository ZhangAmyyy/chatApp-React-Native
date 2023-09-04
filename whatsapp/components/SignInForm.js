import React, { useCallback, useReducer,useEffect,useState } from "react";
import Input from '../components/Input';
import { AntDesign } from '@expo/vector-icons';
import SubmitButton from '../components/SubmitButton';
import { validateInput } from "../utils/actions/formActions";
import { reducer } from "../utils/reducers/formReducer";
import { signIn } from "../utils/actions/authActions";
import { ActivityIndicator, Alert } from "react-native";
import { useDispatch } from 'react-redux';

const isTestMode =true;

const initialState = {
    inputValues: {
        email: isTestMode ? "dafa@example.com" : "",
        password: isTestMode ? "123456" : "",
    },
    inputValidities: {
        email: false,
        password: false,
    },
    formIsValid: isTestMode

}

const SignInForm = props =>{
    const dispatch = useDispatch();

    const [error,setError] = useState();
    const [isLoading,setIsLoading] = useState(false);
    const [formState, dispatchFormState] = useReducer(reducer,initialState);


    const inputChangedHandler = useCallback((inputId, inputValue) => {
        const result=validateInput(inputId,inputValue);
        dispatchFormState({inputId: inputId,validationResult: result,inputValue:inputValue})
    }, [dispatchFormState]);

    useEffect(() =>{
        if(error){
            Alert.alert("An error occured", error);
        }
    },[error])

    const authHandler = useCallback(async () =>{
        try {
            setIsLoading(true);
            const action = signIn(
                formState.inputValues.email,
                formState.inputValues.password,
            );
            setError(null);
            await dispatch(action );
        } catch (error) {
            setError(error.message);
            setIsLoading(false);
        }
    },[dispatch,formState]);

    return(
        <>
        
            <Input id="email" label="Email" keyboardType="email-address" autoCapitalize="none" icon="mail" iconPack={AntDesign} onInputChanged={inputChangedHandler} initialValue={formState.inputValues.email} errorText={formState.inputValidities["email"]}/>
            <Input id="password" label="Password" autoCapitalize="none" secureTextEntry icon="lock" iconPack={AntDesign} onInputChanged={inputChangedHandler} initialValue={formState.inputValues.password} errorText={formState.inputValidities["password"]}/>

            {
            isLoading?
            <ActivityIndicator size={'small'} color='grey' style={{marginTop:10}} />:
            <SubmitButton
                title="Sign in"
                onPress={authHandler}
                style={{ marginTop: 20 }} 
                disabled={!formState.formIsValid}/>
            }
        </>
    )
};

export default SignInForm;