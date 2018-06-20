<?php
$NetflixCookie = $_POST["Cookie"];

$LastPage = FALSE;
$CurPage = 0;
$NetflixJson = "[";

while ($LastPage === FALSE) {
    $ch = curl_init("https://www.netflix.com/api/shakti/7742b8c7/viewingactivity?pg=" . (string)$CurPage . "&pgSize=100");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_HEADER, 0);
    curl_setopt($ch, CURLOPT_COOKIE, $NetflixCookie);
    $Result = curl_exec($ch);
    //print_r((json_decode($Result, TRUE)["viewedItems"]));
    //echo count(json_decode(curl_exec($ch),true)["viewedItems"]);
    if ($LastPage = count(json_decode($Result, TRUE)["viewedItems"]) > 0) {
        $LastPage = FALSE;
        $NetflixJson .= json_encode(json_decode($Result, TRUE)["viewedItems"]) . ",";
    } else {
        $LastPage = TRUE;
        $NetflixJson = substr($NetflixJson, 0, -1);
    }

    curl_close($ch);
    $CurPage++;
}

print_r($NetflixJson . "]");