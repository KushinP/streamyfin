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
  /// Takes first responder when nothing else holds it; see `claimIfIdle`.
  /// Made on first install, on the main thread: the shared host itself is
  /// first touched from the JavaScript thread when the module loads, and
  /// UIKit refuses a view built there.
  private lazy var host = KeyCommandHostView()
  private var observers: [NSObjectProtocol] = []

  private func observeIfNeeded() {
    guard observers.isEmpty else { return }
    let center = NotificationCenter.default
    // Back to the host when the app comes forward and when a text field
    // lets go of the keyboard.
    for name in [
      UIApplication.didBecomeActiveNotification,
      UIResponder.keyboardDidHideNotification,
    ] {
      observers.append(
        center.addObserver(forName: name, object: nil, queue: .main) {
          [weak self] _ in self?.claimIfIdle()
        })
    }
  }

  func install(_ commands: [KeyCommandRecord]) {
    dispatchPrecondition(condition: .onQueue(.main))
    observeIfNeeded()
    for command in installed { owner?.removeKeyCommand(command) }
    installed = []
    guard let root = Self.rootViewController() else { return }
    owner = root
    if host.superview !== root.view {
      host.removeFromSuperview()
      root.view.addSubview(host)
    }
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
    if commands.isEmpty {
      host.resignFirstResponder()
    } else {
      claimIfIdle()
    }
  }

  /// UIKit looks for key commands along the responder chain from the first
  /// responder. In React Native nothing is first responder unless a text
  /// field has focus, and then the root view controller is not in the chain,
  /// so the shortcuts would only fire while typing. The host, a subview of
  /// the root's view, puts the root back in the chain. It leaves a text
  /// field's focus alone, and stands back while something is presented over
  /// the app (the native player, a sheet).
  private func claimIfIdle() {
    guard !installed.isEmpty, let root = owner, host.superview != nil,
      root.presentedViewController == nil,
      FirstResponder.current() == nil
    else { return }
    host.becomeFirstResponder()
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

/// An invisible view that can be first responder, so the root view
/// controller's key commands are reachable when nothing else is focused. It
/// has no input view, so holding first responder shows no keyboard.
final class KeyCommandHostView: UIView {
  init() {
    // Zero sized rather than hidden: a hidden view may be refused first
    // responder, and at zero size it draws nothing anyway.
    super.init(frame: .zero)
    isUserInteractionEnabled = false
    isAccessibilityElement = false
  }

  required init?(coder: NSCoder) { nil }

  override var canBecomeFirstResponder: Bool { true }
}

/// Finds the current first responder: an action sent to nil goes to it.
private enum FirstResponder {
  private static weak var found: UIResponder?

  static func current() -> UIResponder? {
    found = nil
    UIApplication.shared.sendAction(
      #selector(UIResponder.superfinReportFirstResponder), to: nil, from: nil,
      for: nil)
    return found
  }

  fileprivate static func report(_ responder: UIResponder) { found = responder }
}

extension UIResponder {
  @objc fileprivate func superfinReportFirstResponder() {
    FirstResponder.report(self)
  }
}
