<?php  
  if ($_POST['body']) {
    header('Expires: 0');
    header('Cache-control: private');
    header('Cache-control: must-revalidate, post-check=0, pre-check=0');
    header('Content-description: File Transfer');
    header('Content-type: ' . $_POST['contentType'] . '');
    header('Content-disposition: attachment; filename="video_annotation_' . $_POST['videoId']. '.' . $_POST['extension'] . '"');
    echo stripslashes($_POST['body']);
  }
?>