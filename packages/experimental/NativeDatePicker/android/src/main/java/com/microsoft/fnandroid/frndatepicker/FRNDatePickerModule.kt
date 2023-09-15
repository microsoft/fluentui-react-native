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
import org.threeten.bp.ZoneId
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
                    getLocalZonedDateTimeFromString(startDate),
                    getDuration(startDate, endDate, DateTimePickerDialog.DateRangeMode.values()[dateRangeMode])
            )

            dateTimePickerDialog.onDateTimePickedListener =
                    object : DateTimePickerDialog.OnDateTimePickedListener {
                        override fun onDateTimePicked(pickedDateTime: ZonedDateTime, duration: Duration) {
                            var endDateTime: ZonedDateTime;
                            var startDateTime: ZonedDateTime;
                            when (dateRangeMode) {
                                DateTimePickerDialog.DateRangeMode.START.ordinal,
                                DateTimePickerDialog.DateRangeMode.END.ordinal
                                    -> {
                                    startDateTime = pickedDateTime;
                                    endDateTime = pickedDateTime.plus(duration);
                                }
                                else -> {
                                    startDateTime = pickedDateTime;
                                    endDateTime = pickedDateTime;
                                }
                            }
                            onDateTimePicked.invoke(
                                    formatDate(startDateTime,
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
        val year = selectedDate.year;
        val month = selectedDate.month.value;
        val day = selectedDate.dayOfMonth;
        val hour = selectedDate.hour;
        val minute = selectedDate.minute;
        val second = selectedDate.second;
        val nano = selectedDate.nano;

        val formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");

        if (dialogMode == DateTimePickerDialog.Mode.DATE) {
            val localDate = ZonedDateTime.of(
                    year,
                    month,
                    day,
                    0,
                    0,
                    0,
                    0,
                    ZoneId.systemDefault());
            return formatter.format(localDate.withZoneSameInstant(ZoneOffset.UTC));
        }

        return formatter.format(selectedDate.withZoneSameInstant(ZoneOffset.UTC));
    }

    private fun getDuration(startDate: String?, endDate: String?, dateRangeMode: DateTimePickerDialog.DateRangeMode): Duration {
        if (startDate.isNullOrBlank()
                || endDate.isNullOrBlank()
                || dateRangeMode == DateTimePickerDialog.DateRangeMode.NONE) {
            return Duration.ZERO;
        }

        val zonedStart = getLocalZonedDateTimeFromString(startDate);
        var zonedEnd = getLocalZonedDateTimeFromString(endDate);

        if (zonedEnd < zonedStart) {
            zonedEnd = zonedStart.plusDays(1)
        }

        val duration = Duration.between(zonedStart, zonedEnd);
        return duration;
    }

    private fun getLocalZonedDateTimeFromString(dateTimeString: String?) : ZonedDateTime {
        if (dateTimeString.isNullOrBlank()) {
            return ZonedDateTime.now();
        }

        // expects 'dateTimeString' to be of the format yyyy-MM-ddTHH:mm:ss.SSSZ
        val zonedDateTime: ZonedDateTime = ZonedDateTime.parse(dateTimeString);
        val localDateTime = zonedDateTime.withZoneSameInstant(ZoneId.systemDefault());

        val year = localDateTime.year;
        val month = localDateTime.month.value;
        val day = localDateTime.dayOfMonth;
        val hour = localDateTime.hour;
        val minute = localDateTime.minute;
        val second = localDateTime.second;
        val nano = localDateTime.nano;

        val utcDate = ZonedDateTime.of(
                year,
                month,
                day,
                hour,
                minute,
                second,
                nano,
                ZoneOffset.UTC);

        return utcDate;
    }

    private fun getZonedDateTimeFromString(dateTimeString: String?) : ZonedDateTime {
        if (dateTimeString.isNullOrBlank()) {
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