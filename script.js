// ===== DOM Elements =====
const dobInput = document.getElementById("dob");
const calcBtn = document.getElementById("calcBtn");
const resetBtn = document.getElementById("resetBtn");
const resultBox = document.getElementById("resultBox");
const mainResult = document.getElementById("mainResult");
const lifeStats = document.getElementById("lifeStats");
const birthdayInfo = document.getElementById("birthdayInfo");
const countdown = document.getElementById("countdown");
const error = document.getElementById("error");
const downloadBtn = document.getElementById("downloadBtn");
const shareBtn = document.getElementById("shareBtn");

let countdownInterval;

// ===== Helper =====
function fmt(n) {
  return n.toLocaleString();
}
function throwConfetti() {
  if (window.confetti)
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
}

// ===== Age Calculation =====
async function calculate(showErrors = true) {
  error.textContent = "";
  resultBox.classList.remove("visible");

  const val = dobInput.value;
  if (!val) {
    if (showErrors) error.textContent = "⚠️ Please select your Date of Birth!";
    return false;
  }

  const dob = new Date(val + "T00:00:00");
  const now = new Date();
  if (isNaN(dob.getTime()) || dob > now) {
    if (showErrors) error.textContent = "❌ Invalid or future date!";
    return false;
  }

  // Calculate Age
  let years = now.getFullYear() - dob.getFullYear();
  let months = now.getMonth() - dob.getMonth();
  let days = now.getDate() - dob.getDate();
  if (days < 0) {
    months--;
    days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  const totalMs = now - dob;
  const totalDays = Math.floor(totalMs / (1000 * 60 * 60 * 24));
  const totalHours = Math.floor(totalMs / (1000 * 60 * 60));
  const totalMinutes = Math.floor(totalMs / (1000 * 60));

  mainResult.innerHTML = `🎉 You are <span class="highlight">${years}</span> years, <span class="highlight">${months}</span> months, and <span class="highlight">${days}</span> days old.`;
  lifeStats.innerHTML = `⏳ You've lived around <strong>${fmt(totalDays)}</strong> days (~${fmt(totalHours)} hours / ~${fmt(totalMinutes)} minutes).`;

  let next = new Date(now.getFullYear(), dob.getMonth(), dob.getDate());
  if (next < now) next.setFullYear(next.getFullYear() + 1);

  const diff = next - now;
  const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
  birthdayInfo.innerHTML =
    daysLeft === 0
      ? `🎂 Happy Birthday! 🎉`
      : `🎈 Next birthday in <span class="highlight">${daysLeft}</span> day${daysLeft === 1 ? "" : "s"}.`;

  if (daysLeft === 0) throwConfetti();

  // Countdown
  if (countdownInterval) clearInterval(countdownInterval);
  countdownInterval = setInterval(() => {
    const diffNow = next - new Date();
    if (diffNow <= 0) {
      clearInterval(countdownInterval);
      countdown.textContent = "🎉 It’s your birthday today!";
      throwConfetti();
      return;
    }
    const d = Math.floor(diffNow / (1000 * 60 * 60 * 24));
    const h = Math.floor((diffNow / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diffNow / (1000 * 60)) % 60);
    const s = Math.floor((diffNow / 1000) % 60);
    countdown.textContent = `⏱️ ${d}d : ${h}h : ${m}m : ${s}s`;
  }, 1000);

  resultBox.classList.add("visible");
  localStorage.setItem("lastDOB", val);
  return true;
}

// ===== Buttons =====
calcBtn.addEventListener("click", () => calculate(true));
resetBtn.addEventListener("click", () => {
  dobInput.value = "";
  error.textContent = "";
  resultBox.classList.remove("visible");
  countdown.textContent = "";
  if (countdownInterval) clearInterval(countdownInterval);
  localStorage.removeItem("lastDOB");
});

// ===== PDF Download =====
downloadBtn.addEventListener("click", async () => {
  if (!resultBox.classList.contains("visible")) {
    const ok = await calculate(false);
    if (!ok) {
      alert("Please calculate your age first.");
      return;
    }
  }

  const element = document.createElement("div");
  element.innerHTML = `
  <div style="font-family:Poppins,sans-serif;color:#000;padding:25px;border-radius:10px;background:#fdfbfb;box-shadow:0 0 8px rgba(0,0,0,0.2)">
    <h2 style="color:#6c63ff;text-align:center;">🎂 Smart Age Calculator Report</h2>
    <p>${mainResult.innerText}</p>
    <p>${lifeStats.innerText}</p>
    <p>${birthdayInfo.innerText}</p>
    <p>${countdown.innerText}</p>
  </div>`;
  html2pdf().from(element).save("Age_Calculator_Result.pdf");
});

// ===== Simple Share =====
shareBtn.addEventListener("click", async () => {
  if (!resultBox.classList.contains("visible")) {
    alert("Please calculate your age first!");
    return;
  }

  const shareText = `🎂 My Age Result:\n${mainResult.innerText}\n${lifeStats.innerText}\n${birthdayInfo.innerText}`;
  if (navigator.share) {
    try {
      await navigator.share({
        title: "Smart Age Calculator",
        text: shareText,
      });
    } catch {
      alert("Share canceled.");
    }
  } else {
    navigator.clipboard.writeText(shareText);
    alert("Result copied to clipboard!");
  }
});

// ===== Auto Load Last DOB =====
window.addEventListener("load", () => {
  const last = localStorage.getItem("lastDOB");
  if (last) {
    dobInput.value = last;
    calculate(false);
  }
});
