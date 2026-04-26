import Cocoa
import WebKit

final class AppDelegate: NSObject, NSApplicationDelegate {
    private var window: NSWindow!

    func applicationDidFinishLaunching(_ notification: Notification) {
        let webView = WKWebView(frame: .zero)
        webView.translatesAutoresizingMaskIntoConstraints = false

        let rect = NSRect(x: 0, y: 0, width: 480, height: 820)
        window = NSWindow(
            contentRect: rect,
            styleMask: [.titled, .closable, .miniaturizable, .resizable],
            backing: .buffered,
            defer: false
        )

        window.title = "iPod Classic Simulator"
        window.center()
        window.contentView = NSView(frame: rect)
        window.contentView?.addSubview(webView)

        NSLayoutConstraint.activate([
            webView.leadingAnchor.constraint(equalTo: window.contentView!.leadingAnchor),
            webView.trailingAnchor.constraint(equalTo: window.contentView!.trailingAnchor),
            webView.topAnchor.constraint(equalTo: window.contentView!.topAnchor),
            webView.bottomAnchor.constraint(equalTo: window.contentView!.bottomAnchor)
        ])

        if let appRoot = Bundle.main.resourceURL,
           let indexURL = URL(string: "index.html", relativeTo: appRoot) {
            webView.loadFileURL(indexURL, allowingReadAccessTo: appRoot)
        }

        window.makeKeyAndOrderFront(nil)
        NSApp.activate(ignoringOtherApps: true)
    }
}

let app = NSApplication.shared
let delegate = AppDelegate()
app.delegate = delegate
app.setActivationPolicy(.regular)
app.run()
