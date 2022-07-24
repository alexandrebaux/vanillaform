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



