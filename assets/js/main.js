/**
 * Clientside Script of the Netflix Stats Generator
 * @author Marvin Borner
 * @copyright Marvin Borner 2018
 */

$(() => {
  const DebuggingMode = true;
  const CookieInput = $(".CookieInput");
  let NetflixJson;

  if (!DebuggingMode) {
    CookieInput.keyup((e) => {
      if (e.keyCode === 13) {
        $.ajax({
          url: "assets/php/getNetflixJson.php",
          data: {
            Cookie: CookieInput.val()
          },
          type: "POST"
        }).done((response) => {
          CookieInput.val("");
          CookieInput.hide();
          $(".Main").fadeIn();
          AnalyzeData(response);
        });
      }
    });
  } else {
    CookieInput.hide();
    $.ajax({
      url: "assets/js/ExampleData.js",
      data: {
        Cookie: CookieInput.val()
      },
      type: "POST"
    }).done((response) => {
      $(".Main").fadeIn();
      AnalyzeData(response);
    });
  }

  /**
   * Analyzes the Netflix data JSON response
   * @param {JSON} JsonResponse
   */
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

    NetflixJson.forEach((item, pageKey) => {
      item.forEach((eachItem, ItemNumber) => {
        if ("seriesTitle" in eachItem) {
          // is series
          const CurrentTitle = NetflixJson[pageKey][ItemNumber].seriesTitle;
          EveryWatched.push(`${CurrentTitle}`);
          if (
            IndividualSeries.indexOf(CurrentTitle) === -1 &&
            CurrentTitle !== undefined
          ) {
            // only if not already crawled -> individualism
            IndividualSeries.push(CurrentTitle);
            IndividualTitles.push(CurrentTitle);
          }
        } else {
          // is movie
          const CurrentTitle = NetflixJson[pageKey][ItemNumber].videoTitle;
          EveryWatched.push(`${CurrentTitle}`);
          if (
            IndividualMovies.indexOf(CurrentTitle) === -1 &&
            CurrentTitle !== undefined
          ) {
            // only if not already crawled -> individualism
            IndividualMovies.push(CurrentTitle);
            IndividualTitles.push(CurrentTitle);
          }
        }

        // get watch time
        const DayTimeInSeconds = new Date(
          NetflixJson[pageKey][ItemNumber].date * 1000
        );
        const DayTimeInHours = DayTimeInSeconds.getHours();
        AverageWatchTimes.push(DayTimeInHours);
      });
    });

    const TotalSeriesWatched = IndividualSeries.length;

    // Calculate watch time occurrence (average times in which the user watches sth.)
    let AverageWatchTimeOccurrence = [];
    const WatchTimeOccurrenceCounter = new Map(
      [...new Set(AverageWatchTimes)].map(x => [
        x,
        AverageWatchTimes.filter(y => y === x).length
      ])
    );
    for (let i = 0; i < 24; i++) {
      AverageWatchTimeOccurrence.push(WatchTimeOccurrenceCounter.get(i));
    }

    // Calculate the most watched series/movies
    const UnsortedTitleOccurrenceCounter = EveryWatched.reduce(
      (prev, curr) => ((prev[curr] = ++prev[curr] || 1), prev), {}
    );
    const SortedTitleOccurrenceCounter = sortObject(
      UnsortedTitleOccurrenceCounter
    );
    const TopSeries = Object.keys(SortedTitleOccurrenceCounter)[
      Object.keys(SortedTitleOccurrenceCounter).length - 1
    ];
    RenderTopSeries(TopSeries);

    // log
    console.table(IndividualTitles);
    console.table(IndividualSeries);
    console.table(IndividualMovies);
    console.table(AverageWatchTimeOccurrence);
    console.table(SortedTitleOccurrenceCounter);

    // render
    RenderDayTimeChart(AverageWatchTimeOccurrence);
    RenderMostWatchedChart(SortedTitleOccurrenceCounter);

    // create scroll events
    new Waypoint({
      element: $('canvas#MostWatchedChart'),
      handler: (direction) => {
        $('canvas#MostWatchedChart').fadeTo(1000, (direction === "down" ? 1 : 0))
      },
      offset: $('canvas#MostWatchedChart').height()
    });
  }

  /**
   * Renders the day time chart
   * @param {Array} AverageWatchTimeOccurrenceArray
   */
  function RenderDayTimeChart(AverageWatchTimeOccurrenceArray) {
    var randomColorGenerator = () => {
      return "#" + (Math.random().toString(16) + "0000000").slice(2, 8);
    };

    // Render day time chart
    const WatchTimeChartElement = document
      .getElementById("WatchTimeChart")
      .getContext("2d");
    const WatchTimeChart = new Chart(WatchTimeChartElement, {
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
          label: "Watches at daytime",
          borderColor: "rgb(255, 99, 132)",
          cubicInterpolationMode: "monotone",
          pointRadius: 0,
          pointHitRadius: 15,
          data: AverageWatchTimeOccurrenceArray
        }]
      },
      options: {
        scales: {
          yAxes: [{
            ticks: {
              display: false
            },
            gridLines: {
              zeroLineColor: "transparent",
              zeroLineWidth: 2,
              drawTicks: false,
              drawBorder: false,
              color: "transparent"
            }
          }],
          xAxes: [{
            gridLines: {
              zeroLineColor: "rgba(255, 255, 255, 0.25)",
              display: true,
              drawBorder: false,
              color: "rgba(255, 255, 255, 0.25)"
            }
          }]
        },
        tension: 1
      }
    });
  }

  /**
   * Renders the "most watched series" doughnut chart
   * @param {Object} TitleOccurrenceCounterObject
   */
  function RenderMostWatchedChart(TitleOccurrenceCounterObject) {
    // Render and calculate most watched chart

    const GenerateRandomColorArray = () => {
      let RandomColorArray = [];
      const Generate = () => {
        var letters = "0123456789ABCDEF".split("");
        var color = "#";
        for (var i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
      };
      for (var key in TitleOccurrenceCounterObject) {
        RandomColorArray.push(Generate());
      }
      return RandomColorArray;
    };

    const MostWatchedChartElement = document
      .getElementById("MostWatchedChart")
      .getContext("2d");
    var MostWatchedChartData = {
      labels: [],
      datasets: [{
        label: "Most watched",
        backgroundColor: GenerateRandomColorArray(),
        data: []
      }]
    };
    Chart.pluginService.register({
      beforeInit: (chart) => {
        var data = chart.config.data;
        for (var key in TitleOccurrenceCounterObject) {
          if (TitleOccurrenceCounterObject.hasOwnProperty(key)) {
            if (TitleOccurrenceCounterObject[key] > 1) {
              data.labels.push(key);
              data.datasets[0].data.push(TitleOccurrenceCounterObject[key]);
            }
          }
        }
      }
    });
    var MostWatchedChart = new Chart(MostWatchedChartElement, {
      type: "doughnut",
      data: MostWatchedChartData,
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

  /**
   * Renders the top series in the DOM
   * @param {String} Title
   */
  function RenderTopSeries(Title) {
    $.ajax({
      url: "assets/php/getInformation.php",
      data: {
        Title: Title
      },
      type: "POST"
    }).done((response) => {
      console.log(JSON.parse(response));
    });
    // TODO: Write to site/DOM
  }

  /**
   * Sorts an js object by value {int}
   * @param {Object} list
   */
  function sortObject(list) {
    var sortable = [];
    for (var key in list) {
      sortable.push([key, list[key]]);
    }
    sortable.sort((a, b) => {
      return a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0;
    });
    var orderedList = {};
    for (var i = 0; i < sortable.length; i++) {
      orderedList[sortable[i][0]] = sortable[i][1];
    }
    return orderedList;
  }
});