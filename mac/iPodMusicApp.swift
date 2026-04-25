import Cocoa
import WebKit

struct MusicState: Encodable {
    let running: Bool
    let playerState: String
    let title: String
    let artist: String
    let album: String
    let duration: Double
    let position: Double
    let volume: Int
}

struct MusicTrack: Encodable {
    let persistentID: String
    let title: String
    let artist: String
    let album: String
    let duration: Double
}

struct MusicLibraryPayload: Encodable {
    let tracks: [MusicTrack]
}

final class AppDelegate: NSObject, NSApplicationDelegate, WKScriptMessageHandler {
    private var window: NSWindow!
    private var webView: WKWebView!
    private var stateTimer: Timer?

    func applicationDidFinishLaunching(_ notification: Notification) {
        NSApp.setActivationPolicy(.regular)

        let userContentController = WKUserContentController()
        userContentController.add(self, name: "musicControl")
        userContentController.add(self, name: "haptic")

        let configuration = WKWebViewConfiguration()
        configuration.userContentController = userContentController

        webView = WKWebView(frame: .zero, configuration: configuration)

        window = NSWindow(
            contentRect: NSRect(x: 0, y: 0, width: 390, height: 680),
            styleMask: [.titled, .closable, .miniaturizable, .resizable],
            backing: .buffered,
            defer: false
        )
        window.title = "iPod Music"
        window.contentView = webView
        window.center()
        window.makeKeyAndOrderFront(nil)
        NSApp.activate(ignoringOtherApps: true)

        let indexURL = htmlURL()
        webView.loadFileURL(indexURL, allowingReadAccessTo: indexURL.deletingLastPathComponent())

        stateTimer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { [weak self] _ in
            self?.sendMusicState()
        }
    }

    func applicationWillTerminate(_ notification: Notification) {
        stateTimer?.invalidate()
    }

    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
        true
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        if message.name == "haptic" {
            NSHapticFeedbackManager.defaultPerformer.perform(.alignment, performanceTime: .now)
            return
        }

        guard message.name == "musicControl" else { return }

        let body = message.body as? [String: Any]
        let action = body?["action"] as? String ?? ""
        let value = body?["value"]

