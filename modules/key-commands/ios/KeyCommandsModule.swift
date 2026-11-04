import ExpoModulesCore
import UIKit

/// One shortcut as JavaScript describes it.
struct KeyCommandRecord: Record {
  @Field var id: String = ""
  /// A single character, or "escape".
  @Field var input: String = ""
  /// Any of "command", "shift", "option", "control".
  @Field var modifiers: [String] = []
  /// Shown in the iPad shortcut overlay (hold ⌘) and the Mac menu.
  @Field var title: String = ""
}

public class KeyCommandsModule: Module {
  public func definition() -> ModuleDefinition {
    Name("KeyCommands")
    Events("onKeyCommand")

    OnCreate { [weak self] in
      KeyCommandHost.shared.send = { id in
        self?.sendEvent("onKeyCommand", ["id": id])
      }
    }

    OnDestroy {
      DispatchQueue.main.async { KeyCommandHost.shared.install([]) }
    }

    Function("setCommands") { (commands: [KeyCommandRecord]) in
      DispatchQueue.main.async { KeyCommandHost.shared.install(commands) }
    }
  }
}

/// Owns the shortcuts on the root view controller. Every view controller
/// answers the shared action (the extension below), so whichever is first in
/// the responder chain hands it here, wherever the focus is.
final class KeyCommandHost {
  static let shared = KeyCommandHost()

  var send: ((String) -> Void)?
  private var installed: [UIKeyCommand] = []
  private weak var owner: UIViewController?

  func install(_ commands: [KeyCommandRecord]) {
    for command in installed { owner?.removeKeyCommand(command) }
    installed = []
    guard let root = Self.rootViewController() else { return }
    owner = root
    for record in commands {
      let command = UIKeyCommand(
        title: record.title,
        action: #selector(UIViewController.superfinPerformKeyCommand(_:)),
        input: record.input == "escape" ? UIKeyCommand.inputEscape : record.input,
        modifierFlags: Self.flags(record.modifiers),
        propertyList: record.id
      )
      // A ⌘ shortcut the system also knows (⌘F in a text field) still comes
      // to the app.
      command.wantsPriorityOverSystemBehavior = true
      root.addKeyCommand(command)
      installed.append(command)
    }
  }

  func perform(_ command: UIKeyCommand) {
    guard let id = command.propertyList as? String else { return }
    send?(id)
  }

  private static func flags(_ names: [String]) -> UIKeyModifierFlags {
    var flags: UIKeyModifierFlags = []
    for name in names {
      switch name {
      case "command": flags.insert(.command)
      case "shift": flags.insert(.shift)
      case "option": flags.insert(.alternate)
      case "control": flags.insert(.control)
      default: break
      }
    }
    return flags
  }

  private static func rootViewController() -> UIViewController? {
    let windows = UIApplication.shared.connectedScenes
      .compactMap { $0 as? UIWindowScene }
      .flatMap { $0.windows }
    return (windows.first(where: \.isKeyWindow) ?? windows.first)?
      .rootViewController
  }
}

extension UIViewController {
  @objc func superfinPerformKeyCommand(_ sender: UIKeyCommand) {
    KeyCommandHost.shared.perform(sender)
  }
}
