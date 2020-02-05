/**
 * Client-side Script of the Netflix Stats Generator
 * @author Marvin Borner
 * @copyright Marvin Borner 2019
 */

const cookie = document.querySelector("#cookie");
const cookieWrap = document.querySelector("#cookie_wrap");
const loading = document.querySelector("#loading");
const stats = document.querySelector("#stats");
const toggle = document.querySelector("#toggle");

cookie.addEventListener("keyup", e => {
  if (e.key === "Enter") {
    const request = new XMLHttpRequest();
    request.onreadystatechange = () => {
      if (request.readyState === 4 && request.status === 200) {
        loading.style.display = "none";
        stats.style.display = "block";
        analyze(request.responseText);
      } else if (request.readyState === 4 && request.status !== 200)
        alert("Cookie is not valid!")
    };
    request.open("POST", "assets/php/getData.php", true);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.send("cookie=" + cookie.value);
    loading.style.display = "block";
    cookieWrap.style.display = "none";
  }
});

function analyze(data) {
  const filtered = {};
  data = JSON.parse(data).flat(1);

  // Push all titles with empty fields
  data.forEach(node => filtered[node["seriesTitle"] ? node["seriesTitle"] : node["videoTitle"]] = {
    duration: 0,
    dates: [],
    count: 0
  });

  // Push duration, date and count
  data.forEach(node => {
    const obj = filtered[node["seriesTitle"] ? node["seriesTitle"] : node["videoTitle"]];
    obj.duration += node["duration"] / 60 / 60; // hours
    obj.dates.push(new Date(node["date"]));
    obj.count++;
  });

  setSizes();
  drawTopTitles(filtered);

  toggle.onclick = () => drawTopTitles(filtered);

  console.log(filtered);
}

function setSizes() {
  const elements = document.getElementsByTagName("canvas");
  for (const elem of elements) {
    elem.setAttribute("width", document.querySelector(".stats div").offsetWidth);
    elem.setAttribute("height", window.innerHeight / 2 + 200);
  }
}

let previous;

function drawTopTitles(data) {
  // Toggle layout
  toggle.setAttribute("data-current", toggle.getAttribute("data-current") === "bar" ? "pie" : "bar");
  if (previous)
    previous.destroy();

  const ctx = document.getElementById("topChart");
  previous = new Chart(ctx, {
    type: toggle.getAttribute("data-current"),
    data: {
      labels: Object.keys(data).sort((a, b) => data[b].duration - data[a].duration),
      datasets: [{
        data: Object.keys(data).map(key => +data[key].duration.toFixed(2)).sort((a, b) => b - a),
        backgroundColor: Array.from({length: Object.keys(data).length}, () => "#" + ((1 << 24) * Math.random() | 0).toString(16))
      }]
    },
    options: {
      responsive: false,
      maintainAspectRatio: true,
      animation: {
        animateScale: true,
        animateRotate: true
      },
      legend: {
        display: false
      }
    }
  })
}
