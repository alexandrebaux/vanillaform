<?php

    /**
     * This is a simple exemple that do not take safety in consideration.
     * Do not forget to put some limitation to file upload.
     */

    $base_dir = __DIR__ . "/../..";
    
    $target_dir = $base_dir . "/exemples/data/";

    $target_file = $target_dir . uniqid() . '_' . basename($_FILES["file"]["name"]);

    if (move_uploaded_file($_FILES["file"]["tmp_name"], $target_file)) {
        
        echo json_encode([
            "success" => true,
            "path" =>  str_replace($base_dir, '', $target_file)
        ]);

    } else {

        echo json_encode([
            "error" => true
        ]);

    }

    exit;