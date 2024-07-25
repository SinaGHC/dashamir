import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import colors from '../config/colors'

const Seperator = () => {
  return (
    <View style={styles.seperator}>
      
    </View>
  )
}

export default Seperator

const styles = StyleSheet.create({
    seperator: {
        width: '100%',
        height: 1,
        backgroundColor: colors.LIGHT
    }
})