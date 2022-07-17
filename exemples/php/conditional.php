<?php

    /**
     * This is a simple exemple that do not take safety or ideal stack in consideration.
     */

    $base_dir = __DIR__ . "/../..";
    $target_file = $base_dir . "/exemples/data/conditional.db";

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
    <title>Conditional</title>
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
        var form = VanillaForm({
            el: targeted_wrapper,
            submit_btn_label: 'Send The Message',
            fields: [
                {
                    label: "Lastname",
                    name: "lastname",
                    type: "text",
                    class: "half"
                },
                {
                    label: "Firstname",
                    name: "firstname",
                    type: "text",
                    class: "half"
                },
                {
                    label: "Preferred Contact method",
                    name: "contact_method",
                    type: "checkbox",
                    choices: [
                        {label: 'Email', value:'email'},
                        {label: 'Phone', value:'phone'}
                    ],
                },
                {
                    label: "Email",
                    name: "email",
                    type: "email",
                    condition: function(e) {
                        
                        for (let i = 0; i < e.fields.length; i++) {
                            const field = e.fields[i];
                            if (field.name == 'contact_method') {
                                return (field.value && field.value.indexOf('email') > -1);
                            }
                        }

                        
                    }
                },
                {
                    label: "Phone",
                    name: "phone",
                    type: "phone",
                    condition: function(e) {

                        for (let i = 0; i < e.fields.length; i++) {
                            const field = e.fields[i];
                            if (field.name == 'contact_method') { 
                                return (field.value && field.value.indexOf('phone') > -1);
                            }
                        }
                        
                    }
                },
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