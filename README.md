# NetflixPersonalStats

## Demo

-   Visit [GitHub
    Pages](https://marvinborner.github.io/NetflixStats/index.html)
-   Follow the instructions below if you want to see your own analysis

## Instructions

-   Clone the GitHub Repository with
    `git clone https://github.com/marvinborner/NetFlixPersonalStats`
-   Remove the `example.json` file if you want to analyse your own
    account
-   Move into the directory and setup a local PHP Server (eg. with
    `php -S localhost:8080`)
-   Get your Netflix cookie by
    -   pressing `F12` (Developer Menu)
    -   moving to the `Network` Tab
    -   visiting `https://www.netflix.com/WiViewingActivity`
    -   selecting the first entry in the left sidebar
        ("WiViewingActivity"")
    -   copying the **complete** String of the "Cookie:" information in
        the "request headers" part (Tip: Right-click and click on 'copy'
        on the cookie element)
-   Visit `localhost:8080`, paste the cookie into the input field and
    press enter
-   Get amazed of how long you're using Netflix every day
