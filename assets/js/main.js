const CookieInput = $(".CookieInput");
let NetflixJson;

CookieInput.keyup(function (e) {
    if (e.keyCode === 13) {
        $.ajax({
            url: "assets/php/getJson.php",
            data: {
                "Cookie": CookieInput.val()
            },
            type: "POST",
        }).done(function (response) {
            AnalyzeData(response);
            CookieInput.val("");
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
    let IndividualSeries = [];
    let IndividualMovies = [];
    let AverageWatchTimes = [];

    NetflixJson.forEach(function (item, pageKey) {
        item.forEach(function (eachItem, ItemNumber) {
            if ("seriesTitle" in eachItem) { // is series
                const CurrentTitle = NetflixJson[pageKey][ItemNumber].seriesTitle;
                if (IndividualSeries.indexOf(CurrentTitle) === -1 && CurrentTitle !== undefined) { // only if not alreadyy crawled -> individualism
                    IndividualSeries.push(CurrentTitle);
                }
            } else { // is movie
                const CurrentTitle = NetflixJson[pageKey][ItemNumber].videoTitle;
                if (IndividualMovies.indexOf(CurrentTitle) === -1 && CurrentTitle !== undefined) { // only if not alreadyy crawled -> individualism
                    IndividualMovies.push(CurrentTitle);
                }
            }

            const DayTimeInSeconds = new Date(NetflixJson[pageKey][ItemNumber].date * 1000);
            const DayTimeInHours = DayTimeInSeconds.getHours();
            AverageWatchTimes.push(DayTimeInHours);
        });
    });

    const TotalSeriesWatched = IndividualSeries.length;

    // Calculate watch time occurrence (average times in which the user watches sth.)
    let AverageWatchTimeOccurrence = {};
    for (let i = 0; i < AverageWatchTimes.length; i++) {
        const Time = AverageWatchTimes[i];
        AverageWatchTimeOccurrence[Time] = AverageWatchTimeOccurrence[Time] ? AverageWatchTimeOccurrence[Time] + 1 : 1;
    }

    console.table(IndividualSeries);
    console.table(IndividualMovies);
    console.table(AverageWatchTimes);
    console.table(AverageWatchTimeOccurrence);

    RenderData(AverageWatchTimeOccurrence);
}

function RenderData(AverageWatchTimeOccurrenceObject) {
    const WatchTimeChartElement = document.getElementById("WatchTimeChart").getContext("2d");
    const WatchTimeChart = new Chart(WatchTimeChartElement, {
        type: 'line',
        data: {
            labels: ["12am", "1am", "2am", "3am", "4am", "5am", "6am", "7am", "8am", "9am", "10am", "11am", "12pm", "1pm", "2pm", "3pm", "4pm", "5pm", "6pm", "7pm", "8pm", "9pm", "10pm", "11pm"],
            datasets: [{
                label: "Average daytime",
                backgroundColor: 'rgb(255, 99, 132)',
                borderColor: 'rgb(255, 99, 132)',
                data: AverageWatchTimeOccurrenceObject,
            }]
        },

        options: {}
    });
}