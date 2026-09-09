import ExpoModulesCore
import UIKit

public class PulseCoreModule: Module {
  public func definition() -> ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module.
    Name("PulseCore")

    // Synchronous native haptic function using JSI under the hood
    Function("playHaptic") { (styleName: String) in
      #if os(iOS)
      DispatchQueue.main.async {
        let style: UIImpactFeedbackGenerator.FeedbackStyle
        switch styleName {
        case "light":
          style = .light
        case "heavy":
          style = .heavy
        case "rigid":
          if #available(iOS 13.0, *) { style = .rigid } else { style = .heavy }
        case "soft":
          if #available(iOS 13.0, *) { style = .soft } else { style = .light }
        default:
          style = .medium
        }
        
        let generator = UIImpactFeedbackGenerator(style: style)
        generator.prepare()
        generator.impactOccurred()
      }
      #endif
    }
  }
}
