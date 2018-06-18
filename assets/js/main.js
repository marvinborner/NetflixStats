$(function () {
    const CookieInput = $(".CookieInput");
    let NetflixJson;

    CookieInput.keyup(function (e) {
        if (e.keyCode === 13) {
            $.ajax({
                url: "assets/php/getJson.php",
                data: {"Cookie": CookieInput.val()},
                type: "POST",
            }).done(function (answer) {
                /**
                 * Example response:
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
                 */
                NetflixJson = JSON.parse(answer);
                console.log(NetflixJson);
                let IndividualTitles = [];
                NetflixJson.viewedItems.forEach(function(item, key) {
                    const CurrentTitle = NetflixJson.viewedItems[key].seriesTitle;
                    if (!(CurrentTitle in IndividualTitles)) {
                        IndividualTitles.push(CurrentTitle);
                    }
                });
                console.table(IndividualTitles);

            });
            CookieInput.val("");
        }
    });
});