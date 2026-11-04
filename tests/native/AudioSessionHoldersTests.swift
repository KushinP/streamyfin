import Foundation

final class Engine {}

@main
enum AudioSessionHoldersTests {
    static func main() {
        // Kept alive, as a player is while it holds the session: a freed
        // object's address, and so its identifier, can be handed out again.
        let engineA = Engine()
        let engineB = Engine()
        let tileA = ObjectIdentifier(engineA)
        let tileB = ObjectIdentifier(engineB)
        defer { withExtendedLifetime((engineA, engineB)) {} }

        // One player: letting go gives the session up.
        var single = AudioSessionHolders()
        single.take(tileA)
        precondition(single.release(tileA), "the last holder should give the session up")

        // Multiview: closing one tile must leave the session to the other.
        var multi = AudioSessionHolders()
        multi.take(tileA)
        multi.take(tileB)
        precondition(!multi.release(tileA), "a tile closing took the session from the one still playing")
        precondition(multi.release(tileB), "the last tile closing should give the session up")

        // Activations come on every play: taking twice is still one holder.
        var replays = AudioSessionHolders()
        replays.take(tileA)
        replays.take(tileA)
        precondition(replays.release(tileA), "one holder, however many plays")

        // A late teardown from a player that no longer holds it (a host's
        // deferred deinit) must not end a newer player's session.
        var late = AudioSessionHolders()
        late.take(tileB)
        precondition(!late.release(tileA), "a stale teardown ended another player's session")
        precondition(!late.release(tileA), "releasing twice changed something")

        print("AudioSessionHolders: all checks passed")
    }
}
