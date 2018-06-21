const CookieInput = $(".CookieInput");
let NetflixJson;

CookieInput.keyup(function (e) {
    if (e.keyCode === 13) {
        $.ajax({
            url: "assets/php/getNetflixJson.php",
            data: {
                "Cookie": CookieInput.val()
            },
            type: "POST",
        }).done(function (response) {
            CookieInput.val("");
            AnalyzeData(response);
        });
    }
});

function AnalyzeData(JsonResponse) {
    /**
     * @example response of a series:
     *  bookmark: 0
     *  country: "DE"
     *  date: 1529338765489
     *  dateStr: "18.06.18"
     *  deviceType: 1481
     *  duration: 3302
     *  episodeTitle: "Folge 13"
     *  estRating: "50"
     *  index: 0
     *  movieID: 80205354
     *  seasonDescriptor: "Teil 1"
     *  series: 80192098
     *  seriesTitle: "Haus des Geldes"
     *  title: "Teil 1: \"Folge 13\""
     *  topNodeId: "80192098"
     *  videoTitle: "Folge 13"
     * 
     *  @example response of a movie:
     *  bookmark: 7771
     *  country: "DE"
     *  date: 1476477258019
     *  dateStr: "14.10.16"
     *  deviceType: 1193
     *  duration: 8160
     *  estRating: "30"
     *  index: 916
     *  movieID: 20557937
     *  title: "Matrix"
     *  topNodeId: "20557937"
     *  videoTitle: "Matrix"
     */
    NetflixJson = JSON.parse(JsonResponse);
    console.log(NetflixJson);
    let EveryWatched = [];
    let IndividualTitles = [];
    let IndividualSeries = [];
    let IndividualMovies = [];
    let AverageWatchTimes = [];

    NetflixJson.forEach(function (item, pageKey) {
        item.forEach(function (eachItem, ItemNumber) {
            if ("seriesTitle" in eachItem) { // is series
                const CurrentTitle = NetflixJson[pageKey][ItemNumber].seriesTitle;
                EveryWatched.push(CurrentTitle);
                if (IndividualSeries.indexOf(CurrentTitle) === -1 && CurrentTitle !== undefined) { // only if not already crawled -> individualism
                    IndividualSeries.push(CurrentTitle);
                    IndividualTitles.push(CurrentTitle);
                }
            } else { // is movie
                const CurrentTitle = NetflixJson[pageKey][ItemNumber].videoTitle;
                EveryWatched.push(CurrentTitle);
                if (IndividualMovies.indexOf(CurrentTitle) === -1 && CurrentTitle !== undefined) { // only if not already crawled -> individualism
                    IndividualMovies.push(CurrentTitle);
                    IndividualTitles.push(CurrentTitle);
                }
            }

            // get watch time
            const DayTimeInSeconds = new Date(NetflixJson[pageKey][ItemNumber].date * 1000);
            const DayTimeInHours = DayTimeInSeconds.getHours();
            AverageWatchTimes.push(DayTimeInHours);
        });
    });

    const TotalSeriesWatched = IndividualSeries.length;

    // Calculate watch time occurrence (average times in which the user watches sth.)
    let AverageWatchTimeOccurrence = [];
    const WatchTimeOccurrenceCounter = new Map([...new Set(AverageWatchTimes)].map(
        x => [x, AverageWatchTimes.filter(y => y === x).length]
    ));
    for (let i = 0; i < 24; i++) {
        AverageWatchTimeOccurrence.push(WatchTimeOccurrenceCounter.get(i));
    }

    // Calculate the most watched series/movie
    let TitleCount = [];
    const UnsortedTitleOccurrenceCounter = EveryWatched.reduce((prev, curr) => (prev[curr] = ++prev[curr] || 1, prev), {});
    const SortedTitleOccurrenceCounter = sortObject(UnsortedTitleOccurrenceCounter);

    // log
    console.table(IndividualTitles);
    console.table(IndividualSeries);
    console.table(IndividualMovies);
    console.table(AverageWatchTimeOccurrence);
    console.table(SortedTitleOccurrenceCounter);

    RenderData(AverageWatchTimeOccurrence, SortedTitleOccurrenceCounter);
}

function RenderData(AverageWatchTimeOccurrenceArray, TitleOccurrenceCounterObject) {
    // Render day time chart
    const WatchTimeChartElement = document.getElementById("WatchTimeChart").getContext("2d");
    const WatchTimeChart = new Chart(WatchTimeChartElement, {
        type: 'line',
        data: {
            labels: ["12am", "1am", "2am", "3am", "4am", "5am", "6am", "7am", "8am", "9am", "10am", "11am", "12pm", "1pm", "2pm", "3pm", "4pm", "5pm", "6pm", "7pm", "8pm", "9pm", "10pm", "11pm"],
            datasets: [{
                label: "Watches at daytime",
                backgroundColor: "rgb(255, 99, 132)",
                borderColor: "rgb(255, 99, 132)",
                cubicInterpolationMode: "monotone",
                pointRadius: 0,
                pointHitRadius: 10,
                data: AverageWatchTimeOccurrenceArray
            }]
        },
        options: {}
    });

    // Render and calculate most watched chart
    const MostWatchedChartElement = document.getElementById("MostWatchedChart").getContext("2d");
    var MostWatchedChartData = {
        labels: [],
        datasets: [{
            label: "Most watched",
            backgroundColor: "rgba(75,192,192,0.4)",
            borderColor: "rgba(75,192,192,1)",
            data: []
        }]
    };
    Chart.pluginService.register({
        beforeInit: function (chart) {
            var data = chart.config.data;
            for (var key in TitleOccurrenceCounterObject) {
                if (TitleOccurrenceCounterObject.hasOwnProperty(key)) {
                    data.labels.push(key);
                    data.datasets[0].data.push(TitleOccurrenceCounterObject[key]);
                }
            }
        }
    });
    var MostWatchedChart = new Chart(MostWatchedChartElement, {
        type: 'bar',
        data: MostWatchedChartData,
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
}

function sortObject(list) {
    var sortable = [];
    for (var key in list) {
        sortable.push([key, list[key]]);
    }
    sortable.sort(function(a, b) {
        return (a[1] < b[1] ? -1 : (a[1] > b[1] ? 1 : 0));
    });
    var orderedList = {};
    for (var i = 0; i < sortable.length; i++) {
        orderedList[sortable[i][0]] = sortable[i][1];
    }
    return orderedList;
  }