        runMusicAction(action, value: value)
    }

    private func htmlURL() -> URL {
        if let bundled = Bundle.main.url(forResource: "index", withExtension: "html") {
            return bundled
        }

        return URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
            .appendingPathComponent("index.html")
    }

    private func runMusicAction(_ action: String, value: Any?) {
        switch action {
        case "playpause":
            runAppleScript("tell application \"Music\" to playpause")
        case "next":
            runAppleScript("tell application \"Music\" to next track")
        case "prev":
            runAppleScript("tell application \"Music\" to previous track")
        case "setVolume":
            let volume = clampInt(value, min: 0, max: 100)
            runAppleScript("tell application \"Music\" to set sound volume to \(volume)")
        case "setPosition":
            let position = max(0, doubleValue(value))
            runAppleScript("tell application \"Music\" to set player position to \(position)")
        case "playTrack":
            guard let persistentID = value as? String else { break }
            playTrack(persistentID: persistentID)
        case "getLibrary":
            sendMusicLibrary()
            return
        case "getState":
            break
        default:
            break
        }

        sendMusicState()
    }

    private func sendMusicState() {
        let state = readMusicState()
        dispatchWebEvent(name: "music-bridge-state", detail: state)
    }

    private func sendMusicLibrary() {
        DispatchQueue.global(qos: .userInitiated).async { [weak self] in
            guard let self else { return }
            let tracks = self.readMusicLibrary(limit: 150)
            let payload = MusicLibraryPayload(tracks: tracks)

            DispatchQueue.main.async { [weak self] in
                self?.dispatchWebEvent(name: "music-bridge-library", detail: payload)
            }
        }
    }

    private func dispatchWebEvent<T: Encodable>(name: String, detail: T) {
        guard
            let data = try? JSONEncoder().encode(detail),
            let json = String(data: data, encoding: .utf8)
        else { return }

        let script = "window.dispatchEvent(new CustomEvent('\(name)', { detail: \(json) }));"
        webView.evaluateJavaScript(script)
    }

    private func playTrack(persistentID: String) {
        let cleanID = persistentID.replacingOccurrences(of: "\"", with: "")
        runAppleScript("""
        tell application "Music"
            set targetTrack to first track of library playlist 1 whose persistent ID is "\(cleanID)"
            play targetTrack
        end tell
        """)
    }

    private func readMusicState() -> MusicState {
        let isRunning = NSWorkspace.shared.runningApplications.contains {
            $0.bundleIdentifier == "com.apple.Music"
        }

        guard isRunning else {
            return MusicState(
                running: false,
                playerState: "not_running",
                title: "",
                artist: "",
                album: "",
                duration: 0,
                position: 0,
                volume: 50
            )
        }

        let output = runAppleScript("""
        tell application "Music"
            set stateName to player state as text
            set playerPos to player position as real
            set musicVolume to sound volume as integer
            set trackName to ""
            set trackArtist to ""
            set trackAlbum to ""
            set trackDuration to 0

            try
                set theTrack to current track
                set trackName to name of theTrack as text
                set trackArtist to artist of theTrack as text
                set trackAlbum to album of theTrack as text
                set trackDuration to duration of theTrack as real
            end try

            return stateName & tab & (playerPos as text) & tab & (musicVolume as text) & tab & trackName & tab & trackArtist & tab & trackAlbum & tab & (trackDuration as text)
        end tell
        """)

        let parts = output.components(separatedBy: "\t")
        guard parts.count >= 7 else {
            return MusicState(
                running: true,
                playerState: "unknown",
                title: "",
                artist: "",
                album: "",
                duration: 0,
                position: 0,
                volume: 50
            )
        }

        return MusicState(
            running: true,
            playerState: parts[0],
            title: parts[3],
            artist: parts[4],
            album: parts[5],
            duration: Double(parts[6]) ?? 0,
            position: Double(parts[1]) ?? 0,
            volume: Int(parts[2]) ?? 50
        )
    }

    private func readMusicLibrary(limit: Int) -> [MusicTrack] {
        let output = runAppleScript("""
        on replaceText(findText, replacementText, sourceText)
            set AppleScript's text item delimiters to findText
            set textItems to text items of sourceText
            set AppleScript's text item delimiters to replacementText
            set cleanText to textItems as text
            set AppleScript's text item delimiters to ""
            return cleanText
        end replaceText

        on cleanField(sourceText)
            try
                set cleanText to sourceText as text
            on error
                set cleanText to ""
            end try

            set cleanText to my replaceText(tab, " ", cleanText)
            set cleanText to my replaceText(return, " ", cleanText)
            set cleanText to my replaceText(linefeed, " ", cleanText)
            return cleanText
        end cleanField

        set fieldSeparator to ASCII character 31
        set rowSeparator to ASCII character 30
        set rows to {}

        tell application "Music"
            set libraryTracks to tracks of library playlist 1
            set trackLimit to \(limit)
            if (count of libraryTracks) < trackLimit then set trackLimit to count of libraryTracks

            repeat with trackIndex from 1 to trackLimit
                set theTrack to item trackIndex of libraryTracks
                set trackID to my cleanField(persistent ID of theTrack)
                set trackName to my cleanField(name of theTrack)
                set trackArtist to my cleanField(artist of theTrack)
                set trackAlbum to my cleanField(album of theTrack)
                set trackDuration to "0"

                try
                    set trackDuration to duration of theTrack as text
                end try

                if trackID is not "" and trackName is not "" then
                    set end of rows to trackID & fieldSeparator & trackName & fieldSeparator & trackArtist & fieldSeparator & trackAlbum & fieldSeparator & trackDuration
                end if
            end repeat
        end tell

        set AppleScript's text item delimiters to rowSeparator
        set outputText to rows as text
        set AppleScript's text item delimiters to ""
        return outputText
        """)

        let fieldSeparator = "\u{1F}"
        let rowSeparator = "\u{1E}"

        return output
            .split(separator: Character(rowSeparator))
            .compactMap { row in
                let fields = row
                    .split(separator: Character(fieldSeparator), omittingEmptySubsequences: false)
                    .map(String.init)

                guard fields.count >= 5 else { return nil }

                return MusicTrack(
                    persistentID: fields[0],
                    title: fields[1],
                    artist: fields[2],
                    album: fields[3],
                    duration: Double(fields[4]) ?? 0
                )
            }
    }

    @discardableResult
    private func runAppleScript(_ source: String) -> String {
        var error: NSDictionary?
        guard let script = NSAppleScript(source: source) else { return "" }
        let descriptor = script.executeAndReturnError(&error)

        if let error {
            NSLog("AppleScript error: \(error)")
        }

        return descriptor.stringValue ?? ""
    }

    private func clampInt(_ value: Any?, min minValue: Int, max maxValue: Int) -> Int {
        let intValue: Int

        if let value = value as? Int {
            intValue = value
        } else if let value = value as? Double {
            intValue = Int(value.rounded())
        } else if let value = value as? String, let parsed = Int(value) {
            intValue = parsed
        } else {
            intValue = minValue
        }

        return min(max(intValue, minValue), maxValue)
    }

    private func doubleValue(_ value: Any?) -> Double {
        if let value = value as? Double {
            return value
        }

        if let value = value as? Int {
            return Double(value)
        }

        if let value = value as? String, let parsed = Double(value) {
            return parsed
        }

        return 0
    }
}

let app = NSApplication.shared
let delegate = AppDelegate()
app.delegate = delegate
app.setActivationPolicy(.regular)
app.run()
