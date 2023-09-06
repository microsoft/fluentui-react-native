package com.microsoft.fnandroid.frndatepicker

import android.app.Activity
import android.os.Handler
import android.util.Log
import com.facebook.react.bridge.Callback
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.jakewharton.threetenabp.AndroidThreeTen
import com.microsoft.fluentui.datetimepicker.DateTimePickerDialog
import org.threeten.bp.Duration
import org.threeten.bp.Instant
import org.threeten.bp.ZoneOffset
import org.threeten.bp.ZonedDateTime
import org.threeten.bp.format.DateTimeFormatter

class FRNDatePickerModule(private val reactContext: ReactApplicationContext) :
        ReactContextBaseJavaModule(reactContext) {

    override fun getName() = REACT_CLASS

    override fun getConstants(): MutableMap<String, Any>? {
        return hashMapOf("DIALOG_MODE" to hashMapOf<String, Int>(
                "DATE" to DateTimePickerDialog.Mode.DATE.ordinal,
                "DATE_TIME" to DateTimePickerDialog.Mode.DATE_TIME.ordinal,
                "TIME_DATE" to DateTimePickerDialog.Mode.TIME_DATE.ordinal
        ), "DATE_RANGE_MODE" to hashMapOf<String, Int>(
                "NONE" to DateTimePickerDialog.DateRangeMode.NONE.ordinal,
                "START" to DateTimePickerDialog.DateRangeMode.START.ordinal,
                "END" to DateTimePickerDialog.DateRangeMode.END.ordinal,
        ))
    }

    companion object {
        const val REACT_CLASS = "FRNDatePicker"
    }

    init {
        AndroidThreeTen.init(reactContext);
    }

    @ReactMethod()
    fun showDatePicker(
            dialogMode: Int?,
            dateRangeMode: Int?,
            startDate: String?,
            endDate: String?,
            onDateTimePicked: Callback
    ) {
        val dialogMode = dialogMode ?: DateTimePickerDialog.Mode.DATE.ordinal;
        val dateRangeMode = dateRangeMode ?: DateTimePickerDialog.DateRangeMode.NONE.ordinal;

        val mainHandler: Handler = Handler(reactContext.mainLooper)
        val runnable = Runnable {
            val dateTimePickerDialog = DateTimePickerDialog(
                    reactContext.currentActivity ?: reactContext,
                    DateTimePickerDialog.Mode.values()[dialogMode],
                    DateTimePickerDialog.DateRangeMode.values()[dateRangeMode],
                    getZonedDateTimeFromString(startDate),
                    getDurationFromStartAndEnd(startDate, endDate)
            )

            dateTimePickerDialog.onDateTimePickedListener =
                    object : DateTimePickerDialog.OnDateTimePickedListener {
                        override fun onDateTimePicked(dateTime: ZonedDateTime, duration: Duration) {
                            val formatter: DateTimeFormatter = DateTimeFormatter.ISO_INSTANT;
                            val formattedStartDate: String = formatter.format(dateTime);
                            val endDate: ZonedDateTime = dateTime.plus(duration);
                            val formattedEndDate: String = formatter.format(endDate);
                            onDateTimePicked.invoke(formattedStartDate, formattedEndDate, duration.toMinutes().toInt());
                        }
                    }

            dateTimePickerDialog.show();
        }

        mainHandler.post(runnable);
    }

    private fun getDurationFromStartAndEnd(startDate: String?, endDate: String?): Duration {
        if (startDate.isNullOrEmpty() || endDate.isNullOrEmpty()) {
            return Duration.ZERO;
        }

        val zonedStart = getZonedDateTimeFromString(startDate);
        val zonedEnd = getZonedDateTimeFromString(endDate);

        val duration = Duration.between(zonedStart, zonedEnd);
        return duration;
    }

    private fun getZonedDateTimeFromString(dateTimeString: String?) : ZonedDateTime {
        if (dateTimeString.isNullOrEmpty()) {
            return ZonedDateTime.now();
        }

        val formatter = DateTimeFormatter.ISO_INSTANT;
        val instant = Instant.from(formatter.parse(dateTimeString));
        val zonedDateTime = ZonedDateTime.ofInstant(instant, ZoneOffset.UTC);

        return zonedDateTime;
    }
}