# VanillaForm

## Include `JavaScript` and `CSS`.

```
<script src="vanillaform.js"></script>
<link rel="stylesheet" href="vanillaform.css">
```

`vanillaform.js` is the master file of this project. It contains one main JavaScript function called `VanillaForm`.

`vanillaform.css` give you a basic CSS code that you can adapt to your needs.

## Basic HTML Layout

```
<div class="targeted-wrapper"></div>
<style>
    .targeted-wrapper { 
        width: 768px;
        margin: 1em auto;
    }
</style>
```

## Initialize VanillaForm

You can use both `VanillaForm(settings)` or `new VanillaForm(settings)` to get an instance.

Instances have the following methods.

***

`render` method allow you to render the form in the dom element you specify during initialization. See `el` in settings section. This function does not receive parameters.

***

`set_values` method allow you to set form values. You must call the render method to see changes. This function does receive an object that contains the values.

```
form.set_values({
    firstname: 'John',
    lastname: 'Doe',
    email: 'john.doe@example.com',
    message: 'An exemple of message',
});
form.render();
```

### Example of initialization

```
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
            label: "Email",
            name: "email",
            type: "email"
        },
        {
            label: "Message",
            name: "message",
            type: "textarea"
        }
    ]
});
form.render();
```

## Settings

`el` is the wrapper element where the form is inserted.

You can use `document.querySelector(selector)` if you need to use a selector.

```
{
    el: document.querySelector('.targeted-wrapper')
}
```

***

`method` allows you to specify the method used to send the form. The default value is `post`.

***

`submit_btn_label` allow you to specify the label of the submit button.

***

`endpoints` is an object that contain the locations to where to send data.

```
{
    endpoints: {
        action: '/path/to/backend',
        upload: '/path/to/upload_file',
    }
}
```

`upload` is the path where files are sent via ajax immediately after a file has been selected.

`action` is the path where the data is sent when the form is submitted.

***

`callbacks` is an object that contain function called at some point.


```
{
    callbacks: {
        before_render:  function (){},
        after_render:  function (){},
        on_upload_response:  function (){},
    }
}
```

***

`before_render` is fired before rendering the form.

***

`after_render` is triggered after the form is rendered. It is useful to attach external field customization libraries such as a WYSIWYG, a complex selector or a date picker.

***

`on_upload_response` is triggered after the server has responded to the file upload. It is used to set the value of the `file` field.

Considering the following php code at the `upload` endpoint. 

```
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
```

You will need to set `on_upload_response` callback like this.

```
{
    on_upload_response: function(response, field_el) { 

        var r = JSON.parse(response);
        if (r.success) {
            field_el.value = r.path; 
        }

    }
}
```

***

`fields` is an array of objects that follow the field's structure.

```
{
     fields: [
        {
            label: "Exemple of label 1",
            name: "field_name_1",
        },
        {
            label: "Exemple of label 2",
            name: "field_name_2"
        }
    ]
}
```

*** 

`label` is used to set the label of the field.

Default value : `Label N`

*** 

`name` is used to set the name of the field.

Default value : `field_N`

*** 

`type` is the type of fields (text, textarea, file, select, checkbox, radio, etc... )

Default value : `text`

*** 

`choices` is an array of string or object. You will use it when type is set to `checkbox`, `radio` or `select`.

Example with string.

```
{
    label: "Subject",
    name: "subject",
    type: "radio",
    choices: [ "Information request", "Billing", "Emergency", "Other" ]
}
```

Example with object.

```
{         
    label: "Subject",
    name: "subject",
    type: "radio",
    choices: [
        {label:"Information request", value: "information_request"},
        {label:"Billing", value: "billing"},
        {label:"Emergency", value: "emergency"},
        {label:"Other", value: "other"}
    ]
}
```

*** 

`multiple` is useful when using type `select` if you need to select multiple option.

*** 

`class` is used to add css classes on the dom element that wraps the field.

***

`condition` is a hook function that determines if a field should be visible.

For example, if you want the field `phone` to be visible only when the field `contact_method` is equal to `phone` you will write that.

```
{
    label: "Phone",
    name: "phone",
    type: "tel",
    condition: function(e) {

        for (let i = 0; i < e.fields.length; i++) {
            const field = e.fields[i];
            if (field.name == 'contact_method') { 
                return (field.value == 'phone');
            }
        }

    }
}
```

***

`branches`, `components`, `repeater` and `fields` are array of fields. 

***

`branches` is a structure where objects can be repeated and have children that contain the same fields. (Family tree, hierarchical representation)

```
{
    label: "Hierarchy",
    name: "hierarchy",
    add_childrens_label: 'Add Subitems',
    branches: [
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
    ]
}
```

***

`repeater` allow you to repeat fields. (List of tasks, Participants, Slider)

```
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
```

***

`fields` is a group of fields.

`components` is like a repeater with the possibility to choose the group of fields (or the field) you want to add.

```
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
                    type: "file",
                },
            ]
        },
        {
            label: "Content",
            name: "status",
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
```







