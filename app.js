// ==============================
//  ใส่ URL ของ Google Apps Script ที่นี่
// ==============================
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec";

// ถ้ายังไม่มี Apps Script ให้ใช้ข้อมูลจำลองก่อน
const USE_MOCK_DATA = true;   // เปลี่ยนเป็น false เมื่อมี Apps Script จริง

// ==============================

const statusBadge = document.getElementById("connectionStatus");
const statusText = document.getElementById("statusText");

function setStatus(type, text) {
  statusBadge.className = "status-badge " + type;
  statusText.textContent = text;
}

function updateUI(data) {
  document.getElementById("temperature").textContent = data.temperature?.toFixed(1) ?? "--";
  document.getElementById("humidity").textContent = data.humidity?.toFixed(1) ?? "--";
  
  const water = data.water ?? 0;
  const food = data.food ?? 0;
  
  document.getElementById("water").textContent = water;
  document.getElementById("food").textContent = food;
  document.getElementById("waterBar").style.width = water + "%";
  document.getElementById("foodBar").style.width = food + "%";
  
  // Fan
  const fanEl = document.getElementById("fan");
  fanEl.textContent = data.fan || "--";
  fanEl.style.color = data.fan === "ON" ? "#16a34a" : "#64748b";
  
  // Servo
  const servoEl = document.getElementById("servo");
  servoEl.textContent = data.servo || "--";
  servoEl.style.color = data.servo === "OPEN" ? "#dc2626" : "#64748b";
  
  // Last update
  if (data.timestamp) {
    const date = new Date(data.timestamp);
    document.getElementById("lastUpdate").textContent = date.toLocaleString("th-TH");
  } else {
    document.getElementById("lastUpdate").textContent = new Date().toLocaleString("th-TH");
  }
}

// ข้อมูลจำลอง (สำหรับทดสอบตอนยังไม่มี Apps Script)
function getMockData() {
  return {
    temperature: 28.5 + Math.random() * 2,
    humidity: 65 + Math.random() * 10,
    water: Math.floor(60 + Math.random() * 30),
    food: Math.floor(40 + Math.random() * 40),
    fan: Math.random() > 0.7 ? "ON" : "OFF",
    servo: Math.random() > 0.85 ? "OPEN" : "CLOSED",
    timestamp: new Date().toISOString()
  };
}

async function fetchData() {
  setStatus("loading", "กำลังอัปเดต...");
  
  try {
    let data;
    
    if (USE_MOCK_DATA) {
      // จำลองการโหลด
      await new Promise(r => setTimeout(r, 600));
      data = getMockData();
    } else {
      const res = await fetch(APPS_SCRIPT_URL + "?action=latest");
      if (!res.ok) throw new Error("Network response was not ok");
      data = await res.json();
    }
    
    updateUI(data);
    setStatus("online", "ออนไลน์");
  } catch (err) {
    console.error(err);
    setStatus("offline", "ออฟไลน์");
  }
}

function openCamera() {
  const url = document.getElementById("cameraUrl").value.trim();
  if (url) {
    window.open(url, "_blank");
  } else {
    alert("กรุณาใส่ URL ของกล้อง ESP32-CAM ก่อน");
  }
}

// เริ่มต้น
fetchData();
setInterval(fetchData, 10000); // อัปเดตทุก 10 วินาที