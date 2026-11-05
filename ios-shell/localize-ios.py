"""Add localized names and privacy permission strings to the generated iOS target."""
from pathlib import Path
import re

resources = Path("ios/App/App")
translations = {
    "en": ('Minipiry', 'Add expiry items by voice.', 'Recognize item names and expiry dates from speech.'),
    "zh-Hans": ('超简到期', '用于通过语音快速添加到期物品。', '用于识别语音中的物品名称和日期。'),
}
for language, (name, microphone, speech) in translations.items():
    folder = resources / f"{language}.lproj"
    folder.mkdir(parents=True, exist_ok=True)
    (folder / "InfoPlist.strings").write_text(
        f'"CFBundleDisplayName" = "{name}";\n'
        f'"NSMicrophoneUsageDescription" = "{microphone}";\n'
        f'"NSSpeechRecognitionUsageDescription" = "{speech}";\n', encoding="utf-8"
    )

project = Path("ios/App/App.xcodeproj/project.pbxproj")
text = project.read_text()
variant_id = "F11111111111111111111110"
build_id = "F11111111111111111111111"
en_id = "F11111111111111111111112"
zh_id = "F11111111111111111111113"
if variant_id not in text:
    text = text.replace("/* End PBXBuildFile section */",
        f'{build_id} /* InfoPlist.strings in Resources */ = {{isa = PBXBuildFile; fileRef = {variant_id} /* InfoPlist.strings */; }};\n/* End PBXBuildFile section */')
    text = text.replace("/* End PBXFileReference section */",
        f'{en_id} /* en */ = {{isa = PBXFileReference; lastKnownFileType = text.plist.strings; name = en; path = en.lproj/InfoPlist.strings; sourceTree = "<group>"; }};\n'
        f'{zh_id} /* zh-Hans */ = {{isa = PBXFileReference; lastKnownFileType = text.plist.strings; name = "zh-Hans"; path = "zh-Hans.lproj/InfoPlist.strings"; sourceTree = "<group>"; }};\n/* End PBXFileReference section */')
    text = text.replace("/* End PBXVariantGroup section */",
        f'{variant_id} /* InfoPlist.strings */ = {{isa = PBXVariantGroup; children = ({en_id}, {zh_id},); name = InfoPlist.strings; sourceTree = "<group>"; }};\n/* End PBXVariantGroup section */')
    text, count = re.subn(r'(isa = PBXResourcesBuildPhase;.*?files = \()',
        r'\1\n' + build_id + ' /* InfoPlist.strings in Resources */,', text, count=1, flags=re.S)
    if count != 1:
        raise RuntimeError("Missing iOS resource build phase")
    text, count = re.subn(r'(/\* App \*/ = \{\s*isa = PBXGroup;\s*children = \()',
        r'\1\n' + variant_id + ' /* InfoPlist.strings */,', text, count=1)
    if count != 1:
        raise RuntimeError("Missing iOS App group")
    text = text.replace('knownRegions = (', 'knownRegions = (\n"zh-Hans",')
    project.write_text(text)