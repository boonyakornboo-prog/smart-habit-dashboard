// ====================== Firebase Config ======================
const firebaseConfig = {
  apiKey: "AIzaSyCUZ7D55o3s62R3Ufs_J87fEOgyhzPi6s8",
  authDomain: "smart-habit-53dbf.firebaseapp.com",
  databaseURL: "https://smart-habit-53dbf-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "smart-habit-53dbf",
  storageBucket: "smart-habit-53dbf.firebasestorage.app",
  messagingSenderId: "887908991576",
  appId: "1:887908991576:web:ea2026c67d22955ccb002d",
  measurementId: "G-LMYYQ2KXZF"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// ====================== ค่ามาตรฐานของแต่ละชนิดสัตว์ ======================
const petStandards = {
  "หนูแฮมสเตอร์": { tempMin: 20, tempMax: 24, humMin: 40, humMax: 60, foodAlert: 30, waterAlert: 40 },
  "หนูตะเภา":     { tempMin: 18, tempMax: 24, humMin: 40, humMax: 70, foodAlert: 35, waterAlert: 45 },
  "กระต่าย":      { tempMin: 16, tempMax: 22, humMin: 40, humMax: 60, foodAlert: 40, waterAlert: 50 },
  "ชินชิล่า":     { tempMin: 16, tempMax: 22, humMin: 30, humMax: 50, foodAlert: 30, waterAlert: 40 },
  "แกสบี้":       { tempMin: 18, tempMax: 24, humMin: 40, humMax: 60, foodAlert: 35, waterAlert: 45 },
  "ชูก้าไรเดอร์": { tempMin: 20, tempMax: 28, humMin: 40, humMax: 60, foodAlert: 30, waterAlert: 40 }
};

// ====================== DOM ======================
const statusBadge = document.getElementById("connectionStatus");
const statusText = document.getElementById("statusText");

function setStatus(type, text) {
  statusBadge.className = "status-badge " + type;
  statusText.textContent = text;
}

// ====================== ดึงข้อมูลเซนเซอร์แบบ Realtime ======================
db.ref("smart_habit/sensors").on("value", (snapshot) => {
  const data = snapshot.val();
  if (!data) return;

  document.getElementById("temperature").textContent = data.temperature?.toFixed(1) ?? "--";
  document.getElementById("humidity").textContent = data.humidity?.toFixed(1) ?? "--";
  
  const water = data.water ?? 0;
  const food = data.food ?? 0;
  
  document.getElementById("water").textContent = water;
  document.getElementById("food").textContent = food;
  document.getElementById("waterBar").style.width = water + "%";
  document.getElementById("foodBar").style.width = food + "%";
  
  document.getElementById("fan").textContent = data.fan || "--";
  document.getElementById("fan").style.color = data.fan === "ON" ? "#16a34a" : "#64748b";
  
  document.getElementById("servo").textContent = data.servo || "--";
  document.getElementById("servo").style.color = data.servo === "OPEN" ? "#dc2626" : "#64748b";
  
  if (data.timestamp) {
    document.getElementById("lastUpdate").textContent = new Date(data.timestamp).toLocaleString("th-TH");
  }
  
  setStatus("online", "ออนไลน์");
}, (error) => {
  console.error(error);
  setStatus("offline", "ออฟไลน์");
});

// ====================== ดึงข้อมูลสัตว์เลี้ยง ======================
db.ref("smart_habit/pet").on("value", (snapshot) => {
  const pet = snapshot.val();
  const infoDiv = document.getElementById("currentPetInfo");
  
  if (!pet || !pet.type) {
    infoDiv.innerHTML = "<p>ยังไม่มีข้อมูลสัตว์เลี้ยง</p>";
    document.getElementById("idealBox").style.display = "none";
    return;
  }

  infoDiv.innerHTML = `
    <p><strong>ชนิด:</strong> ${pet.type}</p>
    <p><strong>ชื่อ:</strong> ${pet.name || "-"}</p>
    <p><strong>วันเกิด:</strong> ${pet.birthdate || "-"}</p>
    <p><strong>น้ำหนัก:</strong> ${pet.weight ? pet.weight + " กรัม" : "-"}</p>
    <p><strong>เพศ:</strong> ${pet.gender || "-"}</p>
  `;

  // แสดงค่ามาตรฐาน
  document.getElementById("idealTemp").textContent = `${pet.ideal_temp_min} - ${pet.ideal_temp_max} °C`;
  document.getElementById("idealHumidity").textContent = `${pet.ideal_humidity_min} - ${pet.ideal_humidity_max} %`;
  document.getElementById("idealFood").textContent = `ต่ำกว่า ${pet.food_alert}%`;
  document.getElementById("idealWater").textContent = `ต่ำกว่า ${pet.water_alert}%`;
  document.getElementById("idealBox").style.display = "block";

  // เติมค่าลงฟอร์มด้วย
  document.getElementById("petType").value = pet.type || "";
  document.getElementById("petName").value = pet.name || "";
  document.getElementById("petBirthdate").value = pet.birthdate || "";
  document.getElementById("petWeight").value = pet.weight || "";
  document.getElementById("petGender").value = pet.gender || "";
});

// ====================== เมื่อเลือกชนิดสัตว์ → ใส่ค่ามาตรฐาน ======================
document.getElementById("petType").addEventListener("change", function() {
  const type = this.value;
  const std = petStandards[type];
  
  if (std) {
    document.getElementById("idealTemp").textContent = `${std.tempMin} - ${std.tempMax} °C`;
    document.getElementById("idealHumidity").textContent = `${std.humMin} - ${std.humMax} %`;
    document.getElementById("idealFood").textContent = `ต่ำกว่า ${std.foodAlert}%`;
    document.getElementById("idealWater").textContent = `ต่ำกว่า ${std.waterAlert}%`;
    document.getElementById("idealBox").style.display = "block";
  } else {
    document.getElementById("idealBox").style.display = "none";
  }
});

// ====================== บันทึกข้อมูลสัตว์เลี้ยง ======================
function savePetData() {
  const type = document.getElementById("petType").value;
  const name = document.getElementById("petName").value.trim();
  const birthdate = document.getElementById("petBirthdate").value;
  const weight = Number(document.getElementById("petWeight").value) || 0;
  const gender = document.getElementById("petGender").value;

  if (!type) {
    alert("กรุณาเลือกชนิดสัตว์เลี้ยง");
    return;
  }

  const std = petStandards[type];

  const petData = {
    type: type,
    name: name,
    birthdate: birthdate,
    weight: weight,
    gender: gender,
    ideal_temp_min: std.tempMin,
    ideal_temp_max: std.tempMax,
    ideal_humidity_min: std.humMin,
    ideal_humidity_max: std.humMax,
    food_alert: std.foodAlert,
    water_alert: std.waterAlert
  };

  db.ref("smart_habit/pet").set(petData)
    .then(() => {
      alert("บันทึกข้อมูลสัตว์เลี้ยงเรียบร้อยแล้ว!");
    })
    .catch((error) => {
      console.error(error);
      alert("เกิดข้อผิดพลาด: " + error.message);
    });
}

// ====================== กล้อง ======================
function reloadCamera() {
  const urlInput = document.getElementById("cameraUrl").value.trim();
  const img = document.getElementById("cameraFeed");
  
  if (!urlInput) {
    alert("กรุณาใส่ URL ของกล้อง");
    return;
  }
  
  let streamUrl = urlInput;
  if (!streamUrl.includes("/stream") && !streamUrl.includes("/capture")) {
    streamUrl = streamUrl.replace(/\/$/, "") + "/stream";
  }
  
  img.src = streamUrl + "?t=" + new Date().getTime();
}

// เริ่มต้น
setStatus("loading", "กำลังเชื่อมต่อ...");