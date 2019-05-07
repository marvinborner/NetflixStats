/**
 * Client-side Script of the Netflix Stats Generator
 * @author Marvin Borner
 * @copyright Marvin Borner 2019
 */

const cookie = document.querySelector("#cookie");
const cookieWrap = document.querySelector("#cookie_wrap");
const loading = document.querySelector("#loading");
const stats = document.querySelector("#stats");
const heatMap = document.querySelector("#heatMap");

cookie.addEventListener("keyup", e => {
  if (e.key === "Enter") {
    const request = new XMLHttpRequest();
    request.onreadystatechange = () => {
      if (request.readyState === 4 && request.status === 200) {
        analyze(request.responseText);
        loading.style.display = "none";
        stats.style.display = "block";
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
  data = JSON.parse(data).flat(1);
  let totalWatchedSeconds = 0;
  const hourObject = Array(24).fill(0);
  const watchCountObject = {};

  data.forEach(element => {
    let title;
    const seriesTitle = element.seriesTitle;
    const movieTitle = element.title;
    const watchDate = element.date;
    const duration = element.duration;

    // Generate watch time array (eg. 12am)
    hourObject[(new Date(watchDate)).getHours()]++;

    if (seriesTitle !== undefined) title = seriesTitle;
    else title = movieTitle;

    if (watchCountObject[title] !== undefined) {
      watchCountObject[title].date.push(new Date(watchDate));
      watchCountObject[title].watchTimeInSeconds += duration;
      watchCountObject[title].watchTime = secondsToHours(watchCountObject[title].watchTimeInSeconds);
      watchCountObject[title].count++;
      totalWatchedSeconds += duration
    } else {
      watchCountObject[title] = {
        date: [new Date(watchDate)],
        watchTime: secondsToHours(duration),
        watchTimeInSeconds: duration,
        count: 1
      };
      totalWatchedSeconds += duration;
    }
  });

  renderTotalSpent(totalWatchedSeconds);
  renderHourChart(hourObject);
  renderTopChart(watchCountObject);
  renderHeatMap(watchCountObject);
  console.log(watchCountObject);
}

function renderTotalSpent(total) {
  document.querySelector("#totalSpent").innerHTML = `
  Days: ${Math.floor(total / 60 / 60 / 24)}, 
  Hours: ${Math.floor(total / 60 / 60)}, 
  Minutes: ${Math.round(total / 60)}, 
  Seconds: ${total}`
}

function renderHourChart(hourObject) {
  const element = document
    .getElementById("hourChart")
    .getContext("2d");

  new Chart(element, {
    type: "line",
    data: {
      labels: [
        "12am",
        "1am",
        "2am",
        "3am",
        "4am",
        "5am",
        "6am",
        "7am",
        "8am",
        "9am",
        "10am",
        "11am",
        "12pm",
        "1pm",
        "2pm",
        "3pm",
        "4pm",
        "5pm",
        "6pm",
        "7pm",
        "8pm",
        "9pm",
        "10pm",
        "11pm"
      ],
      datasets: [{
        label: "Average watch times",
        borderColor: "rgb(255, 99, 132)",
        cubicInterpolationMode: "monotone",
        pointRadius: 0,
        pointHitRadius: 15,
        data: hourObject
      }]
    },
    options: {
      scales: {
        yAxes: [{
          ticks: {
            display: false
          }
        }]
      },
      legend: {
        display: false
      }
    }
  });
}

function renderTopChart(object) {
  const sorted = Object.keys(object).sort((a, b) => {
    return object[b].watchTimeInSeconds - object[a].watchTimeInSeconds
  });
  const data = sorted.map(element => object[element].watchTimeInSeconds);
  const labels = sorted.map(element => {
    return element + " (" + Math.floor(object[element].watchTimeInSeconds / 60 / 60) + " hours)"
  });
  const colorArray = Array.from({length: data.length}, () =>
    "#" + ((1 << 24) * Math.random() | 0).toString(16));

  const element = document
    .getElementById("topChart")
    .getContext("2d");

  new Chart(element, {
    type: 'doughnut',
    data: {
      datasets: [{
        data: data,
        backgroundColor: colorArray
      }],
      labels: labels,
    },
    options: {
      animation: {
        animateScale: true,
        animateRotate: true
      },
      legend: {
        display: false
      }
    }
  });
}

function renderHeatMap(object) {
  const allDates = Object.keys(object).map(element => object[element].date).flat(10)
    .map(element => element.setHours(0, 0, 0, 0));
  const watchedPerWeek = [[], [], [], [], [], [], []];

  for (let i = 0; i < 366; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    watchedPerWeek[date.getDay()].push(allDates.map(element => element === date.getTime()).filter(Boolean).length);
  }

  const maxWatchedPerDay = Math.max.apply(Math, watchedPerWeek.flat(2));

  watchedPerWeek.map((element, i) => {
    watchedPerWeek[i].push(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][i]);
    return watchedPerWeek[i].reverse();
  });

  watchedPerWeek.forEach(element => {
    const tableRow = document.createElement("tr");
    element.forEach(count => {
      const tableData = document.createElement("td");
      tableData.style.backgroundColor = "rgba(255,13,0," + count / maxWatchedPerDay + ")";
      if (typeof count !== "number") tableData.appendChild(document.createTextNode(count));
      tableRow.appendChild(tableData);

      tableData.addEventListener("mouseover", () => {
        document.querySelector("#information").innerText = `You've watched ${count} titles on that day!`;
      });
    });

    heatMap.appendChild(tableRow)
  })
}

function secondsToHours(seconds) {
  const date = new Date(null);
  date.setSeconds(seconds);
  return date.toISOString().substr(11, 8)
}
