package com.microsoft.fnandroid.frndatepicker

import android.app.Activity
import android.os.Handler
import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.jakewharton.threetenabp.AndroidThreeTen
import com.microsoft.fluentui.datetimepicker.DateTimePickerDialog
import org.threeten.bp.Duration
import org.threeten.bp.ZonedDateTime

class FRNDatePickerModule(private val reactContext: ReactApplicationContext) :
        ReactContextBaseJavaModule(reactContext) {

    override fun getName() = REACT_CLASS

    companion object {
        const val REACT_CLASS = "FRNDatePicker"
    }

    init {
        AndroidThreeTen.init(reactContext);
    }

    @ReactMethod
    fun consoleLog(msg: String) {
        Log.w("FRNDatePickerModule", msg)
    }

    @ReactMethod()
    fun showDatePicker() {
        val mainHandler: Handler = Handler(reactContext.mainLooper)
        val runnable = Runnable {
            val dateTimePickerDialog = DateTimePickerDialog(
                    reactContext.currentActivity ?: reactContext,
                    DateTimePickerDialog.Mode.DATE,
                    DateTimePickerDialog.DateRangeMode.NONE,
                    ZonedDateTime.now(),
                    Duration.ZERO
            )

            dateTimePickerDialog.show()
        }

        mainHandler.post(runnable);
    }
}