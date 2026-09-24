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

// ----- TODAY'S DATES -----
const now = new Date();
const today = now.setHours(0, 0, 0, 0);

function initApp() {
  const dataMissing =
    !localStorage.getItem("name") ||
    !localStorage.getItem("task") ||
    !localStorage.getItem("starts") ||
    !localStorage.getItem("duration");

  calendarView.classList.toggle("hide-me", dataMissing);
  taskForm.classList.toggle("hide-me", !dataMissing);

  if (dataMissing) {
    // document.querySelector("#task_starts").min = new Date()
    //   .toISOString()
    //   .split("T")[0];
    return;
  }

  // ----- STORED DATA+ -----
  const startDateString = localStorage.getItem("starts");
  const startDate = new Date(startDateString);
  const duration = +localStorage.getItem("duration");
  const task = localStorage.getItem("task");
  const name = localStorage.getItem("name");
  const savedCompletions = JSON.parse(
    localStorage.getItem("completions") || "{}",
  );

  document.querySelector("h1").textContent = task;
  document.querySelector(".sml").textContent = `in ${duration} days`;
  document.querySelector(".greet").textContent = `Hello ${name}`;

  calendar.innerHTML = ""; // Clear existing render if any
  let dayCounter = 0;
  let incre = 0;

  while (dayCounter < duration) {
    // ----- THIS MONTH'S DATES -----
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

    main.id = monthIndex;
    main.querySelector("h5").textContent = `${months[monthIndex]} ${year}`;

    // ----- Month Navigation Buttons -----
    main.querySelector(".prev").disabled = incre === 0;
    main.querySelector(".next").disabled = duration - dayCounter <= daysInMonth;

    // ----- It should open the current month when loaded -----
    main.classList.toggle("hide-me", monthIndex !== now.getMonth());

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
          const thisDay = +new Date(year, monthIndex, dateVal);
          input.value = taskKey;
          input.checked = !!savedCompletions[taskKey];
          input.id = `${thisDay}`;
          input.disabled = thisDay > today; //false;
          input.classList.add("tsk");
          input.title = taskKey.replace("_", " ").toUpperCase();
        }
      }
    });

    calendar.appendChild(newTM);
    incre++;
  }

  document.querySelector(".task-day").textContent = document
    .querySelector(`[id = '${today}']`)
    .value.replace("_", " ");

  // Global Navigation Listener
  document.addEventListener("click", (e) => {
    if (e.target.matches(".nav")) {
      e.preventDefault();
      const cals = Array.from(document.querySelectorAll(".calendar-box"));
      let targetIndex = +e.target.closest(".calendar-box").id;
      e.target.matches(".prev") ? targetIndex-- : targetIndex++;
      cals.forEach((el) => {
        el.classList.toggle("hide-me", +el.id !== targetIndex);
      });
    }
  });

  // ----- SAVE INPUT CHANGE -----
  document.addEventListener("change", (e) => {
    if (e.target.value.startsWith("day_")) {
      const currentSaved = JSON.parse(
        localStorage.getItem("completions") || "{}",
      );
      currentSaved[e.target.value] = e.target.checked;
      localStorage.setItem("completions", JSON.stringify(currentSaved));
    }
  });
}

// ----- HANDLE FORM SUBMISSION
taskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const formData = new FormData(taskForm);
  const data = Object.fromEntries(formData.entries());
  data.starts = data.starts.replaceAll("-", "/");

  for (const key in data) {
    localStorage.setItem(key, data[key]);
  }

  taskForm.reset();
  initApp();
});

initApp();
