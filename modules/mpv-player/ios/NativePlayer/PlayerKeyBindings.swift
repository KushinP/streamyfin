import Foundation

/// What a hardware key does in the player on an iPad or the Mac.
enum PlayerKeyAction: Equatable {
	case playPause
	case seekBackward
	case seekForward
	case volumeUp
	case volumeDown
	case toggleMute
	case close
}

/// The player's keyboard shortcuts. Foundation only, so the standalone test
/// in `tests/native` can check the map without UIKit.
enum PlayerKeyBindings {
	/// UIKeyCommand's special inputs, spelled out: these are the values of
	/// `UIKeyCommand.inputLeftArrow` and its siblings.
	static let leftArrow = "UIKeyInputLeftArrow"
	static let rightArrow = "UIKeyInputRightArrow"
	static let upArrow = "UIKeyInputUpArrow"
	static let downArrow = "UIKeyInputDownArrow"
	static let escape = "UIKeyInputEscape"

	/// One step of the system volume HUD, so a key press moves it like the
	/// hardware volume buttons do.
	static let volumeStep = 1.0 / 16.0

	struct Binding: Equatable {
		let input: String
		let action: PlayerKeyAction
		/// Shown when ⌘ is held on an iPad and in the Mac's menu bar.
		let title: String
	}

	static let all: [Binding] = [
		Binding(input: " ", action: .playPause, title: "Play or Pause"),
		Binding(input: leftArrow, action: .seekBackward, title: "Skip Back"),
		Binding(input: rightArrow, action: .seekForward, title: "Skip Forward"),
		Binding(input: upArrow, action: .volumeUp, title: "Volume Up"),
		Binding(input: downArrow, action: .volumeDown, title: "Volume Down"),
		Binding(input: "m", action: .toggleMute, title: "Mute"),
		Binding(input: escape, action: .close, title: "Close Player"),
	]

	static func action(for input: String) -> PlayerKeyAction? {
		all.first { $0.input == input.lowercased() || $0.input == input }?.action
	}

	/// The volume after a step up or down, kept inside 0...1.
	static func stepped(volume: Double, up: Bool) -> Double {
		min(max(volume + (up ? volumeStep : -volumeStep), 0), 1)
	}
}
