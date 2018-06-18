<?php
$NetflixCookie = $_POST["Cookie"];

$ch = curl_init("https://www.netflix.com/api/shakti/7742b8c7/viewingactivity");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_HEADER, 0);
curl_setopt($ch, CURLOPT_COOKIE, $NetflixCookie);
$NetflixJson = curl_exec($ch);
curl_close($ch);

print_r($NetflixJson);