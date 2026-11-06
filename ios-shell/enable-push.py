"""Enable the Push Notifications capability and forward APNs tokens to Capacitor."""
from pathlib import Path
import re

app = Path("ios/App/App")
ent = app / "App.entitlements"
ent.write_text('<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n<plist version="1.0"><dict><key>aps-environment</key><string>production</string></dict></plist>\n')

proj = Path("ios/App/App.xcodeproj/project.pbxproj")
t = proj.read_text()
if "CODE_SIGN_ENTITLEMENTS" not in t:
    t = re.sub(r'(INFOPLIST_FILE = App/Info.plist;)', r'\1\n\t\t\t\tCODE_SIGN_ENTITLEMENTS = App/App.entitlements;', t)
    proj.write_text(t)

delegate = app / "AppDelegate.swift"
d = delegate.read_text()
if "didRegisterForRemoteNotificationsWithDeviceToken" not in d:
    hook = '''
    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        NotificationCenter.default.post(name: .capacitorDidRegisterForRemoteNotifications, object: deviceToken)
    }

    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
        NotificationCenter.default.post(name: .capacitorDidFailToRegisterForRemoteNotifications, object: error)
    }
'''
    i = d.rfind("}")
    delegate.write_text(d[:i] + hook + d[i:])
