console.log("app.js loaded");

const taskViewTemplate = document.querySelector("#task-view");
const taskForm = document.querySelector("#task-form");
const calendarView = document.querySelector("#calendar-view");
const calendar = document.querySelector("#calendar");

const months = [
  "JANUARY",
  "FEBRUARY",
  "MARCH",
  "APRIL",
  "MAY",
  "JUNE",
  "JULY",
  "AUGUST",
  "SEPTEMBER",
  "OCTOBER",
  "NOVEMBER",
  "DECEMBER",
];

const numToString = (num) => String(num).padStart(2, "0");

function initApp() {
  const dataMissing =
    !localStorage.getItem("name") ||
    !localStorage.getItem("task") ||
    !localStorage.getItem("starts") ||
    !localStorage.getItem("duration");

  // ----- DISPLAYS/HIDES  EITHER THE CALENDAR OR THE INPUT FORM -----
  // ----- BASED ON AVAILABILITY OF DATA -----
  calendarView.classList.toggle("hide-me", dataMissing);
  taskForm.classList.toggle("hide-me", !dataMissing);

  if (dataMissing) {
    // -- MAKE SURE THE USER CAN'T SELECT A PAST START DATE --
    const todayISO = new Date().toISOString().split("T")[0];
    document.querySelector("#task_starts").min = todayISO;
    return;
  }

  // ----- STORED DATA -----
  const duration = +localStorage.getItem("duration");
  const task = localStorage.getItem("task");
  const name = localStorage.getItem("name");
  const startDateParts = localStorage.getItem("starts").split("-");
  const savedCompletions = JSON.parse(
    localStorage.getItem("completions") || "{}",
  );

  // Construct start date safely using local parameters (Year, Month Index, Day)
  const startDate = new Date(
    +startDateParts[0],
    +startDateParts[1] - 1,
    +startDateParts[2],
  );

  // ----- TODAY'S DATE -----
  const now = new Date();
  const todayTimestamp = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();

  // ----- UPDATE HEADER WITH RELEVANT STORED TEXT -----
  document.querySelector("h1").textContent = task;
  document.querySelector(".sml").textContent = `in ${duration} days`;
  document.querySelector(".greet").textContent = `Hello ${name}`;

  // ----- STARTUP ASSUMPTIONS -----
  let currentDayLabel = "Not Active Today";
  let dayCounter = 0;
  let incre = 0;
  let activeMonthIdx = 0;

  calendar.innerHTML = ""; // Clear view

  while (dayCounter < duration) {
    const currentMonthDate = new Date(
      startDate.getFullYear(),
      startDate.getMonth() + incre,
      1,
    );
    const monthIndex = currentMonthDate.getMonth();
    const year = currentMonthDate.getFullYear();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const wkDayOfDay1 = currentMonthDate.getDay();

    const newTM = taskViewTemplate.content.cloneNode(true);
    const main = newTM.querySelector(".calendar-box");

    // ----- ASSIGN SEQUENTIAL INDEX TO EACH VIEW -----
    // to prevent multi-year & wrap-around ID collisions
    main.dataset.index = incre;
    main.querySelector("h5").textContent = `${months[monthIndex]} ${year}`;

    // ----- TRACK ACTIVE MONTH TO DISPLAY INITIAL VIEW -----
    if (monthIndex === now.getMonth() && year === now.getFullYear()) {
      activeMonthIdx = incre;
    }

    const boxes = main.querySelectorAll(".dt");
    let dateVal = 0;

    boxes.forEach((el, index) => {
      if (index >= wkDayOfDay1 && index < daysInMonth + wkDayOfDay1) {
        dateVal += 1;
        el.prepend(numToString(dateVal)); // --- The date displayed on calendar

        // --- activeStart is the 1st date in each month that falls within the task duration
        const activeStart = incre === 0 ? startDate.getDate() : 1;

        if (dateVal >= activeStart && dayCounter < duration) {
          dayCounter += 1;
          const input = el.querySelector("input");
          const taskKey = `day_${dayCounter}`;
          const cellTimestamp = new Date(year, monthIndex, dateVal).getTime();

          input.value = taskKey;
          input.checked = !!savedCompletions[taskKey];
          input.id = `time-${cellTimestamp}`;
          input.disabled = cellTimestamp > todayTimestamp;
          input.classList.add("tsk");
          input.title = taskKey.replace("_", " ").toUpperCase();

          if (cellTimestamp === todayTimestamp) {
            currentDayLabel = `Day ${dayCounter}`;
          }
        }
      }
    });

    calendar.appendChild(newTM);
    incre++;
  }

  // Set header label safely
  document.querySelector(".task-day").textContent = currentDayLabel;

  // Toggle Visibility & Disable Navigation Buttons
  const cals = [...document.querySelectorAll(".calendar-box")];
  cals.forEach((calBox, idx) => {
    calBox.classList.toggle("hide-me", idx !== activeMonthIdx);
    calBox.querySelector(".prev").disabled = idx === 0;
    calBox.querySelector(".next").disabled = idx === cals.length - 1;
  });
}

// ----- MONTH VIEW NAVIGATION -----
document.addEventListener("click", (e) => {
  if (e.target.matches(".nav")) {
    e.preventDefault();
    const currentBox = e.target.closest(".calendar-box");
    const cals = Array.from(document.querySelectorAll(".calendar-box"));
    const currentIndex = cals.indexOf(currentBox);
    const targetIndex = e.target.classList.contains("prev")
      ? currentIndex - 1
      : currentIndex + 1;

    if (targetIndex >= 0 && targetIndex < cals.length) {
      cals.forEach((el, idx) =>
        el.classList.toggle("hide-me", idx !== targetIndex),
      );
    }
  }
});

// ----- SAVE/UPDATE TASK COMPLETION -----
document.addEventListener("change", (e) => {
  if (e.target.value && e.target.value.startsWith("day_")) {
    const currentSaved = JSON.parse(
      localStorage.getItem("completions") || "{}",
    );
    currentSaved[e.target.value] = e.target.checked;
    localStorage.setItem("completions", JSON.stringify(currentSaved));
  }
});

// ----- HANDLE FORM SUBMISSION -----
taskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const formData = new FormData(taskForm);
  const data = Object.fromEntries(formData.entries());
  for (const key in data) {
    localStorage.setItem(key, data[key]);
  }

  // Clear previous task completion records when starting fresh
  localStorage.removeItem("completions");

  taskForm.reset();
  initApp();
});

initApp();
