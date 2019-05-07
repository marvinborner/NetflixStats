# NetflixPersonalStats

## Instructions
* Clone the GitHub Repository with `git clone https://github.com/marvinborner/NetFlixPersonalStats`
* Move into the directory and setup a local PHP Server (eg. with `php -S localhost:8080`)
* Get your Netflix cookie by 
    * visiting `https://www.netflix.com/WiViewingActivity`
    * pressing `F12` (Developer Menu)
    * moving to the `Network` Tab
    * selecting the first entry in the left sidebar ("WiViewingActivity"")
    * copying the **complete** String of the "Cookie:" information in the "request headers" part
    (make sure it looks like `memclid=***; otherNetflixCookie=****:` and so on)
* Visit `localhost:8080`, paste the cookie into the input field and press enter
* Get amazed of how long you're using Netflix every day
