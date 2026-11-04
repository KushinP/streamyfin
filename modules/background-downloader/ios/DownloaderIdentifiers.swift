import Foundation

/// System identifiers the downloader registers, built from the app's own
/// bundle id. They used to be written out for upstream Streamyfin's id, so a
/// build under another id (this fork, SuperFin) asked iOS 26 for a continued
/// processing task the Info.plist does not permit, which crashes the app.
///
/// The task id must match what `plugins/withDownloadLiveActivity.ts` declares
/// in `BGTaskSchedulerPermittedIdentifiers`: `<bundleId>.downloads`.
/// Checked by `tests/native/DownloaderIdentifiersTests.swift`.
enum DownloaderIdentifiers {
	static func continuedProcessingTask(bundleId: String) -> String {
		"\(bundleId).downloads"
	}

	/// The background URLSession, which the app delegate also has to recognize
	/// when iOS relaunches the app to deliver its events.
	static func backgroundSession(bundleId: String) -> String {
		"\(bundleId).backgrounddownloader"
	}

	static var bundleId: String {
		Bundle.main.bundleIdentifier ?? "com.kushagra.superfin"
	}

	static var continuedProcessingTask: String {
		continuedProcessingTask(bundleId: bundleId)
	}

	static var backgroundSession: String {
		backgroundSession(bundleId: bundleId)
	}
}
