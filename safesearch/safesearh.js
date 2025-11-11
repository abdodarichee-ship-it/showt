        const input = document.getElementById("safeInput");
        const btn = document.getElementById("safeBtn");

        // التأكد إذا كان المستخدم كتب رابط
        function isURL(text) {
            return text.startsWith("http://") ||
                   text.startsWith("https://") ||
                   text.startsWith("www.");
        }

        // عند الضغط على زر البحث
        btn.addEventListener("click", () => {
            let q = input.value.trim();
            if (q === "") return;

            // إذا كتب رابط → نفتح الرابط مباشرة
            if (isURL(q)) {
                if (!q.startsWith("http")) {
                    q = "https://" + q;
                }
                window.location.href = q;
                return;
            }

            // بحث فعلي في DuckDuckGo
            window.location.href = "https://duckduckgo.com/?q=" + encodeURIComponent(q);
        });

        // عند الضغط على Enter
        input.addEventListener("keydown", e => {
            if (e.key === "Enter") {
                btn.click();
            }
        });




        //=========safesearch==============//



        /*
 حماية الصفحة من الاحتفاظ بالبيانات بعد الخروج
 - يمنع/يحوِّل التخزين الدائم إلى تخزين مؤقت بالذاكرة
 - يمسح الكوكيز و local/session storage و indexedDB و caches
 - يعرّض دوال التخزين ليمنع الكتابة الحقيقية
 - عند التنقل يفتح الرابط عبر location.replace لتقليل سجل التاريخ
 - يشتغل على أحداث beforeunload / pagehide / visibilitychange
*/

// === 1) Helper: مسح الكوكيز الحالية ===
function clearAllCookies() {
    try {
        const cookies = document.cookie.split("; ");
        for (const c of cookies) {
            const eqPos = c.indexOf("=");
            const name = eqPos > -1 ? c.substr(0, eqPos) : c;
            // حذف الكوكيز عبر تعيين تاريخ منتهي ومجال / path عام
            document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=" + location.hostname + "; SameSite=Lax;";
            // محاولة حذف بدون domain
            document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;";
        }
    } catch (e) {
        console.warn("clearAllCookies error:", e);
    }
}

// === 2) تحويل localStorage/sessionStorage لنسخة مؤقتة في الذاكرة (مانع للكتابة الدائمة) ===
(function hijackStorage() {
    try {
        // Maps لتخزين البيانات مؤقتاً داخل الجلسة (في الذاكرة فقط)
        const memoryLocal = new Map();
        const memorySession = new Map();

        // helper لإنشاء واجهة شبيهة بالـ Storage API
        function makeVirtualStorage(map) {
            return {
                getItem(key) { return map.has(key) ? String(map.get(key)) : null; },
                setItem(key, val) { map.set(String(key), String(val)); },
                removeItem(key) { map.delete(String(key)); },
                clear() { map.clear(); },
                key(i) { return Array.from(map.keys())[i] ?? null; },
                get length() { return map.size; }
            };
        }

        // استبدال window.localStorage و window.sessionStorage بنسخ افتراضية
        Object.defineProperty(window, "localStorage", {
            configurable: true,
            enumerable: true,
            get() { return makeVirtualStorage(memoryLocal); }
        });
        Object.defineProperty(window, "sessionStorage", {
            configurable: true,
            enumerable: true,
            get() { return makeVirtualStorage(memorySession); }
        });

        // منع الوصول لتخزين البيانات الحقيقية: نحاول كذلك حذف أي شيء مخزن مسبقاً
        try {
            // إن أمكن، نحاول تنظيف القديم (بعض المتصفحات تمنع الوصول بعد التعديل)
            window.localStorage && window.localStorage.clear && window.localStorage.clear();
            window.sessionStorage && window.sessionStorage.clear && window.sessionStorage.clear();
        } catch(e) {}
    } catch (e) {
        console.warn("hijackStorage failed:", e);
    }
})();

// === 3) مسح IndexedDB (محاولات متعددة لأن API غير موحد) ===
async function clearIndexedDB() {
    try {
        if (indexedDB && indexedDB.databases) {
            // API حديث متوفر في بعض المتصفحات
            const dbs = await indexedDB.databases();
            if (Array.isArray(dbs)) {
                for (const dbInfo of dbs) {
                    if (dbInfo && dbInfo.name) {
                        try { indexedDB.deleteDatabase(dbInfo.name); } catch(e){/* ignore */ }
                    }
                }
            }
        } else {
            // محاولة حذف أسماء شائعة (fallback)
            const commonNames = ["firebaseLocalStorageDb", "idb", "localforage"];
            for (const n of commonNames) {
                try { indexedDB.deleteDatabase(n); } catch(e) {}
            }
        }
    } catch (e) {
        console.warn("clearIndexedDB error:", e);
    }
}

// === 4) مسح Cache Storage (Service Worker caches) ===
async function clearCaches() {
    try {
        if ('caches' in window) {
            const keys = await caches.keys();
            for (const k of keys) {
                try { await caches.delete(k); } catch(e) {}
            }
        }
    } catch(e) {
        console.warn("clearCaches error:", e);
    }
}

