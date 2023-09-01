package com.microsoft.fnandroid.frndatepicker

import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class FRNDatePickerModule(reactContext: ReactApplicationContext) :
        ReactContextBaseJavaModule(reactContext) {
    override fun getName() = REACT_CLASS

    companion object {
        const val REACT_CLASS = "FRNDatePicker"
    }

    @ReactMethod
    fun consoleLog(msg: String) {
        Log.w("FRNDatePickerModule", msg)
    }
}