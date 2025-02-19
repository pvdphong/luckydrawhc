const canvas = document.getElementById("wheelCanvas");
const ctx = canvas.getContext("2d");
const spinButton = document.getElementById("spinButton");
const nameListTextArea = document.getElementById("nameList");
const addNamesButton = document.getElementById("addNamesButton");
const prizeCountInput = document.getElementById("prizeCount");
const winnerList = document.getElementById("winnerList");
const popup = document.getElementById("popup");
const closePopupButton = document.getElementById("closePopup");
const removePopupButton = document.getElementById("removePopup");
const popupContent = document.getElementById("popupContent");
const exportButton = document.getElementById("exportButton");
const personCountInput = document.getElementById('person-count');
const personCountInputStart = document.getElementById('person-count-start');

const wheelColors = [
  "#FF5733",
  "#33FF57",
  "#3357FF",
  "#FF33A1",
  "#FF8C33",
  "#33FFDA",
  "#B833FF",
  "#FFC733",
]; // Tối đa 8 màu

let participants = [];
let winners = [];

let names = ["Phong😎", "Hảo", "Khoa", "Thống", "My", "Trung"]; // Tên mặc định
let currentAngle = 0;
let spinTimeout;
let isSpinning = false;
let speed = Math.PI / 30;
let winnerListFragment = new DocumentFragment(); // Tạo document fragment để tối ưu việc thêm DOM
let allWinners = [];

// Thêm tên từ ô nhập liệu
function addNames() {
  const nameInput = nameListTextArea.value.trim();
  if (nameInput) {
    names = nameInput
      .split("\n")
      .map((name) => name.trim())
      .filter((name) => name);
    drawWheel();
  }
  updatePersonCountStart();
}

// Vẽ vòng quay
function drawWheel() {
  const maxSlices = 60; // Giới hạn số lượng mảnh tối đa
  const numberOfSlices = Math.min(names.length, maxSlices); // Lấy số lượng mảnh nhỏ hơn giữa names.length và maxSlices
  const sliceAngle = (2 * Math.PI) / numberOfSlices;

  // Tạo canvas chỉ 1 lần với dữ liệu hiện tại để giảm việc vẽ lại
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < numberOfSlices; i++) {
    const angle = i * sliceAngle;
    ctx.beginPath();
    ctx.moveTo(250, 250);
    ctx.arc(250, 250, 250, angle, angle + sliceAngle);
    ctx.closePath();

    const colors = [
      "#ff6b6b",
      "#4dabf7",
      "#ffd93d",
      "#6bcb77",
      "#ff6f91",
      "#ab83e6",
      "#ff9f00",
      "#4d4d4d",
    ];
    ctx.fillStyle = colors[i % colors.length];
    ctx.fill();

    ctx.save();
    ctx.translate(250, 250);
    ctx.rotate(angle + sliceAngle / 2);
    ctx.fillStyle = "white";
    ctx.font = `${Math.min(300 / numberOfSlices, 20)}px Arial`; // Tự động điều chỉnh kích cỡ chữ
    ctx.textAlign = "center";
    ctx.fillText(names[i], 150, 10);
    ctx.restore();
  }
}

// Xoay vòng quay
function rotateWheel() {
  if (speed > 0.001) {
    speed *= 0.99;
  } else {
    cancelAnimationFrame(spinTimeout);
    return;
  }

  currentAngle += speed;
  ctx.save();
  ctx.translate(250, 250);
  ctx.rotate(currentAngle);
  ctx.translate(-250, -250);
  drawWheel();
  ctx.restore();

  spinTimeout = requestAnimationFrame(rotateWheel);
}

