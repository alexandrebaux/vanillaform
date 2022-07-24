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

You can use both `VanillaForm(settings)` or `new VanillaForm(settings)`.

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

## General Settings

`el`

`submit_btn_label`

`endpoints`

`callbacks`

`fields`

## Fields

`label`

`name`

`type`

`condition`

`choices`

`branches`

`components`

`repeater`

`fields`

## Endpoints

`upload`

`action`

## Callbacks

`before_render`

`after_render`

`on_upload_response`

# Methods of VanillaForm Object

`render` method allow you to render the form in the dom element you specify during initialization. See `el` in settings section. This function does not receive parameters.

`set_values` method allow you to set form values. You must call render to see changes. This function does receive an object that contains the values.

```
form.set_values({
    firstname: 'John',
    lastname: 'Doe',
    email: 'john.doe@example.com',
    message: 'An exemple of message',
});
form.render();
```


