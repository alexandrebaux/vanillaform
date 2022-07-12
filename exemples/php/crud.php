<?php

    /**
     * This is a simple exemple that do not take safety or ideal stack in consideration.
     */

    $base_dir = __DIR__ . "/../..";
    $target_file = $base_dir . "/exemples/data/pages.db";

    if (!empty($_POST)) :

        $json_string = json_encode($_POST);

        file_put_contents($target_file, $json_string . PHP_EOL, FILE_APPEND);

    endif;
    
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Page Builder</title>
    <script src="../../vanillaform.js"></script>
    <link rel="stylesheet" href="../../vanillaform.css">
</head>
<body>
    <div class="list">
        <?php
            $data = file_get_contents($target_file);
            $entries = explode(PHP_EOL, $data);
        ?>
        <ul>
            <?php foreach ($entries as $key => $entry) : ?>
                <?php if (!empty($entry)) :  $object = (object) json_decode($entry); ?>   
                <li><a href="?edit=<?php echo $key; ?>"><?php echo $object->title; ?></a></li>     
                <?php endif;?>
            <?php endforeach;  ?>
        </ul>
    </div>
    <div class="targeted-wrapper"></div>
    <style>
        .list, 
        .targeted-wrapper { 
            width: 768px;
            margin: 1em auto;
        }
    </style>
    <script>

        var targeted_wrapper = document.querySelector('.targeted-wrapper');
        var form = new vanillaform({
            el: targeted_wrapper,
            endpoints: {
                upload: "upload-file.php"
            },
            callbacks: {
                on_upload_response: function(response, field_el) { 

                    var r = JSON.parse(response);
                    if (r.success) {
                        field_el.value = r.path; 
                    }
                    
                }
            },
            fields: [
                {
                    label: "Title",
                    name: "title",
                    type: "text",
                },
                {
                    label: "Blocks",
                    name: "blocks",
                    components: [
                        {
                            label: "Slides",
                            name: "slides",
                            repeater: [
                                {
                                    label: "Title",
                                    name: "title",
                                    type: "text",
                                },
                                {
                                    label: "Image",
                                    name: "image",
                                    button_label: "Choose an image",
                                    type: "file",
                                },
                            ]
                        },
                        {
                            label: "Call To Action",
                            name: "status",
                            type: "textarea",
                            fields: [
                                {
                                    label: "Title",
                                    name: "title",
                                    type: "text",
                                },
                                {
                                    label: "Content",
                                    name: "content",
                                    type: "textarea",
                                },
                                {
                                    label: "Image",
                                    name: "image",
                                    type: "file",
                                },
                                {
                                    label: "Lien",
                                    name: "link",
                                    type: "url",
                                },
                            ]
                        },
                        {
                            label: "Content",
                            name: "status",
                            type: "textarea",
                            fields: [
                                {
                                    label: "Title",
                                    name: "title",
                                    type: "text",
                                },
                                {
                                    label: "Content",
                                    name: "content",
                                    type: "textarea",
                                },
                            ]
                        },
                    ]
                }
            ]
        }).render();


        <?php 
            
            if (isset($_GET['edit'])) {
                if (!empty($entries[$_GET['edit']])) {
                    $json_string = $entries[$_GET['edit']];
                    echo "form.set_values($json_string).render();";
                }
            }

            
        ?>
    </script>
</body>
</html>