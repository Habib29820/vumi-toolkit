function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  
  var action = e.parameter.action;
  var userId = e.parameter.userid;
  var pass = e.parameter.password;
  var deviceId = e.parameter.deviceid;
  
  var result = {
    success: false,
    message: "ইউজার আইডি বা পাসওয়ার্ড ভুল!"
  };
  
  // ✅ নতুন Action: getDeviceId (সব domain এ same ID দেবে)
  if (action == "getDeviceId") {
    var userRow = findUserRow(data, userId);
    if (userRow !== -1) {
      var savedDeviceId = data[userRow][3]; // Column D = HW-ID
      if (!savedDeviceId || savedDeviceId === "") {
        // নতুন unique ID তৈরি করুন
        var newDeviceId = "VMT-" + Utilities.getUuid().substring(0, 12);
        sheet.getRange(userRow + 1, 4).setValue(newDeviceId);
        result.success = true;
        result.deviceId = newDeviceId;
        result.message = "নতুন Device ID তৈরি হয়েছে";
      } else {
        // আগের ID return করুন
        result.success = true;
        result.deviceId = savedDeviceId;
        result.message = "আপনার Device ID";
      }
    } else {
      result.success = false;
      result.message = "ইউজার খুঁজে পাওয়া যায়নি";
    }
    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
  }
  
  // পুরনো Code (অপরিবর্তিত)
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] == userId) {
      
      // Live Status Verify (Background Check)
      if (action == "verify") {
        if (data[i][2] == "Active" && data[i][3] == deviceId) {
          result.success = true;
          result.message = "Active";
        } else {
          result.success = false;
          result.message = "Banned or Device Mismatch";
        }
        break;
      }
      
      // Regular Login
      if (data[i][1] == pass) {
        if (data[i][2] == "Active") {
          var savedDeviceId = data[i][3];
          if (!savedDeviceId || savedDeviceId === "") {
            sheet.getRange(i + 1, 4).setValue(deviceId);
            result.success = true;
            result.message = "লগইন সফল! আপনার ডিভাইসটি লক করা হয়েছে।";
          } else if (savedDeviceId === deviceId) {
            result.success = true;
            result.message = "লগইন সফল!";
          } else {
            result.success = false;
            result.message = "এই আইডিটি অন্য ডিভাইসে লক করা আছে! শেয়ার করা সম্পূর্ণ নিষেধ।";
          }
        } else {
          result.success = false;
          result.message = "আপনার একাউন্ট ব্যান করা হয়েছে! অ্যাডমিনের সাথে যোগাযোগ করুন।";
        }
        break;
      }
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}

// ✅ Helper function: User খুঁজে বের করা
function findUserRow(data, userId) {
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] == userId) {
      return i;
    }
  }
  return -1;
}
