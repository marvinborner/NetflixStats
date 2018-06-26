<?php
/**
 * Serverside Script of the Netflix Stats Generator to get the personal Netflix JSON
 * @author Marvin Borner
 * @copyright Marvin Borner 2018
 */

$NetflixCookie = $_POST["Cookie"];

$LastPage = false;
$CurPage = 0;
$NetflixJson = "[";

while ($LastPage === false) {
    $ch = curl_init("https://www.netflix.com/api/shakti/7742b8c7/viewingactivity?pg=" . (string) $CurPage . "&pgSize=100");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_HEADER, 0);
    curl_setopt($ch, CURLOPT_COOKIE, $NetflixCookie);
    $Result = curl_exec($ch);
    //print_r((json_decode($Result, TRUE)["viewedItems"]));
    //echo count(json_decode(curl_exec($ch),true)["viewedItems"]);
    if ($LastPage = count(json_decode($Result, true)["viewedItems"]) > 0) {
        $LastPage = false;
        $NetflixJson .= json_encode(json_decode($Result, true)["viewedItems"]) . ",";
    } else {
        $LastPage = true;
        $NetflixJson = substr($NetflixJson, 0, -1);
    }

    curl_close($ch);
    $CurPage++;
}

print_r($NetflixJson . "]");
