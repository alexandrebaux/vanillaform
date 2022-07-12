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
    <div class="targeted-wrapper"></div>
    <style>
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
    </script>
</body>
</html>