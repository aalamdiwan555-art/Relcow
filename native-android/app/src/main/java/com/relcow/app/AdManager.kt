package com.relcow.app

import android.content.Context

/**
 * Ad integration seam. Ads are intentionally disabled in the MVP.
 * A future provider must add consent handling, test IDs, and privacy review
 * before changing this flag.
 */
object AdManager {
    const val ADS_ENABLED = false

    fun initialize(context: Context) {
        if (!ADS_ENABLED) return
        // Provider initialization belongs here after consent is implemented.
    }
}