// === 5) إلغاء تسجيل أي ServiceWorker لتقليل التخزين الدائم ===
async function unregisterServiceWorkers() {
    try {
        if (navigator.serviceWorker && navigator.serviceWorker.getRegistrations) {
            const regs = await navigator.serviceWorker.getRegistrations();
            for (const r of regs) {
                try { await r.unregister(); } catch(e) {}
            }
        }
    } catch(e) {
        console.warn("unregisterServiceWorkers error:", e);
    }
}

// === 6) تنظيف الـ Cache HTTP عن طريق تغيير الرؤوس (لا يمكن تغييره من JS) ===
// -> نذكّر بأن أفضل طريقة هي ضبط رؤوس HTTP على الخادم: Cache-Control: no-store

// === 7) تنفيذ التنظيف الشامل ===
async function purgeAll() {
    try {
        clearAllCookies();
        // (local/sessionStorage قد تم hijack) لكن ننادي clear لسلامة
        try { window.localStorage.clear(); } catch(e) {}
        try { window.sessionStorage.clear(); } catch(e) {}
        await clearIndexedDB();
        await clearCaches();
        await unregisterServiceWorkers();
    } catch (e) {
        console.warn("purgeAll error:", e);
    }
}

// === 8) تصرفات عند الخروج / الإخفاء / تغيير الرؤية ===
function safeExitHandler(e) {
    // ننفذ تنظيف فوري، ونحاول إرسال إشارة إلى الخادم إن رغبت (غير مخزن)
    purgeAll();

    // محاولة منع المتصفح من حفظ form data — لا ضمان مطلق
    try {
        // بعض المتصفحات تستجيب لإرجاع رسالة في beforeunload، لكن معظمها يتجاهلها
        // نترك هنا لكي يكون لديه تأثير بسيط على بعض المتصفحات القديمة
        // e.preventDefault(); // ليس مطلوبًا
        // returnValue assignment for legacy
        e && (e.returnValue = "");
    } catch (ex) {}
}

// أحداث نستخدمها: pagehide (mobile)، beforeunload، unload، visibilitychange
window.addEventListener("pagehide", safeExitHandler, {capture:true, passive:true});
window.addEventListener("beforeunload", safeExitHandler, {capture:true});
window.addEventListener("unload", safeExitHandler, {capture:true});
document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
        // تنظيف سريع عندما تنتقل الصفحة للخلفية
        purgeAll();
    }
}, {capture:true, passive:true});

// === 9) منع حفظ التاريخ عند التنقل: استخدم location.replace بدلاً من location.href
// نوفّر دالة استدعاء للبحث تستخدِم location.replace لتقليل أثر التاريخ
function safeNavigateTo(url) {
    try {
        // إرسال إشارة راحة للخادم باستخدام sendBeacon (اختياري، لن يخزن في الويب ستور)
        if (navigator.sendBeacon) {
            // إرسال minimal ping أن المستخدم غادر (اختياري)
            try { navigator.sendBeacon("/.visited-ping", ""); } catch(e) {}
        }
    } catch(e){}
    // استخدم replace لتجنب إضافة مدخل جديد في الـ History
    location.replace(url);
}

// === 10) ربط مربع البحث حتى يستخدم التنقل الآمن و يمنع إرسال البيانات مباشرة للـ form/Autofill ===
(function connectSafeSearch() {
    try {
        const input = document.getElementById("safeInput");
        const btn = document.getElementById("safeBtn");

        if (!input) return;

        // خصائص تمنع المتصفح من اقتراح أو حفظ النص
        input.setAttribute("autocomplete", "off");
        input.setAttribute("autocorrect", "off");
        input.setAttribute("autocapitalize", "off");
        input.setAttribute("spellcheck", "false");
        // إلغاء caching للـ value أثناء navigation
        input.value = input.value || "";

        // منع كتابة القيم في أي تخزين دائم من خلال hijack (أعدنا تعريف local/session)

        function doSearchQuery(q) {
            q = (q || "").trim();
            if (!q) return;
            // لو كان رابط، نستخدم replace
            if (/^(https?:\/\/|www\.)/i.test(q)) {
                if (!/^https?:\/\//i.test(q)) q = "https://" + q;
                safeNavigateTo(q);
            } else {
                // بحث فعلي في DuckDuckGo عبر replace
                const url = "https://duckduckgo.com/?q=" + encodeURIComponent(q);
                safeNavigateTo(url);
            }
        }

        if (btn) {
            btn.addEventListener("click", (ev) => {
                ev.preventDefault();
                doSearchQuery(input.value);
            }, {passive:false});
        }

        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                doSearchQuery(input.value);
            }
        }, {passive:false});
    } catch(e) {
        console.warn("connectSafeSearch error:", e);
    }
})();

// === 11) تنظيف دوري طفيف خلال الجلسة (defence in depth) ===
setInterval(() => {
    try {
        clearAllCookies();
        // clear local/session in-memory maps if exist
        try { window.localStorage && window.localStorage.clear && window.localStorage.clear(); } catch(e){}
        try { window.sessionStorage && window.sessionStorage.clear && window.sessionStorage.clear(); } catch(e){}
    } catch(e){}
}, 5000); // كل 5 ثواني تنظيف بسيط

// === 12) اختصار لطلب تنظيف يدوي (يمكن استدعاؤه من console أثناء التطوير) ===
window.__PRIVACY_PURGE_ALL = purgeAll;

// === 13) تحذير للمطور: لا تحفظ بيانات حساسة في JS global إذا أردت الخصوصية التامة ===
console.info("Privacy guard active — best-effort client-side purge enabled.");