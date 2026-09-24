console.log("app.js loaded");

const taskViewTemplate = document.querySelector("#task-view");
const taskForm = document.querySelector("#task-form");
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

const numToString = (num) => String(num).padStart("2", 0);

const weekDayOfMonthDay1 = (date, incre = 0) =>
  new Date(date.getFullYear(), date.getMonth() + incre, 1).getDay();

const monthDays = (date, incre = 0) =>
  new Date(date.getFullYear(), date.getMonth() + 1 + incre, 0).getDate();

const dataMissing =
  !localStorage.getItem("name") ||
  !localStorage.getItem("task") ||
  !localStorage.getItem("starts") ||
  !localStorage.getItem("duration");

calendar.classList.toggle("hide-me", dataMissing);
taskForm.classList.toggle("hide-me", !dataMissing);

if (!dataMissing) {
  const startDateString = localStorage.getItem("starts");
  const startDate = new Date(startDateString);
  const startMonthIndex = startDate.getMonth();
  const duration = +localStorage.getItem("duration");
  let incre = 0;
  let day = 0;

  const viewMonth = (dateString, incre = 0) => {
    const date = new Date(dateString);
    const monthIndex =
      startMonthIndex + incre !== 12 ? startMonthIndex + incre : 1;
    const presentMonthIndex = new Date().getMonth();

    const daysInMonth = monthDays(date, incre);
    const wkDayOfDay1 = weekDayOfMonthDay1(date, incre);

    const newTM = taskViewTemplate.content.cloneNode(true);
    const main = newTM.querySelector(".calendar-box");
    main.id = monthIndex;
    main.querySelector("h5").textContent = months[monthIndex];
    main.querySelector(".prev").disabled = incre === 0;
    main.querySelector(".next").disabled = duration - day < daysInMonth;

    const boxes = main.querySelectorAll(".dt");
    main.classList.toggle("hide-me", monthIndex !== presentMonthIndex);
    let val = 0;

    boxes.forEach((el, index) => {
      if (index >= wkDayOfDay1 && index < daysInMonth + wkDayOfDay1) {
        val += 1;
        el.prepend(numToString(val));
        const activeStart = !incre ? date.getDate() : 1;
        if (val >= activeStart && day < duration) {
          day += 1;
          const input = el.querySelector("input");
          input.value = `Day ${day}`;
          input.disabled = false;
        }
      }
    });
    calendar.appendChild(newTM);
    console.log("incre: ", incre, "days elasped: ", day);
  };

  while (day < duration) {
    viewMonth(startDateString, incre);
    incre++;
  }
  const cals = document.querySelectorAll(".calendar-box");

  document.addEventListener("click", (e) => {
    if (e.target.matches(".nav")) {
      e.preventDefault();
      let targetIndex = +e.target.closest(".calendar-box").id;
      e.target.matches(".prev") ? targetIndex-- : targetIndex++;
      cals.forEach((el) =>
        el.classList.toggle("hide-me", +el.id !== targetIndex),
      );
    }
  });
} else {
  document.querySelector("#task_starts").min = new Date()
    .toISOString()
    .split("T")[0];

  // --- FORM SUBMISSION ---
  taskForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const missingInput = [...document.querySelectorAll(".tsk")].find(
      (el) => !el.value,
    );
    if (missingInput) {
      alert("please fill out every form field correctly");
      return;
    }

    const formData = new FormData(taskForm);
    const data = Object.fromEntries(formData.entries());
    for (const key in data) {
      if (!Object.hasOwn(data, key)) continue;
      localStorage.setItem(key, data[key]);
    }
    taskForm.reset();
  });
}
