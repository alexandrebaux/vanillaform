class pureform {

    constructor(settings) {

        Object.assign(this, settings);

    }

    generate_field (opt) {
        
        var self = this;
        var parent = opt.parent;
        var before = opt.before;
        var after = opt.after;

        var field = opt.field;

        var field_index = opt.index;
        var field_count = 0;
        var force_initial_field_index = opt.force_initial_field_index || false;
        var force_next_initial_field_index = opt.force_next_initial_field_index || false;
        var disable_initial_field_index = opt.disable_initial_field_index || false;

        var hide_label = opt.hide_label || false;
        var hide_add_btn = opt.hide_add_btn  || false;
        
        var parent_field_name = opt.parent_field_name || '';
        
        if (parent_field_name && force_initial_field_index) {
            parent_field_name += `[${force_initial_field_index}]`;
        } else if (parent_field_name && !disable_initial_field_index) {
            parent_field_name += `[0]`;
        }

        var pure_field_name = field.name || `field_${field_index}`;
        
        var field_name =  parent_field_name + pure_field_name;

        var field_el = document.createElement('div');
        field_el.classList.add('pureform__field');

        if (field.fieldtype != 'hidden' && !hide_label)  {

            var label_el = document.createElement('label');
            label_el.classList.add('pureform__label');
            label_el.innerText = field.label || `Field ${field_index}`;
            label_el.setAttribute('for', field_name);
            field_el.appendChild(label_el);
            
        }
        
        if (field.fields) {

            field_el.classList.add('pureform__field--has-subfield');

            var field_sub_el = document.createElement('div');
            field_sub_el.classList.add('pureform__subfield');

            for (let index = 0; index < field.fields.length; index++) {

                var sub_opt = {
                    parent: field_sub_el,
                    field: field.fields[index],
                    index: index,
                    parent_field_name: field_name
                };

                if (force_next_initial_field_index) {
                    sub_opt.force_initial_field_index = force_next_initial_field_index;
                }

                self.generate_field(sub_opt);

            }

            field_el.append(field_sub_el);

            var rm_btn = document.createElement('button');
            rm_btn.classList.add('pureform__rmbtn');
            rm_btn.innerText = '×';
            rm_btn.addEventListener('click', function(e){
                
                e.preventDefault();

            });
            field_sub_el.appendChild(rm_btn);

            var drag_btn = document.createElement('button');
            drag_btn.classList.add('pureform__dragbtn');
            drag_btn.innerText = '⋮';
            drag_btn.addEventListener('click', function(e){
                
                e.preventDefault();

            });
            field_sub_el.appendChild(drag_btn);

            if (!hide_add_btn) {
                var add_btn = document.createElement('button');
                add_btn.innerText = 'Add';
                add_btn.addEventListener('click', function(e){
                    
                    e.preventDefault();
                    self.generate_field({
                        before: add_btn,
                        field: field,
                        parent_field_name: parent_field_name,
                        hide_label: true,
                        hide_add_btn: true,
                        index: field_index,
                        disable_initial_field_index: true,
                        force_next_initial_field_index: ++field_count
                    });
                    
                });
                field_el.append(add_btn);
            }   
                   
        } else if (field.fieldtype)  {

            if (field.fieldtype == 'textarea' || field.fieldtype == 'wysiwyg')  {

                var input_el = document.createElement('textarea');
                input_el.setAttribute('name', field_name);
                input_el.setAttribute('id', field_name);

            }
            else if (field.fieldtype == 'image' || field.fieldtype == 'file') {

                var input_el = document.createElement('input');
                input_el.setAttribute('type', 'file');
                input_el.setAttribute('name', field_name);
                input_el.setAttribute('id', field_name);

            }
            else if (field.fieldtype == 'checkbox' || field.fieldtype == 'radio' || field.fieldtype == 'select') {

                var input_el = (field.fieldtype == 'select') ? document.createElement('select') : document.createElement('div');
                var choices = field.choices;

                if (field.fieldtype == 'checkbox') {
                    field.multiple = true;
                } else if (field.fieldtype == 'radio') {
                    field.multiple = false;
                }
                
                if (field.fieldtype == 'select' && field.multiple) {
                    input_el.setAttribute('name', `${field_name}[]`);
                } else {
                    input_el.setAttribute('name', `${field_name}`);
                }

                for (let index = 0; index < choices.length; index++) {
                    const choice = choices[index];

                    var choice_label = '';
                    var choice_value = '';

                    if (typeof choice == 'string') {
                        choice_label = choice;
                        choice_value = choice; 
                    } else if (typeof choice == 'object') {
                        choice_label = choice.label;
                        choice_value = choice.value;
                    }
                    
                    if (field.fieldtype == 'select') {

                        var sub_input_el = document.createElement('option');
                        sub_input_el.setAttribute('value', choice_value);
                        sub_input_el.innerText = choice_label;
                        input_el.appendChild(sub_input_el);

                    }  else {

                        var sub_input_el = document.createElement('input');
                        sub_input_el.setAttribute('type', field.fieldtype);
                        sub_input_el.setAttribute('value', choice_value);
                        sub_input_el.setAttribute('id', `${field_name}[${index}]`);

                        if (field.multiple) {
                            sub_input_el.setAttribute('name', `${field_name}[]`);
                        } else {
                            sub_input_el.setAttribute('name', `${field_name}`);
                        }
                        
                        input_el.appendChild(sub_input_el);

                        var sub_label_el = document.createElement('label');
                        sub_label_el.innerText = choice_label;
                        sub_label_el.setAttribute('for', `${field_name}[${index}]`);    
                        input_el.appendChild(sub_label_el);

                    }
                    
                }
                

            }
            else {

                var input_el = document.createElement('input');
                input_el.setAttribute('type', field.fieldtype);
                input_el.setAttribute('name', field_name);
                input_el.setAttribute('id', field_name);
                
            }

            field_el.append(input_el);

        }
        
        if (parent) {
            parent.append(field_el);
        } else if (after) {
            after.after(field_el);
        } else if (before) {
            before.parentNode.insertBefore(field_el, before);
        }
        

    }

    generate_fields() {

        var self = this;
        var el = self.el;
        var fields = self.fields;

        el.classList.add('pureform');

        for (let index = 0; index < fields.length; index++) {
            
            self.generate_field({
                parent: el,
                field: fields[index],
                index: index
            });

        }

    }
}