class pureform {

    constructor (settings) {
        
        var self = this;
        self.settings = settings;

        self.build();

    }

    fix_field_data (param) {

        var self = this;

        var field = {settings: param.settings};

        Object.assign(field, param.settings);

        if (!field.name) { field.name = `field_${param.index}`; }
        
        if (!field.label) { field.label = `Label ${param.index}`; }

        if (field.fields) { field.fields = []; }

        return field;
        
    }

    render_fields (param) {

        var self = this;

        var fields = param.fields;
        var fields_el = document.createElement('div');

        for (let i = 0; i < fields.length; i++) {

            var field_el = document.createElement('div');
            field_el.classList.add('pureform__field');

            var field_name = fields[i].name;
            if (param.prefix_fields_name) {
                field_name = param.prefix_fields_name + field_name;
            }

            var field_value = (fields[i].value) ? fields[i].value : null;

            if (fields[i].fieldtype != 'hidden')  {

                var label_el = document.createElement('label');
                label_el.classList.add('pureform__label');
                label_el.innerText = fields[i].label;
                label_el.setAttribute('for', field_name);

                field_el.appendChild(label_el);
                
            }

            if (fields[i].components) {

                    
            } else if (fields[i].fields) {

                field_el.classList.add('pureform__field--has-subfield');
                
                for (let j = 0; j < fields[i].fields.length; j++) {

                    var subfields_el = self.render_fields({
                        fields: fields[i].fields[j],
                        prefix_fields_name: `${field_name}[${j}]`
                    });
                    subfields_el.classList.add('pureform__subfield');

                    var rm_btn = document.createElement('button');
                    rm_btn.classList.add('pureform__rmbtn');
                    rm_btn.innerText = '×';
                    rm_btn.addEventListener('click', function(e){
                        
                        e.preventDefault();

                        fields[i].fields.splice(j, 1);

                        self.render();
        
                    });
                    subfields_el.appendChild(rm_btn);
        
                    var drag_btn = document.createElement('button');
                    drag_btn.classList.add('pureform__dragbtn');
                    drag_btn.innerText = '⋮';
                    drag_btn.addEventListener('click', function(e){

                        e.preventDefault();
        
                    });
                    subfields_el.appendChild(drag_btn);

                    field_el.appendChild(subfields_el);

                }
                
                var add_btn = document.createElement('button');
                add_btn.innerText = 'Add';
                add_btn.addEventListener('click', function(e){
                    
                    e.preventDefault();
                    
                    var subfields = fields[i].settings.fields.map(function(field, index){
                        
                        return self.fix_field_data({
                            settings: field,
                            index: index
                        });
                        
                    });

                    fields[i].fields.push(subfields);

                    self.render();

                });
                field_el.appendChild(add_btn);

                    
            } else if (fields[i].fieldtype)  {
    
                if (fields[i].fieldtype == 'textarea' ||
                    fields[i].fieldtype == 'wysiwyg')  {
    
                    var input_el = document.createElement('textarea');
                    input_el.setAttribute('name', field_name);
                    input_el.setAttribute('id', field_name);
                    if (field_value) {
                        input_el.innerHTML(field_value);
                    }
    
                }
                else if (fields[i].fieldtype == 'image' ||
                        fields[i].fieldtype == 'file') {
    
                    var input_el = document.createElement('input');
                    input_el.setAttribute('type', 'file');
                    input_el.setAttribute('name', field_name);
                    input_el.setAttribute('id', field_name);
                    if (field_value) {
                        // todo
                    }
                    
    
                }
                else if (fields[i].fieldtype == 'checkbox' ||
                        fields[i].fieldtype == 'radio' ||
                        fields[i].fieldtype == 'select') {
    
                    var input_el = null;
                    if (fields[i].fieldtype == 'select') {
                        input_el = document.createElement('select');
                    } else {
                        input_el = document.createElement('div');
                    }
                    
                    var choices = fields[i].choices;

                    if (fields[i].fieldtype == 'checkbox') {
                        fields[i].multiple = true;
                    } else if (fields[i].fieldtype == 'radio') {
                        fields[i].multiple = false;
                    }
                    
                    if (fields[i].fieldtype == 'select' && fields[i].multiple) {
                        input_el.setAttribute('name', `${field_name}[]`);
                        input_el.setAttribute('multiple', '');
                    } else {
                        input_el.setAttribute('name', `${field_name}`);
                    }
    
                    for (let j = 0; j < choices.length; j++) {
                        
                        var choice = choices[j];

                        var choice_label = '';
                        var choice_value = '';
    
                        if (typeof choice == 'string') {
                            choice_label = choice;
                            choice_value = choice; 
                        } else if (typeof choice == 'object') {
                            choice_label = choice.label;
                            choice_value = choice.value;
                        }
                        
                        if (fields[i].fieldtype == 'select') {
    
                            var sub_input_el = document.createElement('option');
                            sub_input_el.setAttribute('value', choice_value);
                            sub_input_el.innerText = choice_label;

                            if (field_value == choice_value) { 
                                sub_input_el.setAttribute('selected', '');
                            }

                            input_el.appendChild(sub_input_el);
    
                        }  else {
    
                            var sub_input_el = document.createElement('input');
                            sub_input_el.setAttribute('type', fields[i].fieldtype);
                            sub_input_el.setAttribute('value', choice_value);
                            sub_input_el.setAttribute('id', `${field_name}[${j}]`);
    
                            if (fields[i].multiple) {
                                sub_input_el.setAttribute('name', `${field_name}[]`);
                            } else {
                                sub_input_el.setAttribute('name', `${field_name}`);
                            }

                            if (field_value == choice_value) { 
                                sub_input_el.setAttribute('checked', '');
                            }
                            
                            input_el.appendChild(sub_input_el);
    
                            var sub_label_el = document.createElement('label');
                            sub_label_el.innerText = choice_label;
                            sub_label_el.setAttribute('for', `${field_name}[${j}]`);    
                            input_el.appendChild(sub_label_el);
    
                        }
                        
                    }
                    
                }
                else {
    
                    var input_el = document.createElement('input');
                    input_el.setAttribute('type', fields[i].fieldtype);
                    input_el.setAttribute('name', field_name);
                    input_el.setAttribute('id', field_name);
                    if (field_value) {
                        input_el.setAttribute('value', field_value);
                    }
                    
                }

                input_el.addEventListener('input', function() {
                    
                    fields[i].value = this.value;

                });

                field_el.appendChild(input_el);
                
            }
            
            fields_el.appendChild(field_el);

        }

        return fields_el;

    }

    build () {

        var self = this;
        self.el = self.settings.el;
        self.fields = (function(fields) {

            var arr = [];
            for (let i = 0; i < fields.length; i++) {

                var field = self.fix_field_data({
                    settings: fields[i],
                    index: i
                });
                arr.push(field);
    
            }

            return arr;

        })(self.settings.fields);     

    }

    render () {

        var self = this;

        

        var fields_el = self.render_fields({fields: self.fields });
        self.el.innerHTML = '';
        self.el.appendChild(fields_el);
        
    }

}