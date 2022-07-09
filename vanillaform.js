class vanillaform {

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

        return field;
        
    }

    render_fields (param) {

        var self = this;

        var fields = param.fields;
        var fields_el = document.createElement('div');

        if (param.class) {
            fields_el.classList.add(param.class);
        }

        for (let i = 0; i < fields.length; i++) {

            var field_el = document.createElement('div');
            field_el.classList.add('vanillaform__field');

            if (fields[i].class) { field_el.classList.add(fields[i].class); }

            var field_name = fields[i].name;
            if (param.prefix_fields_name) {
                field_name = param.prefix_fields_name + field_name;
            }

            var field_value = (fields[i].value) ? fields[i].value : null;

            if (fields[i].fieldtype != 'hidden')  {

                var label_el = document.createElement('label');
                label_el.classList.add('vanillaform__label');
                label_el.innerText = fields[i].label;
                label_el.setAttribute('for', field_name);

                field_el.appendChild(label_el);
                
            }

            if (fields[i].fields || fields[i].components || fields[i].branches) {

                var subfields_el_wrapper = document.createElement('div');
                subfields_el_wrapper.classList.add('vanillaform__subfields_wrapper');
                
                field_el.classList.add('vanillaform__field--has-subfield');
                
                if (fields[i].childrens) {

                    for (let j = 0; j < fields[i].childrens.length; j++) {
                        
                        var subfields_el = self.render_fields({
                            fields: fields[i].childrens[j],
                            prefix_fields_name: `${field_name}[${j}]`
                        });
                        subfields_el.classList.add('vanillaform__subfield');

                        var rm_btn = document.createElement('button');
                        rm_btn.classList.add('vanillaform__rmbtn');
                        rm_btn.innerText = '×';
                        rm_btn.addEventListener('click', function(e){
                            
                            e.preventDefault();

                            fields[i].childrens.splice(j, 1);

                            self.render();
            
                        });
                        subfields_el.appendChild(rm_btn);

                        (function(subfields_el){

                            var dragplaceholder = document.createElement('div');
                            dragplaceholder.classList.add('vanillaform__dragplaceholder');

                            var drag_btn = document.createElement('button');
                            drag_btn.classList.add('vanillaform__dragbtn');
                            drag_btn.innerText = '⋮';

                            var subfields_el_bound = null;
                            var subfields_el_bound_y = null;
                            
                            var mousemove_timeout = null;

                            var dX = 0;
                            var dY = 0;

                            var on_mousemove = function(e) {

                                e.preventDefault();

                                subfields_el_bound = subfields_el.getBoundingClientRect();
                                subfields_el_bound_y = subfields_el_bound.y || subfields_el_bound.top;
                                
                                subfields_el.style.top = `${e.clientY + dY}px`;
                                subfields_el.style.left = `${e.clientX + dX}px`;
                                subfields_el.style.zIndex = `2`;

                                if (mousemove_timeout) {
                                    clearTimeout(mousemove_timeout);
                                }

                                mousemove_timeout = setTimeout(function(){
                                
                                    var neighbors = [];
                                    for (let index = 0; index < subfields_el.parentElement.children.length; index++) {
                                        neighbors.push(subfields_el.parentElement.children[index]);
                                    }
                                    
                                    neighbors = neighbors.filter(function(el){
                                        return el != dragplaceholder;
                                    });
                                    
                                    neighbors = neighbors.map(function(el, index) {
                                        el.indexOfSameType = index;
                                        return el;
                                    });

                                    for (let k = 0; k < neighbors.length; k++) {
                                        var neighbor = neighbors[k];
                                        var neighbor_bound = neighbor.getBoundingClientRect();
                                        var neighbor_bound_y = neighbor_bound.y || neighbor_bound.top;
                                        
                                        var subfields_el_i = subfields_el.indexOfSameType;
                                        var neighbor_i = neighbor.indexOfSameType;
                                        
                                        var shouldIMoveUp = (neighbor_bound_y > subfields_el_bound_y) && (neighbor_i < subfields_el_i);
                                        var shouldIMoveDown = (neighbor_bound_y < subfields_el_bound_y) && (neighbor_i > subfields_el_i);
                                        
                                        // TODO - ISSUE - The orders of subfield is sometime destroyed when we swap parents item. (HARD)

                                        if (shouldIMoveUp) {

                                            neighbor.before(subfields_el);
                                            subfields_el.before(dragplaceholder);

                                            var tmp_index = fields[i].childrens[neighbor_i];
                                            fields[i].childrens[neighbor_i] = fields[i].childrens[subfields_el_i];
                                            fields[i].childrens[subfields_el_i] = tmp_index;

                                            break;

                                        } else if (shouldIMoveDown) {

                                            
                                            subfields_el.before(neighbor);
                                            subfields_el.before(dragplaceholder);

                                            var tmp_index = fields[i].childrens[neighbor_i];
                                            fields[i].childrens[neighbor_i] = fields[i].childrens[subfields_el_i];
                                            fields[i].childrens[subfields_el_i] = tmp_index;
                                            
                                            break;
                                        }
                                    }

                                }, 10);

                            };

                            
                            var on_mouseup = function(e) {

                                e.preventDefault();

                                document.removeEventListener('mousemove', on_mousemove);
                                document.removeEventListener('mouseup', on_mouseup);

                                self.render();

                
                            };

                            drag_btn.addEventListener('mousedown', function(e) {
                                
                                e.preventDefault();
                                
                                document.addEventListener('mousemove', on_mousemove);
                                document.addEventListener('mouseup', on_mouseup); 

                                subfields_el_bound = subfields_el.getBoundingClientRect();

                                var subfields_el_bound_x = subfields_el_bound.x || subfields_el_bound.left;
                                var subfields_el_bound_y = subfields_el_bound.y || subfields_el_bound.top;

                                dX = subfields_el_bound_x - e.clientX;
                                dY = subfields_el_bound_y - e.clientY;

                                dragplaceholder.style.width = `${subfields_el_bound.width}px`;
                                dragplaceholder.style.height = `${subfields_el_bound.height}px`;

                                subfields_el.style.position = `fixed`;
                                subfields_el.style.top = `${e.clientY + dY}px`;
                                subfields_el.style.left = `${e.clientX + dX}px`;
                                subfields_el.style.width = `${subfields_el_bound.width}px`;
                                subfields_el.style.height = `${subfields_el_bound.height}px`;
                                
                                subfields_el.before(dragplaceholder);

                                

                            });

                            drag_btn.addEventListener('click', function(e) {
                                e.preventDefault();
                            });


                            subfields_el.appendChild(drag_btn);

                        })(subfields_el);
                        
                        subfields_el_wrapper.appendChild(subfields_el);

                    }

                } else {
                    fields[i].childrens = [];
                }

                field_el.appendChild(subfields_el_wrapper);

                var add_btn = document.createElement('button');
                    add_btn.classList.add('vanillaform__addbtn');
                    add_btn.innerText = '+';

                if (fields[i].fields) {

                    var subfields = fields[i].settings.fields.map(function(field, index){
                            
                        return self.fix_field_data({
                            settings: field,
                            index: index
                        });
                        
                    });

                    
                    add_btn.addEventListener('click', function(e){
                        
                        e.preventDefault();

                        fields[i].childrens.push(subfields);

                        self.render();

                    });
                    field_el.appendChild(add_btn);

                } else if (fields[i].components) {

                    var subfields_components = fields[i].settings.components.map(function(field, index){
                            
                        return self.fix_field_data({
                            settings: field,
                            index: index
                        });
                        
                    });

                    var components_select = document.createElement('select');
                    
                    for (let l = 0; l < subfields_components.length; l++) {
                        
                        var components_select_option = document.createElement('option');
                        
                        components_select_option.innerText = subfields_components[l].label;
                        components_select_option.setAttribute('value', l);

                        components_select.appendChild(components_select_option);

                    }
                   
                    add_btn.addEventListener('click', function(e){
                        
                        e.preventDefault();

                        fields[i].childrens.push([subfields_components[components_select.value]]);

                        self.render();

                    });
                    field_el.appendChild(components_select);
                    field_el.appendChild(add_btn);

                } else if (fields[i].branches) {

                    var branches = fields[i].settings.branches.map(function(e){
                        return e;
                    });
                    
                    var childrens_label = fields[i].childrens_label || 'Add Childrens';
                    var childrens_name = fields[i].childrens_name ||  'childrens'

                    branches.push({
                        label: childrens_label, childrens_label: childrens_label,
                        name: childrens_name, childrens_name: childrens_name,
                        branches: branches.map(function(e){ return e; })
                    });

                    branches = branches.map(function(field, index){
                            
                        return self.fix_field_data({
                            settings: field,
                            index: index
                        });
                        
                    });

                    add_btn.addEventListener('click', function(e){
                        
                        e.preventDefault();

                        fields[i].childrens.push(branches);

                        self.render();

                    });
                    field_el.appendChild(add_btn);
                    
                }

                    
            } else if (fields[i].fieldtype)  {
    
                if (fields[i].fieldtype == 'textarea' ||
                    fields[i].fieldtype == 'wysiwyg')  {
    
                    var input_el = document.createElement('textarea');
                    input_el.setAttribute('name', field_name);
                    input_el.setAttribute('id', field_name);
                    input_el.addEventListener('input', function() { fields[i].value = this.value; });
                    
                    if (field_value) { input_el.innerHTML = field_value; }
    
                }
                else if (fields[i].fieldtype == 'image' ||
                        fields[i].fieldtype == 'file') {
    
                    var input_file = document.createElement('input');
                    input_file.setAttribute('type', 'file');
                    input_file.setAttribute('id', field_name);
                    input_file.classList.add('vanillaform__inputfile');

                    var input_label = document.createElement('label');
                    input_label.setAttribute('for', field_name);
                    input_label.innerText = (fields[i].input_label) ? fields[i].input_label : 'Select a file';
                    input_label.classList.add('vanillaform__inputfilelabel');

                    var input_hidden = document.createElement('div');
                    input_hidden.setAttribute('type', 'hidden');
                    input_hidden.setAttribute('name', field_name);
                    input_hidden.addEventListener('input', function() { fields[i].value = this.value; });

                    var input_el = document.createElement('div');
                    
                    input_el.appendChild(input_hidden);
                    input_el.appendChild(input_file);
                    input_el.appendChild(input_label);

                    if (field_value) { input_hidden.value = field_value; }


                    // Todo - Send File with Pure Ajax, Assign value and preview file. (MEDIUM)
                    // Must be configurable !!!
                    
    
                }
                else if (fields[i].fieldtype == 'checkbox' ||
                        fields[i].fieldtype == 'radio' ||
                        fields[i].fieldtype == 'select') {
    
                    var input_el = null;
                    if (fields[i].fieldtype == 'select') {
                        input_el = document.createElement('select');
                        input_el.addEventListener('input', function() { fields[i].value = this.value; });
                    } else {
                        input_el = document.createElement('div');
                        input_el.classList.add('vanillaform__group');
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

                            if (field_value == choice_value) { sub_input_el.setAttribute('selected', '');  }

                            input_el.appendChild(sub_input_el);
    
                        }  else {
                            
                            var sub_input_el_wrap = document.createElement('div');
                            sub_input_el_wrap.classList.add(`vanillaform__${fields[i].fieldtype}`);

                            var sub_input_el = document.createElement('input');
                            sub_input_el.setAttribute('type', fields[i].fieldtype);
                            sub_input_el.setAttribute('value', choice_value);
                            sub_input_el.setAttribute('id', `${field_name}[${j}]`);
                            sub_input_el.addEventListener('input', function() { fields[i].value = this.value; });
    
                            if (fields[i].multiple) {
                                sub_input_el.setAttribute('name', `${field_name}[]`);
                            } else {
                                sub_input_el.setAttribute('name', `${field_name}`);
                            }

                            if (field_value == choice_value) {  sub_input_el.setAttribute('checked', ''); }

                            sub_input_el_wrap.appendChild(sub_input_el);
    
                            var sub_label_el = document.createElement('label');
                            sub_label_el.innerText = choice_label;
                            sub_label_el.setAttribute('for', `${field_name}[${j}]`);    
                            sub_input_el_wrap.appendChild(sub_label_el);
                            
                            input_el.appendChild(sub_input_el_wrap);
                        }
                        
                    }
                    
                }
                else {
    
                    var input_el = document.createElement('input');
                    input_el.setAttribute('type', fields[i].fieldtype);
                    input_el.setAttribute('name', field_name);
                    input_el.setAttribute('id', field_name);
                    input_el.addEventListener('input', function() { fields[i].value = this.value; });

                    if (field_value) { input_el.setAttribute('value', field_value); }
                    
                }

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
        
        return self;

    }

    render () {

        var self = this;

        var fields_el = self.render_fields({fields: self.fields, class: 'vanillaform' });

        var submit_btn_wrap = document.createElement('div');
        submit_btn_wrap.classList.add('vanillaform__submit');

        var submit_btn = document.createElement('button');
        submit_btn.setAttribute('type','submit');
        submit_btn.innerText = 'Submit';
        submit_btn_wrap.appendChild(submit_btn);

        fields_el.appendChild(submit_btn_wrap);

        self.el.innerHTML = '';
        self.el.appendChild(fields_el);

        return self;
    }

}