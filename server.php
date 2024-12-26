<?php
// DEFINE BASE PATH
define('BASE_PATH', __DIR__);

// Load environment variables
$env = parse_ini_file(BASE_PATH . '/.env');
foreach ($env as $key => $value) {
    putenv("$key=$value");
    $_ENV[$key] = $value;
}

/* route mapping */
$routes = [
    '/' => 'index.html',
    '/roast/:roastUrl' => 'detail.html',
    '/datenschutz' => 'datenschutz.html',
    '/impressum' => 'impressum.html',
];

// Clean route by removing trailing slash
$route = rtrim($_SERVER['REQUEST_URI'], '/');
if($route == ''){
    $route = '/';
}

if($route == '/sendMessage'){
    
    // Get raw POST data
    $rawData = file_get_contents('php://input');
    $data = json_decode($rawData, true);

    // make post request with json data to env.SANTA_API_URL
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $_ENV['SANTA_API_URL']);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $rawData);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($ch);
    curl_close($ch);
    header('Content-Type: application/json');
    http_response_code(200);
    echo $response;
    exit;
}
// starts with /renderPreviewImage
if(strpos($route, '/renderPreviewImage') === 0){
    // get the roastUrl from the url
    $roastUrl = $_GET['roastUrl'];
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $_ENV['SANTA_API_URL'] . '-get-roast?url=' . urlencode($roastUrl));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($ch);
    // if 404, set route to 404
    if(curl_getinfo($ch, CURLINFO_HTTP_CODE) == 404){
        http_response_code(404);
        echo '404';
        exit;
    }
    curl_close($ch);

    // get response as json
    $roastDetail = json_decode($response, true);
    $id = str_replace('https://santa-gpt.de/roast/', '', $roastUrl);
    if(!file_exists(BASE_PATH . '/images/cards/' . $id . '.png')){
        renderPreviewImage($roastUrl, $roastDetail['verdict'], $roastDetail['shortRoast'], $roastDetail['fullName'], $roastDetail['profileUrl']);
    }

    exit;
}

// Handle static assets
$extension = pathinfo($route, PATHINFO_EXTENSION);
if ($extension) {
    $mime_types = [
        'css' => 'text/css',
        'js' => 'application/javascript',
        'png' => 'image/png',
        'jpg' => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'gif' => 'image/gif',
        'svg' => 'image/svg+xml',
        'woff' => 'font/woff',
        'woff2' => 'font/woff2',
        'ttf' => 'font/ttf',
        'eot' => 'application/vnd.ms-fontobject',
        'otf' => 'font/otf'
    ];

    // if route is /favicon.png, return the favicon
    if($route == '/favicon.png'){
        header('Content-Type: image/png');
        readfile(BASE_PATH . '/favicon.png');
        exit;
    }

    // if route is /images/cards/ not found, regenerate it
    if(strpos($route, '/images/cards/') === 0){
        // extract the id from the url
        $id = str_replace('https://santa-gpt.de/images/cards/', '', $route);
        $id = str_replace('/images/cards/', '', $id);
        $id = str_replace('.png', '', $id);
        if(!file_exists(BASE_PATH . '/images/cards/' . $id . '.png')){
            $ch = curl_init();
            // make a GET Request to env.SANTA_API_URL/roast/:roastUrl
            $roastUrl = 'https://santa-gpt.de/roast/' . $id;
            curl_setopt($ch, CURLOPT_URL, $_ENV['SANTA_API_URL'] . '-get-roast?url=' . urlencode($id));
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            $response = curl_exec($ch);
            // if 404, set route to 404
            if(curl_getinfo($ch, CURLINFO_HTTP_CODE) == 404){
                http_response_code(404);
                echo '404';
                exit;
            }
            curl_close($ch);
        
            // get response as json
            $roastDetail = json_decode($response, true);
            renderPreviewImage($roastDetail['url'], $roastDetail['verdict'], $roastDetail['shortRoast'], $roastDetail['fullName'], $roastDetail['profileUrl']);
            
            // serve file
            header('Content-Type: image/png');
            readfile(BASE_PATH . '/src/images/cards/' . $id . '.png');
            exit;
        }
    }

    if (isset($mime_types[$extension])) {
        // Prevent path traversal
        $normalized_path = str_replace('\\', '/', realpath(BASE_PATH . $route));
        if ($normalized_path && strpos($normalized_path, BASE_PATH) === 0) {
            header('Content-Type: ' . $mime_types[$extension]);
            readfile($normalized_path);
            exit;
        }
    }
}


