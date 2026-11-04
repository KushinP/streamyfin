/// Who still holds the shared audio session, kept apart from
/// `PlayerAudioSession` so it can be checked without `AVAudioSession`
/// (`tests/native/AudioSessionHoldersTests.swift`).
///
/// Several players hold it at once in multiview. The session is given up only
/// when the last of them lets go, and a holder letting go twice, or one that
/// never took it, changes nothing.
struct AudioSessionHolders {
	private var holders = Set<ObjectIdentifier>()

	mutating func take(_ holder: ObjectIdentifier) {
		holders.insert(holder)
	}

	/// Lets `holder` go. True when no holder is left, so the session can be
	/// torn down; false while another still plays, or when `holder` had none.
	mutating func release(_ holder: ObjectIdentifier) -> Bool {
		guard holders.remove(holder) != nil else { return false }
		return holders.isEmpty
	}
}
