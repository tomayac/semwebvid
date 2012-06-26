<?php
  // no time limit
  set_time_limit(0);

  if (get_magic_quotes_gpc()) {
    $process = array(&$_GET, &$_POST, &$_COOKIE, &$_REQUEST);
    while (list($key, $val) = each($process)) {
      foreach ($val as $k => $v) {
        unset($process[$key][$k]);
        if (is_array($v)) {
          $process[$key][stripslashes($k)] = $v;
          $process[] = &$process[$key][stripslashes($k)];
        } else {
          $process[$key][stripslashes($k)] = stripslashes($v);
        }
      }
    }
    unset($process);
  }

  // Get the REST call path from the AJAX application
  // Is it a POST or a GET?
  $path = ($_POST['path']) ? $_POST['path'] : $_GET['path'];

  // Open the Curl session
  $session = curl_init($path);

  if (isset($_GET['tunnelXmlOverJson']) || isset($_POST['tunnelXmlOverJson'])) {
    $headers = array('Content-type: application/x-www-form-urlencoded');
    curl_setopt($session, CURLOPT_HTTPHEADER, $headers);
  } else if (isset($_GET['acceptHeader']) || isset($_POST['acceptHeader'])) {
    $headers = array('Accept: ' . ($_GET['acceptHeader']? $_GET['acceptHeader'] : $_POST['acceptHeader']));
    curl_setopt($session, CURLOPT_HTTPHEADER, $headers);    
  }
  // If it's a POST, put the POST data in the body
  if ($_POST['path']) {
  	$postvars = '';
  	while ($element = current($_POST)) {
  	  if (key($_POST) != 'path') {
  		  $postvars .= key($_POST) . '=' . $element .'&';
  	  }
  	  next($_POST);
  	}
  	curl_setopt ($session, CURLOPT_POST, true);
  	curl_setopt ($session, CURLOPT_POSTFIELDS, $postvars);
  }

  $useragent = "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_3; en-US) AppleWebKit/534.1 (KHTML, like Gecko) Chrome/6.0.427.0 Safari/534.1"; 
  // Set user agent 
  curl_setopt($session, CURLOPT_USERAGENT, $useragent);
  curl_setopt($session, CURLOPT_REFERER, $_SERVER['SCRIPT_URI']);

  // Don't return HTTP headers. Do return the contents of the call
  if (!isset($_GET['headOnly']) && !isset($_POST['headOnly'])) {
    curl_setopt($session, CURLOPT_HEADER, false);
  } else {
    curl_setopt($session, CURLOPT_HEADER, true);    
  }
  curl_setopt($session, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($session, CURLOPT_FOLLOWLOCATION, true);

  // Make the call
  $json = curl_exec($session);  
  $httpCode = curl_getinfo($session, CURLINFO_HTTP_CODE);
  if ($httpCode == 404) {
    header("HTTP/1.0 404 Not Found");    
  }  
  $json = preg_replace('/\n/', " ", $json);
  $json = preg_replace('/\s+/', ' ', $json);      

  // deal with YouTube API redundancy
  if (preg_match('/,\s*"input_str":.*?$/i', $json)) {
    $json = preg_replace('/,\s*"input_str":.*?$/i', "", $json) . '}]';
  }

  // The web service returns JSON. Set the Content-Type appropriately
  if ((!isset($_GET["contentType"])) &&
      (!isset($_GET['headOnly'])) &&
      (!isset($_POST['headOnly']))) {
    header("Content-type: application/json");
  } else if ((isset($_GET['headOnly'])) || (isset($_POST['headOnly']))) {
    header("Content-type: " . curl_getinfo($session, CURLINFO_CONTENT_TYPE));     
  } else {
    header("Content-type: " . $_GET["contentType"]);  
  }

  if (isset($_GET['tunnelXmlOverJson']) || isset($_POST['tunnelXmlOverJson'])) {
    $json = '{"xml": "' . addslashes($json) .'"}';
  }

  if (isset($_GET['callback'])) {
    echo $_GET['callback'] . '(' . $json . ', ' . (isset($_GET['callbackParams'])? '\'' . addslashes($_GET['callbackParams']) . '\'' : 'false') . ')';
  } else {
    echo $json;
  }
  curl_close($session);
?>