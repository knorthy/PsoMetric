import { StyleSheet, Text, TextInput, View } from 'react-native'
import React from 'react'
import { hp, wp } from '../helpers/common'

const Input = (props) => {
  return (
    <View style={[styles.container, props.containerStyles]}>
    <TextInput
        style={{flex: 1}}
        placeholderTextColor="#949494ff"
        ref={props.inputRef && props.inputRef}
        {...props}
    />
    </View>
  )
} 

export default Input

const styles = StyleSheet.create({
    container: {
        height: hp(7.2),
        borderColor: '#949494ff',
        borderWidth: 1,
        borderRadius: 10,
        borderCurve: 'continuous',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 18,
        gap: 12,
    },
})