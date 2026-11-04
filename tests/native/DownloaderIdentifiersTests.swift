import Foundation

@main
enum DownloaderIdentifiersTests {
    static func main() {
        // What plugins/withDownloadLiveActivity.ts permits for the bundle id.
        let task = DownloaderIdentifiers.continuedProcessingTask(bundleId: "com.kushagra.superfin")
        precondition(task == "com.kushagra.superfin.downloads", "task id \(task)")

        let session = DownloaderIdentifiers.backgroundSession(bundleId: "com.kushagra.superfin")
        precondition(session == "com.kushagra.superfin.backgrounddownloader", "session id \(session)")

        // Built from whichever id the app has, never upstream's.
        let other = DownloaderIdentifiers.continuedProcessingTask(bundleId: "com.example.app")
        precondition(!other.contains("fredrikburmester"), "upstream id leaked: \(other)")

        print("DownloaderIdentifiers: all checks passed")
    }
}
