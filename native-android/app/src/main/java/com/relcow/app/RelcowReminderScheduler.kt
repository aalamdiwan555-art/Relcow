package com.relcow.app

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import java.util.Calendar

object RelcowReminderScheduler {
    private const val REQUEST_CODE = 4202

    fun setEnabled(context: Context, enabled: Boolean) {
        val alarmManager = context.getSystemService(AlarmManager::class.java)
        val intent = Intent(context, RelcowReminderReceiver::class.java)
        val pendingIntent = PendingIntent.getBroadcast(
            context,
            REQUEST_CODE,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        if (!enabled) {
            alarmManager.cancel(pendingIntent)
            return
        }
        val firstReminder = Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, 20)
            set(Calendar.MINUTE, 0)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
            if (timeInMillis <= System.currentTimeMillis()) add(Calendar.DAY_OF_YEAR, 1)
        }
        alarmManager.setInexactRepeating(
            AlarmManager.RTC_WAKEUP,
            firstReminder.timeInMillis,
            AlarmManager.INTERVAL_DAY,
            pendingIntent
        )
    }
}