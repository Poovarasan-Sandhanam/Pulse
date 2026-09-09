package com.pulse.trading.pulsecore

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import android.os.Vibrator
import android.content.Context
import android.os.VibrationEffect
import android.os.Build

class PulseCoreModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("PulseCore")

    Function("playHaptic") { styleName: String ->
      val vibrator = appContext.reactContext?.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
      if (vibrator != null && vibrator.hasVibrator()) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
          val effect = when (styleName) {
            "light" -> VibrationEffect.createPredefined(VibrationEffect.EFFECT_TICK)
            "heavy" -> VibrationEffect.createPredefined(VibrationEffect.EFFECT_HEAVY_CLICK)
            "rigid" -> VibrationEffect.createPredefined(VibrationEffect.EFFECT_DOUBLE_CLICK)
            else -> VibrationEffect.createPredefined(VibrationEffect.EFFECT_CLICK)
          }
          vibrator.vibrate(effect)
        } else {
          val duration = when (styleName) {
            "light" -> 10L
            "heavy" -> 30L
            "rigid" -> 50L
            else -> 20L
          }
          vibrator.vibrate(duration)
        }
      }
    }
  }
}
