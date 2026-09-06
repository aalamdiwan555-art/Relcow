package com.relcow.app

import android.accessibilityservice.AccessibilityService
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import java.util.Locale

class RelcowAccessibilityService : AccessibilityService() {
    private val store by lazy { RelcowStore(this) }
    private var lastKey = ""
    private var lastDetectedAt = 0L

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event == null || store.autoPaused()) return
        val sourcePackage = event.packageName?.toString() ?: return
        if (sourcePackage == packageName) return

        val visibleText = buildString {
            event.text.forEach { append(' ').append(it) }
            event.contentDescription?.let { append(' ').append(it) }
            append(' ').append(readNodeText(event.source))
        }.lowercase(Locale.US)

        if (!AD_MARKERS.any { visibleText.contains(it) }) return
        val now = System.currentTimeMillis()
        val normalized = visibleText.replace(Regex("\\s+"), " ").trim().take(120)
        val key = "$sourcePackage|$normalized"
        if (key == lastKey && now - lastDetectedAt < 20_000) return

        lastKey = key
        lastDetectedAt = now
        store.record(1, "AUTO_AD", sourcePackage)
    }

    private fun readNodeText(node: AccessibilityNodeInfo?, depth: Int = 0): String {
        if (node == null || depth > 6) return ""
        val result = buildString {
            node.text?.let { append(' ').append(it) }
            node.contentDescription?.let { append(' ').append(it) }
            for (index in 0 until node.childCount) {
                append(' ').append(readNodeText(node.getChild(index), depth + 1))
            }
        }
        return result
    }

    override fun onInterrupt() = Unit

    companion object {
        private val AD_MARKERS = listOf(
            "advertisement",
            "sponsored",
            "promoted",
            "learn more",
            "skip ad",
            "visit advertiser",
            "shop now"
        )
    }
}