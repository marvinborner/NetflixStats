<?php
/**
 * Serverside Script of the Netflix Stats Generator to get information of a movie/series
 * @author Marvin Borner
 * @copyright Marvin Borner 2018
 */

$RequestedTitle = $_POST["Title"];

$ApiKey = file_get_contents("../../../../ApiKeys/ThemoviedbApiKey.txt");
$ch = curl_init("https://api.themoviedb.org/3/search/multi?api_key=" . $ApiKey . "&language=en-US&query=" . urlencode($RequestedTitle) . "&page=1&include_adult=true");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_HEADER, 0);
$Result = json_decode(curl_exec($ch), true);
curl_close($ch);

print_r(json_encode($Result["results"][0]));
