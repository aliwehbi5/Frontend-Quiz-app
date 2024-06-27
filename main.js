const toggleThumb = document.querySelector(".toggle-thumb");
const toggleDiv = document.querySelector(".toggle");
const toggleImgs = document.querySelectorAll(".mode > img");
const categories = document.querySelectorAll(".category");
const header = document.querySelector("header");
const section = document.querySelector("section");
const title = document.querySelector("h1.title");
const leftPart = document.querySelector(".left");
const rightPart = document.querySelector(".right");
const p = document.querySelector(".subtitle");
const letters = ["A", "B", "C", "D"];
let counter = 0;
let submit = document.createElement("button");
let correctAnswers = 0;
let selectedCategory;
let question;
let progressBar;
let answers;
let randomNumber;
let randomNumbers = [];

toggleDiv.addEventListener("click", () => {
  changeMode();
});

toggleImgs.forEach((img) => {
  img.addEventListener("click", () => {
    changeMode();
  });
});

categories.forEach((category) => {
  category.addEventListener("click", () => {
    selectedCategory = category;
    generateBasics(category, category.id);
  });
});

function changeMode() {
  document.documentElement.classList.toggle("light-mode");
  localStorage.setItem("mode", document.documentElement.className);
}

function generateBasics(category, id) {
  let logodiv = document.createElement("div");
  logodiv.classList.add("logo");
  logodiv.innerHTML = category.innerHTML;
  header.appendChild(logodiv);
  title.remove();
  question = document.createElement("h1");
  question.classList.add("question");
  leftPart.appendChild(question);
  let progessDiv = document.createElement("div");
  progressBar = document.createElement("span");
  progessDiv.className = "progress";
  progessDiv.appendChild(progressBar);
  leftPart.appendChild(progessDiv);
  answers = document.createElement("ul");
  answers.className = "answers";
  submit.textContent = "Submit Answer";
  submit.className = "submit";
  fetch("data.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      generateText(data[id]);
      answers.appendChild(submit);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function generateText(object) {
  counter++;
  generateRandom();
  let lis = document.querySelectorAll(".answers li");
  lis.forEach((li) => {
    li.classList.remove("correct");
    li.classList.remove("incorrect");
    li.classList.remove("selected");
    li.classList.remove("unclickable");
  });
  submit.classList.remove("next");
  submit.textContent = "Submit Answer";
  p.textContent = `Question ${object[`question${counter}`].id} of ${
    Object.keys(object).length
  }`;
  question.textContent = object[`question${randomNumber}`].qu;
  rightPart.remove();
  progressBar.style.width = `calc((${
    (object[`question${counter}`].id * 100) / 10
  }%) - 10px)`;
  generateAnswers(object);
}

function generateAnswers(object) {
  if (document.querySelector("ul.answers")) {
    let lis = document.querySelectorAll("ul.answers li");
    for (let i = 1; i <= lis.length; i++) {
      lis[i - 1].dataset.status =
        object[`question${randomNumber}`].answers[`answer${i}`].status;
      let h2 = lis[i - 1].querySelector("h2");
      h2.textContent =
        object[`question${randomNumber}`].answers[`answer${i}`].text;
    }
  } else {
    for (let i = 1; i <= 4; i++) {
      let li = document.createElement("li");
      li.dataset.status =
        object[`question${randomNumber}`].answers[`answer${i}`].status;
      let letter = document.createElement("span");
      letter.className = "letter";
      letter.textContent = letters[i - 1];
      li.appendChild(letter);
      let h2 = document.createElement("h2");
      h2.className = "cat-title";
      h2.textContent =
        object[`question${randomNumber}`].answers[`answer${i}`].text;
      li.appendChild(h2);
      answers.appendChild(li);
    }
  }
  section.appendChild(answers);
  let lis = answers.querySelectorAll("li");
  lis.forEach((li) => {
    li.addEventListener("click", () => {
      lis.forEach((li) => {
        li.classList.remove("selected");
      });
      li.classList.add("selected");
    });
  });
}

function generateRandom() {
  randomNumber = Math.floor(Math.random() * 10) + 1;
  if (randomNumbers.length > 0) {
    const isDuplicate = randomNumbers.includes(randomNumber);
    if (isDuplicate) {
      generateRandom();
      return;
    }
  }
  randomNumbers.push(randomNumber);
}

function submitFunction(btn) {
  let object;
  fetch("data.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      object = data[selectedCategory.id];
      let lis = document.querySelectorAll(".answers li");
      lis.forEach((li) => {
        if (li.classList.contains("selected")) {
          lis.forEach((li) => {
            li.classList.add("unclickable");
          });
          if (li.dataset.status === "true" && !btn.classList.contains("next")) {
            correctAnswers++;
            li.classList.add("correct");
          } else {
            li.classList.add("incorrect");
          }
          if (btn.classList.contains("next")) {
            if (counter < Object.keys(object).length) {
              generateText(data[selectedCategory.id]);
            } else {
              btn.textContent = "Play Again";
              scored(object);
              btn.addEventListener("click", () => {
                location.reload();
              });
            }
          } else {
            btn.classList.add("next");
            btn.textContent = "Next Question";
          }
        }
      });
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function scored(object) {
  document.querySelectorAll(".answers li").forEach((li) => {
    if (li.dataset.status === "true") {
      li.textContent = "";
      li.className = "";
      li.className = "scored";
      li.classList.remove("selected");
    } else {
      li.remove();
    }
  });
  p.remove();
  document.querySelector("h1.question").remove();
  document.querySelector("div.progress").remove();
  let title = document.createElement("h1");
  title.className = "title";
  title.innerHTML = `Quiz completed <br /> <span>You scored...</span>`;
  leftPart.appendChild(title);
  let scored = document.querySelector(".scored");
  let logodiv = document.createElement("div");
  logodiv.classList.add("logo");
  logodiv.innerHTML = selectedCategory.innerHTML;
  let number = document.createElement("h1");
  number.textContent = correctAnswers;
  let out = document.createElement("p");
  out.textContent = `out of ${Object.keys(object).length}`;
  scored.appendChild(logodiv);
  scored.appendChild(number);
  scored.appendChild(out);
}

submit.addEventListener("click", () => {
  submitFunction(submit);
});

if (localStorage.getItem("mode")) {
  document.documentElement.classList.add(`${localStorage.getItem("mode")}`);
}
