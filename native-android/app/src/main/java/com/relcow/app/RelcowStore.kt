package com.relcow.app

import android.content.Context
import android.provider.Settings
import org.json.JSONArray
import org.json.JSONObject
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.util.Locale

data class ReelEvent(
    val date: String,
    val timestamp: Long,
    val amount: Int,
    val source: String,
    val packageName: String?
)

data class RelcowStats(
    val today: Int,
    val week: Int,
    val month: Int,
    val allTime: Int,
    val xp: Int,
    val level: Int,
    val events: List<ReelEvent>
)

class RelcowStore(context: Context) {
    private val prefs = context.getSharedPreferences("relcow_state", Context.MODE_PRIVATE)
    private val dateFormatter = DateTimeFormatter.ISO_LOCAL_DATE

    fun profileName(): String = prefs.getString("profile_name", "") ?: ""

    fun dailyGoal(): Int = prefs.getInt("daily_goal", 50)

    fun saveProfile(name: String, goal: Int) {
        prefs.edit()
            .putString("profile_name", name.trim())
            .putInt("daily_goal", goal.coerceIn(1, 9999))
            .apply()
    }

    fun isDarkTheme(): Boolean = prefs.getBoolean("dark_theme", true)

    fun setDarkTheme(enabled: Boolean) {
        prefs.edit().putBoolean("dark_theme", enabled).apply()
    }

    fun hapticsEnabled(): Boolean = prefs.getBoolean("haptics", true)

    fun setHapticsEnabled(enabled: Boolean) {
        prefs.edit().putBoolean("haptics", enabled).apply()
    }

    fun reducedMotion(): Boolean = prefs.getBoolean("reduced_motion", false)

    fun setReducedMotion(enabled: Boolean) {
        prefs.edit().putBoolean("reduced_motion", enabled).apply()
    }

    fun autoPaused(): Boolean = prefs.getBoolean("auto_paused", false)

    fun setAutoPaused(paused: Boolean) {
        prefs.edit().putBoolean("auto_paused", paused).apply()
    }

    fun record(amount: Int, source: String, packageName: String? = null) {
        val events = eventsJson()
        events.put(
            JSONObject()
                .put("date", LocalDate.now().format(dateFormatter))
                .put("timestamp", System.currentTimeMillis())
                .put("amount", amount)
                .put("source", source)
                .put("packageName", packageName ?: JSONObject.NULL)
        )
        prefs.edit().putString("events", events.toString()).apply()
    }

    fun undoLast() {
        val events = eventsJson()
        if (events.length() == 0) return
        events.remove(events.length() - 1)
        prefs.edit().putString("events", events.toString()).apply()
    }

    fun stats(): RelcowStats {
        val events = readEvents()
        val today = LocalDate.now()
        val weekStart = today.minusDays(6)
        val monthStart = today.minusDays(29)
        val todayCount = events.filter { LocalDate.parse(it.date) == today }.sumOf { it.amount }
        val weekCount = events.filter { !LocalDate.parse(it.date).isBefore(weekStart) }.sumOf { it.amount }
        val monthCount = events.filter { !LocalDate.parse(it.date).isBefore(monthStart) }.sumOf { it.amount }
        val allTime = events.sumOf { it.amount }
        val xp = allTime * 10
        return RelcowStats(
            today = todayCount,
            week = weekCount,
            month = monthCount,
            allTime = allTime,
            xp = xp,
            level = (xp / 100) + 1,
            events = events
        )
    }

    fun shareCode(): String {
        val existing = prefs.getString("share_code", null)
        if (existing != null) return existing
        val prefix = profileName().take(2).uppercase(Locale.US).padEnd(2, 'R')
        val code = "$prefix-${(1000..9999).random()}"
        prefs.edit().putString("share_code", code).apply()
        return code
    }

    fun reset() {
        prefs.edit().clear().apply()
    }

    fun isAccessibilityEnabled(context: Context): Boolean {
        val enabled = Settings.Secure.getString(
            context.contentResolver,
            Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
        ) ?: return false
        return enabled.split(':').any {
            it.equals("${context.packageName}/.RelcowAccessibilityService", true) ||
                it.equals("${context.packageName}/${context.packageName}.RelcowAccessibilityService", true)
        }
    }

    private fun eventsJson(): JSONArray =
        JSONArray(prefs.getString("events", "[]") ?: "[]")

    private fun readEvents(): List<ReelEvent> {
        val events = eventsJson()
        return buildList {
            for (index in 0 until events.length()) {
                val item = events.optJSONObject(index) ?: continue
                add(
                    ReelEvent(
                        date = item.optString("date"),
                        timestamp = item.optLong("timestamp"),
                        amount = item.optInt("amount"),
                        source = item.optString("source", "MANUAL"),
                        packageName = item.optString("packageName").takeIf { it.isNotBlank() && it != "null" }
                    )
                )
            }
        }
    }
}