// Quay vòng và chọn người thắng
function spin() {
  if (isSpinning || names.length === 0) return;
  isSpinning = true;
  speed = Math.PI / 30;
  // let spinTime = Math.random() * 5000 + 4000;

  // Thiết lập thời gian tối thiểu và tối đa
  const minSpinTime = 7000; // 7 giây
  const maxSpinTime = 18000; // 18 giây

  // Tính toán spinTime dựa trên số lượng tên
  let spinTime = Math.max(
    minSpinTime,
    Math.min(maxSpinTime, names.length * prizeCountInput.value * 5)
  ); // Điều chỉnh theo số lượng tên

  // Thêm âm thanh quay
  const spinSound = new Audio("sound/ca_sale.mp3"); // Thay đổi đường dẫn tới tệp âm thanh của bạn
  spinSound.play();

//   spinButton.disabled = true;
//   addNamesButton.disabled = true;

  rotateWheel();

  setTimeout(() => {
    cancelAnimationFrame(spinTimeout);
    isSpinning = false;

    // spinButton.disabled = false;
    // addNamesButton.disabled = false;

    // Dừng âm thanh quay
    spinSound.pause(); // Dừng âm thanh
    spinSound.currentTime = 0; // Đặt lại thời gian phát về 0

    winners = [];

    let numberOfPrizes = Math.min(
      Math.max(parseInt(prizeCountInput.value, 10), 1),
      names.length
    );

    const numberOfSlices = names.length;
    const sliceAngle = (2 * Math.PI) / numberOfSlices;

    for (let i = 0; i < numberOfPrizes; i++) {
      let randomIndex =
        Math.floor((currentAngle + Math.random() * 2 * Math.PI) / sliceAngle) %
        numberOfSlices;
      while (winners.includes(names[randomIndex])) {
        randomIndex = Math.floor(Math.random() * numberOfSlices); // Tránh trùng người thắng
      }
      winners.push(names[randomIndex]);
    }

    updateWinnerList(winners);
    showPopup(winners);
  }, spinTime);
}

// Show the popup with results
function showPopup(winners) {
  const popupContent = document.getElementById("popupContent");
  popupContent.innerHTML = ""; // Clear old results

  // Thêm âm thanh quay
  const spinSound = new Audio("sound/success.mp3"); // Thay đổi đường dẫn tới tệp âm thanh của bạn
  spinSound.play();

  winners.forEach((winner) => {
    const listItem = document.createElement("li");
    listItem.textContent = winner;
    popupContent.appendChild(listItem);
  });

  const popup = document.getElementById("popup");
  popup.style.display = "block"; // Show the popup
}

// Close the popup
function closePopup() {
  const popup = document.getElementById("popup");
  popup.style.display = "none"; // Hide the popup
}

// Cập nhật danh sách người thắng trong giao diện
function updateWinnerList(winners) {
  // winnerList.innerHTML = '';
  winnerListFragment = new DocumentFragment();

  winners.forEach((winner) => {
    allWinners.push(winner); // Thêm vào mảng tổng

    const winnerItem = document.createElement("li");
    winnerItem.textContent = winner;
    winnerListFragment.appendChild(winnerItem);
  });

  updatePersonCount();

  winnerList.appendChild(winnerListFragment);
}

// Xóa người thắng khỏi danh sách và vẽ lại vòng quay
function removeWinners() {
  winners.forEach((winner) => {
    const index = names.indexOf(winner);
    if (index !== -1) {
      names.splice(index, 1);
    }
  });

  drawWheel();
  closePopup();
  updatePersonCountStart();
}

// Xuất danh sách người thắng ra file Excel
function exportWinners() {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(
    [["Danh sách nhận thưởng"]].concat(allWinners.map((winner) => [winner]))
  );
  XLSX.utils.book_append_sheet(workbook, worksheet, "Winners");
  XLSX.writeFile(workbook, "winners.xlsx");
}

// Hàm cập nhật số lượng người
function updatePersonCount() {
  personCountInput.value = allWinners.length;
}

// Hàm cập nhật số lượng người
function updatePersonCountStart() {
    personCountInputStart.value = names.length;
  }

// Khởi tạo ban đầu
drawWheel();

document
  .getElementById("clearWinnersButton")
  .addEventListener("click", function () {
    const winnerList = document.getElementById("winnerList");
    allWinners = [];
    winnerList.innerHTML = ""; // Clear all list items
    updatePersonCount();
  });

document.getElementById("closePopup").addEventListener("click", closePopup);
// Event listener
spinButton.addEventListener("click", spin);
addNamesButton.addEventListener("click", addNames);
// closePopupButton.addEventListener("click", closePopup);
removePopupButton.addEventListener("click", removeWinners);
exportButton.addEventListener("click", exportWinners);
