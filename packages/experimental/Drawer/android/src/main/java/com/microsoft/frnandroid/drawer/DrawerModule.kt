package com.microsoft.frnandroid.drawer

import com.facebook.react.bridge.Callback
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.microsoft.fluentui:FluentUIAndroid

/*This class will communicate with react-native*/
class DrawerModule(context: ReactApplicationContext) : ReactContextBaseJavaModule(context) {

    override fun getName(): String {
        return "DrawerModule"
    }

    override fun getConstants(): Map<String, Any>? {
        val constants = HashMap<String, Any>()
        constants.put('message', 'Hello from native code')
        return constants
    }

}