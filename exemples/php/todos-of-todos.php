<?php

    /**
     * This is a simple exemple that do not take safety or ideal stack in consideration.
     */

    $base_dir = __DIR__ . "/../..";
    $target_file = $base_dir . "/exemples/data/todos-of-todos.db";

    if (!empty($_POST)) :

        $json_string = json_encode($_POST);
        file_put_contents($target_file, $json_string);

    endif;
    
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>todos-of-todos</title>
    <script src="../../vanillaform.js"></script>
    <link rel="stylesheet" href="../../vanillaform.css">
</head>
<body>
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
            fields: [
                {
                    label: "Todos",
                    name: "todos",
                    repeater: [
                        {
                            label: "Task",
                            name: "task",
                            type: "textarea"
                        },
                        {
                            label: "Subtasks",
                            name: "subtasks",
                            repeater: [
                                {
                                    label: "Task",
                                    name: "task",
                                    type: "textarea"
                                },
                                {
                                    label: "Status",
                                    name: "status",
                                    type: "select",
                                    choices: [
                                        {value: "new", label: "New"},
                                        {value: "doing", label: "Doing"},
                                        {value: "label", label: "Done"}
                                    ]
                                },
                            ]
                        }
                    ],
                }
            ]
        }).render();

        <?php 
            
            if (file_exists($target_file)) {
                $json_string = file_get_contents($target_file);
                echo "form.set_values($json_string).render();";
            }

        ?>
        
    </script>
</body>
</html>