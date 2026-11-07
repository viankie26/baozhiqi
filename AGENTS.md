<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep single and batch calendar export on the same pure ICS serializer so dates, alarms, and escaping stay consistent.
- Batch calendar exports POST caller-supplied records to the same-origin formatter; it must not read account data, persist exports, or put batch names/notes in URLs.
- Expiry push reminders: per-user settings in the database; an hourly managed schedule calls /api/public/jobs/send-reminders, which matches each user's local hour and logs (item, expiry date) so each item is notified once. Push-only service worker at /push-sw.js (no caching).
- Bilingual UI uses the root language provider, initialized after hydration; persist notification language separately without overwriting reminder choices. Calendar requests explicitly carry language to the shared pure serializer.
- Native display names and permission strings are generated as localized iOS resources during cloud packaging so the shell remains one codebase.
- iOS app is a Capacitor shell (capacitor.config.json, ios-shell/) loading the published site via server.url, built and uploaded by .github/workflows/build-ios.yml; keeps one codebase because the app is SSR and has no static export.
- Inside the iOS shell, reminders use native APNs (device tokens in native_push_tokens, sent directly from the reminder job via WebCrypto JWT) instead of web push, because WKWebView can't receive web push; web/PWA keeps web push.
- iOS shell sets capacitor server.errorPath to the bundled ios-shell/index.html, a self-contained bilingual offline/retry page, so failed remote loads never show a blank screen.
