import { onAuthStateChanged, signOut, auth } from "./src/scripts/authService.js";

document.addEventListener("DOMContentLoaded", () => {
  const emailElem = document.getElementById("user-email");
  const dropdown = document.getElementById("user-dropdown");
  const logoutBtn = document.getElementById("logout-btn");

  dropdown.style.display = "none";

  onAuthStateChanged(auth, (user) => { // ใช้ auth ที่ import ตรงไปเลย
    if (user) {
      emailElem.textContent = user.email;
      emailElem.style.display = "inline-block";
    } else {
      emailElem.textContent = "Myaccount";
    }
  });

  emailElem.onclick = () => {
    dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
  };

  logoutBtn.onclick = async () => {
    await signOut();
    console.log('logout click');
    window.location.href = "login.html";
  };

  document.addEventListener("click", (e) => {
    if (!emailElem.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.style.display = "none";
    }
  });
});