<?php

/**
 * Server-side script of the Netflix Stats Generator to get the personal Netflix JSON
 * @author Marvin Borner
 * @copyright Marvin Borner 2018
 */

$cookie = $_POST['cookie'];

if (!isset($cookie)) {
    http_response_code(404);
    die();
}

$isLastPage = false;
$currentPage = 0;
$result = '[';

while ($isLastPage === false) {
    // Anywhere on netflix.com in console: netflix.appContext.state.model.models.serverDefs.data.BUILD_IDENTIFIER
    $ch = curl_init('https://www.netflix.com/shakti/vbe1263cd/viewingactivity?pg=' . $currentPage . '&pgSize=100');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_HEADER, 0);
    curl_setopt($ch, CURLOPT_COOKIE, $cookie);
    $answer = curl_exec($ch);
    curl_close($ch);

    if ($isLastPage = (count(json_decode($answer, true)['viewedItems']) > 0)) {
        $isLastPage = false;
        $result .= json_encode(json_decode($answer, true)['viewedItems']) . ',';
    } else {
        $isLastPage = true;
        $result = substr($result, 0, -1);
    }

    $currentPage++;
}

if ($result !== '') {
    print_r($result . ']');
} else {
    http_response_code(404);
    die();
}
