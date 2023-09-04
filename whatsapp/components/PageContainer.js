import { StyleSheet, View } from "react-native"

 /* //props.style 是<PageContainer style={{ backgroundColor:'blue'}}></PageContainer> */
const PageContainer = props =>{
    return <View style={{...styles.container,...props.style}}>
        {props.children}
    </View>
};
//通过props.children读到所有在<PageContainer>之间的内容

const styles = StyleSheet.create({
    container: {
        paddingHorizontal:20,
        flex:1,
        backgroundColor:'white',
    }
})
export default PageContainer;