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
                    getDuration(startDate, endDate, DateTimePickerDialog.DateRangeMode.values()[dateRangeMode])
            )

            dateTimePickerDialog.onDateTimePickedListener =
                    object : DateTimePickerDialog.OnDateTimePickedListener {
                        override fun onDateTimePicked(dateTime: ZonedDateTime, duration: Duration) {
                            val endDateTime: ZonedDateTime = dateTime.plus(duration);
                            onDateTimePicked.invoke(
                                    formatDate(dateTime,
                                            DateTimePickerDialog.Mode.values()[dialogMode]),
                                    formatDate(endDateTime,
                                            DateTimePickerDialog.Mode.values()[dialogMode]))
                        }
                    }

            dateTimePickerDialog.show();
        }

        mainHandler.post(runnable);
    }

    private fun formatDate(selectedDate: ZonedDateTime, dialogMode: DateTimePickerDialog.Mode): String {
        Log(selectedDate.zone.toString());

        // Removes the timezone information from the date object.
        val localDate = selectedDate.toLocalDateTime();
        if (dialogMode == DateTimePickerDialog.Mode.DATE) {
            return DateTimeFormatter.ISO_DATE.format(localDate);
        }

        return DateTimeFormatter.ISO_DATE_TIME.format(localDate);
    }

    private fun getDuration(startDate: String?, endDate: String?, dateRangeMode: DateTimePickerDialog.DateRangeMode): Duration {
        if (startDate.isNullOrEmpty() || endDate.isNullOrEmpty() || dateRangeMode == DateTimePickerDialog.DateRangeMode.NONE) {
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

    private fun Log(msg: String) {
        Log.d("FRNDatePickerModule", msg);
    }
}