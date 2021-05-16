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

function cookies() {
    cookieWrap.style.display = "block";
    cookie.addEventListener("keyup", (e) => {
        if (e.key === "Enter") {
            const request = new XMLHttpRequest();
            request.onreadystatechange = () => {
                if (request.readyState === 4 && request.status === 200) {
                    loading.style.display = "none";
                    stats.style.display = "block";
                    analyze(request.responseText);
                } else if (request.readyState === 4 && request.status !== 200) {
                    alert("Cookie is not valid!");
                }
            };
            request.open("POST", "assets/php/getData.php", true);
            request.setRequestHeader(
                "Content-Type",
                "application/x-www-form-urlencoded"
            );
            request.send("cookie=" + cookie.value);
            loading.style.display = "block";
            cookieWrap.style.display = "none";
        }
    });
}

function tryDemo() {
    const request = new XMLHttpRequest();
    request.onreadystatechange = () => {
        if (request.readyState === 4 && request.status === 200) {
            cookieWrap.style.display = "none";
            loading.style.display = "none";
            stats.style.display = "block";
            alert(
                "Warning! You're using the example.json data. This is only for demonstration purposes and does NOT represent your real data!"
            );
            analyze(request.responseText);
        } else if (request.readyState === 4 && request.status !== 200) {
            console.log("Couldn't find demo, enabling cookie input");
            cookies();
        }
    };
    request.open("GET", "example.json", true);
    request.send();
}

function analyze(data) {
    const filtered = {};
    data = JSON.parse(data).flat(1);

    // Push all titles with empty fields
    data.forEach(
        (node) =>
            (filtered[node["seriesTitle"] || node["videoTitle"]] = {
                duration: 0,
                dates: [],
                count: 0,
            })
    );

    // Push duration, date and count
    data.forEach((node) => {
        const obj = filtered[node["seriesTitle"] || node["videoTitle"]];
        obj.duration += node["duration"] / 60 / 60; // hours
        obj.dates.push(new Date(node["date"]));
        obj.count++;
    });

    drawTotalSpent(filtered);
    drawTimeline(filtered);
    drawTopTitles(filtered);
    drawHeatmap(filtered);

    toggle.onclick = () => drawTopTitles(filtered);
}

function drawTotalSpent(data) {
    const totalHours = Object.keys(data)
        .map((key) => data[key].duration)
        .reduce((a, b) => a + b);
    document.querySelector("#totalSpent").innerHTML = `
    ${Math.floor(totalHours / 24)} days or
    ${Math.floor(totalHours)} hours or
    ${Math.round(totalHours * 60)} minutes or
    ${Math.round(totalHours * 60 * 60)} seconds!`;
}

function drawTimeline(data) {
    const hours = Object.keys(data)
        .map((key) => data[key].dates.map((date) => date.getHours()))
        .flat(1);
    const occurrence = new Array(24).fill(0);

    hours.forEach((hour) =>
        occurrence[hour] ? occurrence[hour]++ : (occurrence[hour] = 1)
    );

    const ctx = document.getElementById("hourChart");
    const chart = new ApexCharts(ctx, {
        chart: {
            type: "line",
            foreColor: "#fff",
            background: "#141414",
        },
        theme: {
            mode: "dark",
        },
        series: [
            {
                name: "Title count at hour",
                data: occurrence,
            },
        ],
        stroke: {
            curve: "smooth",
        },
        dataLabels: {
            enabled: false,
        },
        xaxis: {
            categories: [...Array(24).keys()],
        },
    });
    chart.render();
}

let previous;
let limited = false;
function drawTopTitles(data) {
    limited = !limited;
    toggle.innerText = limited ? "View all" : "View less";
    Array.prototype.limit = function () {
        if (limited) return this.slice(0, 20);
        return this;
    };

    if (previous) previous.destroy();

    const ctx = document.getElementById("topChart");
    previous = new ApexCharts(ctx, {
        chart: {
            type: "bar",
            foreColor: "#fff",
            background: "#141414",
        },
        theme: {
            mode: "dark",
        },
        series: [
            {
                name: "Time in hours",
                data: Object.keys(data)
                    .map((key) => +data[key].duration.toFixed(2))
                    .sort((a, b) => b - a)
                    .limit(),
            },
        ],
        dataLabels: {
            enabled: false,
        },
        xaxis: {
            categories: Object.keys(data)
                .sort((a, b) => data[b].duration - data[a].duration)
                .limit(),
        },
        plotOptions: {
            bar: {
                horizontal: false,
            },
            donut: {
                customScale: 0.4,
            },
        },
    });
    previous.render();
}

// TODO: There may be a bug in the first week in January
function drawHeatmap(data) {
    Date.prototype.getWeek = function () {
        var d = new Date(
            Date.UTC(this.getFullYear(), this.getMonth(), this.getDate())
        );
        d.setUTCDate(d.getUTCDate() - d.getUTCDay());
        var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
    };

    const currentYear = new Date().getFullYear();
    const currentWeek = new Date().getWeek();

    const days = [[], [], [], [], [], [], []];
    Object.keys(data).forEach((elem) => {
        data[elem].dates.forEach((date) => {
            if (date.getFullYear() != currentYear) return;

            const day = date.getDay();
            const week = date.getWeek();

            if (week > currentWeek) return;

            if (!days[day][week]) days[day][week] = 0;
            days[day][week]++;
        });
    });

    for (let i = 0; i < days.length; i++) {
        for (let j = 0; j < days[i].length; j++) {
            if (!days[i][j]) days[i][j] = 0;
        }
    }

    const ctx = document.getElementById("heatMap");
    const chart = new ApexCharts(ctx, {
        chart: {
            type: "heatmap",
            foreColor: "#fff",
            background: "#141414",
        },
        theme: {
            mode: "dark",
        },
        series: [
            {
                name: "Saturday",
                data: days[6],
            },
            {
                name: "Friday",
                data: days[5],
            },
            {
                name: "Thursday",
                data: days[4],
            },
            {
                name: "Wednesday",
                data: days[3],
            },
            {
                name: "Tuesday",
                data: days[2],
            },
            {
                name: "Monday",
                data: days[1],
            },
            {
                name: "Sunday",
                data: days[0],
            },
        ],
        plotOptions: {
            heatmap: {
                colorScale: {
                    ranges: [
                        {
                            from: 0,
                            to: 5,
                            color: "#00a100",
                            name: "low",
                        },
                        {
                            from: 6,
                            to: 10,
                            color: "#128fd9",
                            name: "medium",
                        },
                        {
                            from: 10,
                            to: 20,
                            color: "#ffb200",
                            name: "high",
                        },
                        {
                            from: 21,
                            to: 100,
                            color: "#ff5100",
                            name: "very high",
                        },
                        {
                            from: 101,
                            to: 1000,
                            color: "#e50914",
                            name: "wtf",
                        },
                    ],
                },
            },
        },
    });
    chart.render();
}

Apex.colors = ["#e50914"];
tryDemo();
