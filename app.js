const students = [
  {name:"Amelia Carter", initials:"AC", color:"blue", grade:"Grade 8", status:"Active", joined:"Sep 10, 2024"},
  {name:"Ethan Williams", initials:"EW", color:"green", grade:"Grade 6", status:"Active", joined:"Sep 09, 2024"},
  {name:"Sofia Martinez", initials:"SM", color:"orange", grade:"Grade 10", status:"Pending", joined:"Sep 08, 2024"},
  {name:"Noah Thompson", initials:"NT", color:"violet", grade:"Grade 7", status:"Active", joined:"Sep 06, 2024"}
];

const table = document.querySelector("#studentTable");
function renderStudents() {
  table.innerHTML = students.map(s => `<tr><td><div class="student"><span class="avatar ${s.color}">${s.initials}</span>${s.name}</div></td><td>${s.grade}</td><td><span class="status ${s.status.toLowerCase()}">${s.status}</span></td><td>${s.joined}</td></tr>`).join("");
}
renderStudents();

const dashboard = document.querySelector("#dashboardView");
const generic = document.querySelector("#genericView");
const title = document.querySelector("#genericTitle");
const heading = document.querySelector("#genericHeading");
function showView(view) {
  if (view === "dashboard") {
    dashboard.classList.remove("hidden");
    generic.classList.add("hidden");
    return;
  }
  dashboard.classList.add("hidden");
  generic.classList.remove("hidden");
  const label = view === "classes" ? "Classes & Subjects" : view.charAt(0).toUpperCase() + view.slice(1);
  title.textContent = label;
  heading.textContent = `${label} workspace`;
  document.querySelectorAll(".nav-item").forEach(btn => btn.classList.toggle("active", btn.dataset.view === view));
}
document.querySelectorAll("[data-view]").forEach(btn => btn.addEventListener("click", () => {
  showView(btn.dataset.view);
  document.querySelectorAll(".nav-item").forEach(nav => nav.classList.toggle("active", nav.dataset.view === btn.dataset.view));
}));

const modal = document.querySelector("#modal");
function openModal(){ modal.classList.remove("hidden"); document.querySelector("#studentName").focus(); }
function closeModal(){ modal.classList.add("hidden"); }
document.querySelector("#addStudentBtn").addEventListener("click", openModal);
document.querySelector("#quickStudent").addEventListener("click", openModal);
document.querySelector("#closeModal").addEventListener("click", closeModal);
document.querySelector("#cancelModal").addEventListener("click", closeModal);
modal.addEventListener("click", e => { if(e.target === modal) closeModal(); });
document.querySelector("#studentForm").addEventListener("submit", e => {
  e.preventDefault();
  const name = document.querySelector("#studentName").value.trim();
  const grade = document.querySelector("#studentGrade").value;
  const initials = name.split(" ").map(part => part[0]).join("").slice(0,2).toUpperCase();
  students.unshift({name, initials, color:"purple", grade, status:"Active", joined:"Sep 10, 2024"});
  renderStudents(); closeModal(); e.target.reset();
});
document.querySelector("#globalSearch").addEventListener("input", e => {
  const q = e.target.value.toLowerCase();
  document.querySelectorAll("#studentTable tr").forEach(row => row.style.display = row.textContent.toLowerCase().includes(q) ? "" : "none");
});