// Check for dynamic routes
$matchFound = false;
foreach ($routes as $pattern => $file) {
    // Convert route pattern to regex
    $pattern = str_replace(':roastUrl', '([^/]+)', $pattern);
    $pattern = '#^' . $pattern . '$#';
    
    if (preg_match($pattern, $route, $matches)) {
        if (isset($matches[1])) {
            $_GET['roastUrl'] = $matches[1];
        }

        // page object
        $page = [
        ];

        if(strpos($route, '/roast/') === 0){
            // make a GET Request to env.SANTA_API_URL/roast/:roastUrl
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $_ENV['SANTA_API_URL'] . '-get-roast?url=' . urlencode($_GET['roastUrl']));
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            $response = curl_exec($ch);
            // if 404, set route to 404
            if(curl_getinfo($ch, CURLINFO_HTTP_CODE) == 404){
                $file = '404.html';
            } else {    
                // get response as json
                $roastDetail = json_decode($response, true);
                $page['roastUrl'] = $roastDetail['url'];
                $page['url'] = $roastDetail['url'];
                $page['name'] = $roastDetail['fullName'];
                $page['verdict'] = ucfirst(strtolower($roastDetail['verdict']));
                $page['roast'] = $roastDetail['fullRoast'];
                $page['shortRoast'] = $roastDetail['shortRoast'];
                $page['profileUrl'] = $roastDetail['profileUrl'];
                $page['imageUrl'] = str_replace('https://santa-gpt.de/roast/', 'https://santa-gpt.de/images/cards/', $roastDetail['url']).'.png';
                }
                curl_close($ch);

        }

        // get file contents and render it
        $fileContents = file_get_contents(BASE_PATH . '/' . $file);

        // render each page object attribute as {{TAG}}
        foreach($page as $key => $value){
            $fileContents = str_replace('{{' . strtoupper($key) . '}}', $value, $fileContents);
        }
        echo $fileContents;

        if($page['roastUrl']){
            // if is doesnt exist yet, render the preview image
            $id = str_replace('https://santa-gpt.de/roast/', '', $page['roastUrl']);
            if(!file_exists(BASE_PATH . '/images/cards/' . $id . '.png')){
                renderPreviewImage($page['roastUrl'], $page['verdict'], $page['shortRoast'], $page['name'], $page['profileUrl']);
            }
        }


        exit;

        
        $matchFound = true;
        break;
    }
}

if (!$matchFound) {
    http_response_code(404);
    include BASE_PATH . '/404.html';
}



function renderPreviewImage($roastUrl, $verdict, $shortRoast, $name, $profileUrl) {
    // Load background image
    $background = imagecreatefrompng(BASE_PATH . '/src/images/blueprint.png');
    
    // Set text color (white)
    $textColor = imagecolorallocate($background, 255, 255, 255);
    
    // Set font path and size
    $fontPath = BASE_PATH . '/src/fonts/ibm-plex-sans-v19-latin-regular.ttf';
    $fontSize = 28;
    $lineHeight = 49; // Adjust this value to change line spacing
    
    // Format text with smaller width due to left padding
    $lines = explode("\n", wordwrap($shortRoast, 32, "\n"));
    
    // Fixed left padding
    $x = 520;
    $y = 100;
    
    // Draw each line with custom line height
    foreach($lines as $line) {
        imagettftext($background, $fontSize, 0, $x, $y, $textColor, $fontPath, $line);
        $y += $lineHeight; // Move to next line
    }
    
    // Create directory if it doesn't exist
    $saveDir = BASE_PATH . '/src/images/cards';
    if (!file_exists($saveDir)) {
        mkdir($saveDir, 0777, true);
    }
    
    // Save image
    $id = str_replace('https://santa-gpt.de/roast/', '', $roastUrl);
    $filename = $saveDir . '/' . $id . '.png';
    imagepng($background, $filename);
    imagedestroy($background);
    
    return '/images/cards/rendered/' . $roastUrl . '.png';
}