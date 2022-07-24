# Include `JavaScript` and `CSS`.

```
<script src="vanillaform.js"></script>
<link rel="stylesheet" href="vanillaform.css">
```

`vanillaform.js` is the master file of this project. It contains one main JavaScript function called `VanillaForm`.

`vanillaform.css` give you a basic CSS code that you can adapt to your needs.

# Basic HTML Layout

```
<div class="targeted-wrapper"></div>
<style>
    .targeted-wrapper { 
        width: 768px;
        margin: 1em auto;
    }
</style>
```

# Initialize VanillaForm

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

## Exemple of Initialization

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

# Settings

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

`before_render`

`after_render`

`on_upload_response`

***

`fields` is an array of objects that follow the field's structure.

```
{
     fields: [
        {
            label: "Exemple of label",
            name: "fieldname"
        }
    ]
}
```

`label`

`name`

`type`

`class`

`condition`

`choices`

`branches`

`components`

`repeater`

`fields`



