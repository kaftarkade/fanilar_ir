/* Service Worker — اعلان پیام وقتی برنامه بسته یا در پس‌زمینه است */
"use strict";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", event => event.waitUntil(self.clients.claim()));

self.addEventListener("push", event => {
    let data = {};
    try { data = event.data ? event.data.json() : {}; }
    catch (_) { data = { title: "پیام جدید", body: event.data ? event.data.text() : "" }; }

    event.waitUntil((async () => {
        // اگر برنامه همین الان روی صفحه است، اعلان درون‌برنامه‌ای کافی است
        const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
        if (windows.some(w => w.visibilityState === "visible")) return;

        await self.registration.showNotification(data.title || "حلقات صالحین", {
            body: data.body || "",
            tag: data.key || "message",
            renotify: true,
            icon: "icon-192.png",
            badge: "icon-192.png",
            dir: "rtl",
            lang: "fa",
            vibrate: [200, 100, 200],
            data: { url: data.url || "index.html", key: data.key || "" },
            actions: [
                { action: "open", title: "پاسخ" },
                { action: "read", title: "درج به‌عنوان خوانده‌شده" }
            ]
        });
    })());
});

self.addEventListener("notificationclick", event => {
    event.notification.close();

    // «درج به‌عنوان خوانده‌شده»: در پایگاه‌داده ثبت می‌شود و برنامه بعداً اعمالش می‌کند
    if (event.action === "read") {
        const key = event.notification.data && event.notification.data.key;
        if (key) event.waitUntil(markReadLater(key));
        return;
    }

    const target = new URL((event.notification.data && event.notification.data.url) || "index.html",
        self.registration.scope).href;

    event.waitUntil((async () => {
        const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
        for (const client of windows) {
            if ("navigate" in client) { try { await client.navigate(target); } catch (_) {} }
            if ("focus" in client) return client.focus();
        }
        return self.clients.openWindow(target);
    })());
});

function markReadLater(key) {
    return new Promise(resolve => {
        try {
            const open = indexedDB.open("fani", 1);
            open.onupgradeneeded = () => open.result.createObjectStore("read", { keyPath: "key" });
            open.onsuccess = () => {
                const tx = open.result.transaction("read", "readwrite");
                tx.objectStore("read").put({ key, time: Date.now() });
                tx.oncomplete = () => resolve();
                tx.onerror = () => resolve();
            };
            open.onerror = () => resolve();
        } catch (_) { resolve(); }
    });
}
