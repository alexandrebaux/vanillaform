function VanillaForm(settings) {
    
    /**
     * Private
     */

    var main_add_childrens_label = 'Add childrens';
    var main_childrens_name = 'childrens';
   
    var fix_field_data = function  (param) {

        var field = {settings: param.settings};

        Object.assign(field, param.settings);

        if (!field.name) { field.name = `field_${param.index}`; }
        if (!field.label) { field.label = `Label ${param.index}`; }
        if (!field.type) { field.type = `text`; }

        if (field.fields || field.repeater || field.branches || field.components) { field.type = null; }

        return field;
        
    }

    var deep_clone = function(obj) {

        if (!obj) { return obj;}

        var clone = {};
        var keys = Object.keys(obj);
        for (let i = 0; i < keys.length; i++) {
            
            const key = keys[i];
            if (typeof obj[key] != 'object') {
                clone[key] = obj[key];
            } else {
                clone[key] = deep_clone(obj[key]);
            }

        }

        return obj;

    };

    var duplicate_fields = function  (fields) {

        var clone = fields.map(function(field, index){
                                
            var fixed_field = fix_field_data({
                settings: field,
                index: index
            });
            

            var cloned_fixed_field = deep_clone(fixed_field);

            return cloned_fixed_field;
            
        });
    
        return clone;
    }

    var removable = function  (el, field, index) {

        var rm_btn = document.createElement('button');
        rm_btn.classList.add('vanillaform__rmbtn');
        rm_btn.innerText = '×';
        rm_btn.addEventListener('click', function(e){
            
            e.preventDefault();

            field.childrens.splice(index, 1);

            self.render();

        });
        el.appendChild(rm_btn);

        return true;
    }

    var draguable = function  (el, field) {

        var dragplaceholder = document.createElement('div');
        dragplaceholder.classList.add('vanillaform__dragplaceholder');

        var drag_btn = document.createElement('button');
        drag_btn.classList.add('vanillaform__dragbtn');
        drag_btn.innerText = '⋮';

        var el_bound = null;
        var el_bound_y = null;
        
        var mousemove_timeout = null;

        var dX = 0;
        var dY = 0;

        var on_mousemove = function(e) {

            e.preventDefault();

            el_bound = el.getBoundingClientRect();
            el_bound_y = el_bound.y || el_bound.top;
            
            el.style.top = `${e.clientY + dY}px`;
            el.style.left = `${e.clientX + dX}px`;
            el.style.zIndex = `2`;

            if (mousemove_timeout) {
                clearTimeout(mousemove_timeout);
            }

            mousemove_timeout = setTimeout(function(){
            
                var neighbors = [];
                for (let index = 0; index < el.parentElement.children.length; index++) {
                    neighbors.push(el.parentElement.children[index]);
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
                    
                    var el_i = el.indexOfSameType;
                    var neighbor_i = neighbor.indexOfSameType;
                    
                    var shouldIMoveUp = (neighbor_bound_y > el_bound_y) && (neighbor_i < el_i);
                    var shouldIMoveDown = (neighbor_bound_y < el_bound_y) && (neighbor_i > el_i);

                    if (shouldIMoveUp || shouldIMoveDown) {

                        if (shouldIMoveUp) { neighbor.before(el); }
                        if (shouldIMoveDown) { el.before(neighbor); }

                        el.before(dragplaceholder);

                        if (field) {

                            var index_a = field.childrens[neighbor_i];
                            var index_b = field.childrens[el_i];
    
                            field.childrens[neighbor_i] = index_b;
                            field.childrens[el_i] = index_a;

                        }
                        
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

        var on_mousedown = function(e) {
            
            e.preventDefault();
            
            document.addEventListener('mousemove', on_mousemove);
            document.addEventListener('mouseup', on_mouseup); 

            el_bound = el.getBoundingClientRect();

            el.classList.add('vanillaform__dragging');

            var el_bound_x = el_bound.x || el_bound.left;
            var el_bound_y = el_bound.y || el_bound.top;

            dX = el_bound_x - e.clientX;
            dY = el_bound_y - e.clientY;

            dragplaceholder.style.width = `${el_bound.width}px`;
            dragplaceholder.style.height = `${el_bound.height}px`;

            el.style.position = `fixed`;
            el.style.top = `${e.clientY + dY}px`;
            el.style.left = `${e.clientX + dX}px`;
            el.style.width = `${el_bound.width}px`;
            el.style.height = `${el_bound.height}px`;
            
            el.before(dragplaceholder);

        }

        drag_btn.addEventListener('mousedown', on_mousedown);

        drag_btn.addEventListener('click', function(e) { e.preventDefault(); });

        el.appendChild(drag_btn);

        return true;

    }

    var render_fields = function  (param) {

        var fields = param.fields;
        var fields_el = document.createElement('div');
        var current_depth = param.current_depth || 0;

        if (param.class) { fields_el.classList.add(param.class); }

        for (let i = 0; i < fields.length; i++) {

            if (typeof fields[i].condition == 'function') {

                if (!fields[i].condition({
                    el : private_el,
                    settings: private_settings,
                    fields: private_fields,
                    neighbors: fields,
                    field: fields[i]
                })) {
                    continue;
                }

            }

            var field_el = (function() {

                var field_el = document.createElement('div');
                field_el.classList.add('vanillaform__field');

                if (fields[i].class) { field_el.classList.add(fields[i].class); }

                var field_name = fields[i].name;
                if (current_depth > 0)  {
                    field_name = `[${field_name}]`;
                }

                if (param.prefix_fields_name) {
                    field_name = param.prefix_fields_name + field_name;
                }

                var field_value = (fields[i].value) ? fields[i].value : null;

                var label_el = document.createElement('label');
                label_el.classList.add('vanillaform__label');
                label_el.innerText = fields[i].label;
                label_el.setAttribute('for', field_name);

                if (fields[i].type != 'hidden')  {

                    field_el.appendChild(label_el);
                    
                }

                if (fields[i].fields || fields[i].components || fields[i].repeater || fields[i].branches) {


                    field_el.classList.add('vanillaform__field--has-subfield');
                    
                    if (fields[i].fields) {

                        var subfields_el = render_fields({
                            fields: fields[i].fields,
                            prefix_fields_name: `${field_name}`,
                            current_depth: current_depth + 1
                        });

                        subfields_el.classList.add('vanillaform__fields');

                        field_el.appendChild(subfields_el);

                    }
                    
                    if (fields[i].childrens) {

                        var subfields_el_wrapper = document.createElement('div');
                        subfields_el_wrapper.classList.add('vanillaform__subfields_wrapper');

                        for (let j = 0; j < fields[i].childrens.length; j++) {
                            
                            var subfields_el = render_fields({
                                fields: fields[i].childrens[j],
                                prefix_fields_name: `${field_name}[${j}]`,
                                current_depth: current_depth + 1
                            });
                            subfields_el.classList.add('vanillaform__subfield');

                            removable(subfields_el, fields[i], j);
                            draguable(subfields_el, fields[i]);
                            
                            subfields_el_wrapper.appendChild(subfields_el);

                        }

                        field_el.appendChild(subfields_el_wrapper);

                    } else {
                        fields[i].childrens = [];
                    } 

                    var add_btn = document.createElement('button');
                        add_btn.classList.add('vanillaform__addbtn');
                        add_btn.innerText = '+';


                    if (fields[i].repeater) {

                        var cloned_fields = duplicate_fields(fields[i].settings.repeater);

                        add_btn.addEventListener('click', function(e){
                            
                            e.preventDefault();
                            
                            fields[i].childrens.push(cloned_fields);

                            self.render();

                        });

                        field_el.appendChild(add_btn);

                    } else if (fields[i].components) {

                        var cloned_fields = duplicate_fields(fields[i].settings.components);

                        var components_select = document.createElement('select');       
                        for (let l = 0; l < cloned_fields.length; l++) {      
                            var components_select_option = document.createElement('option');
                            components_select_option.innerText = cloned_fields[l].label;
                            components_select_option.setAttribute('value', l);
                            components_select.appendChild(components_select_option);
                        }
                    
                        add_btn.addEventListener('click', function(e){
                            
                            e.preventDefault();
                            
                            var cloned_field = cloned_fields[components_select.value];
                            fields[i].childrens.push([cloned_field]);

                            self.render();

                        });

                        var components_select_wrap = document.createElement('div');
                        components_select_wrap.classList.add('vanillaform__componentsaction');
                        components_select_wrap.appendChild(components_select);
                        components_select_wrap.appendChild(add_btn);

                        field_el.appendChild(components_select_wrap);

                    } else if (fields[i].branches) {
                        
                        var add_childrens_label = fields[i].add_childrens_label || main_add_childrens_label;
                        var childrens_name = fields[i].childrens_name ||  main_childrens_name
                    
                        var cloned_fields = duplicate_fields(fields[i].settings.branches);
                        
                        var childrens = duplicate_fields([{
                            label: add_childrens_label, add_childrens_label: add_childrens_label,
                            name: childrens_name, childrens_name: childrens_name,
                            branches: duplicate_fields(cloned_fields),
                            condition: fields[i].condition
                        }]);

                        cloned_fields.push(childrens[0]);

                        add_btn.addEventListener('click', function(e){
                            
                            e.preventDefault();

                            fields[i].childrens.push(cloned_fields);

                            self.render();

                        });

                        field_el.appendChild(add_btn);
                        
                    }

                        
                } else if (fields[i].type)  {
        
                    if (fields[i].type == 'textarea')  {
        
                        var input_el = document.createElement('textarea');
                        input_el.setAttribute('name', field_name);
                        input_el.setAttribute('id', field_name);
                        input_el.addEventListener('input', function() { fields[i].value = this.value; });

                        if (fields[i].watch) {
                            input_el.addEventListener('change', function() { self.render(); });
                        }
                        
                        if (field_value) { input_el.innerHTML = field_value; }
        
                    }
                    else if (fields[i].type == 'file') {
        
                        var input_file = document.createElement('input');
                        input_file.setAttribute('type', 'file');
                        input_file.setAttribute('id', field_name);
                        input_file.classList.add('vanillaform__inputfile');

                        var img_preview = document.createElement('img');
                        img_preview.setAttribute('src', '');
                        img_preview.classList.add('vanillaform__img__preview');

                        input_file.addEventListener('change', function() {

                            if (private_settings.endpoints.upload && input_file.files.length > 0) {

                                let formData = new FormData();           
                                formData.append("file", input_file.files[0]);

                                var oReq = new XMLHttpRequest();
                                oReq.onload = function(e) {

                                    if (private_settings.callbacks.on_upload_response) {

                                        private_settings.callbacks.on_upload_response(oReq.response, input_hidden);

                                        input_hidden.dispatchEvent(new Event('change'));

                                    }
                                    
                                };
                                oReq.open("POST", private_settings.endpoints.upload, true);
                                oReq.send(formData);

                            }
                            
                        });

                        var button_label = document.createElement('label');
                        button_label.setAttribute('for', field_name);
                        button_label.innerText = (fields[i].button_label) ? fields[i].button_label : 'Select a file';
                        button_label.classList.add('vanillaform__inputfilelabel');

                        var input_hidden = document.createElement('input');
                        input_hidden.setAttribute('type', 'hidden');
                        input_hidden.setAttribute('name', field_name);

                        if (field_value) { input_hidden.value = field_value; }

                        input_hidden.addEventListener('change', function() {

                            var v = this.value;

                            fields[i].value = v;

                            img_preview.setAttribute("src", v);

                        });
                        input_hidden.dispatchEvent(new Event('change'));

                        var input_el = document.createElement('div');
                        input_el.appendChild(input_hidden);
                        input_el.appendChild(img_preview);
                        input_el.appendChild(input_file);
                        input_el.appendChild(button_label); 

                    }
                    else if (fields[i].type == 'checkbox' ||
                            fields[i].type == 'radio' ||
                            fields[i].type == 'select') {
        
                        var input_el = null;
                        if (fields[i].type == 'select') {
                            input_el = document.createElement('select');
                            input_el.addEventListener('input', function() {

                                var val = this.value;
                                if (fields[i].multiple) {

                                    if (typeof fields[i].value != 'object') {
                                        fields[i].value = [];
                                    }

                                    if (this.selected && fields[i].value.indexOf(val) == -1) {
                                        fields[i].value.push(val);
                                    }

                                    if (!this.selected) {
                                        fields[i].value = fields[i].value.filter(function(e){
                                            return e != val;
                                        });
                                    }

                                } else {
                                    fields[i].value = val;
                                }
                            });
                            input_el.addEventListener('change', function() { self.render(); });
                        } else {
                            input_el = document.createElement('div');
                            input_el.classList.add('vanillaform__group');
                        }
        
                        if (fields[i].type == 'checkbox') {
                            fields[i].multiple = true;
                        } else if (fields[i].type == 'radio') {
                            fields[i].multiple = false;
                        }
                        
                        if (fields[i].type == 'select' && fields[i].multiple) {
                            input_el.setAttribute('name', `${field_name}[]`);
                            input_el.setAttribute('multiple', '');
                        }else if (fields[i].type == 'select') {
                            input_el.setAttribute('name', `${field_name}`);
                        }

                        var choices = fields[i].choices;
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
                            
                            if (fields[i].type == 'select') {
        
                                var sub_input_el = document.createElement('option');
                                sub_input_el.setAttribute('value', choice_value);
                                sub_input_el.innerText = choice_label;

                                if (fields[i].multiple && field_value && field_value.indexOf(choice_value) > -1) {

                                    sub_input_el.setAttribute('selected', '');

                                } else if (field_value == choice_value) { 

                                    sub_input_el.setAttribute('selected', '');
                                    
                                }

                                input_el.appendChild(sub_input_el);
        
                            }  else {
                                
                                var sub_input_el_wrap = document.createElement('div');
                                sub_input_el_wrap.classList.add(`vanillaform__${fields[i].type}`);

                                var sub_input_el = document.createElement('input');
                                sub_input_el.setAttribute('type', fields[i].type);
                                sub_input_el.setAttribute('value', choice_value);
                                sub_input_el.setAttribute('id', `${field_name}[${j}]`);
                                sub_input_el.addEventListener('change', function() { self.render(); });


                                sub_input_el.addEventListener('input', function() { 
                                    
                                    var val = this.value;

                                    if (fields[i].multiple) {

                                        if (typeof fields[i].value != 'object') {
                                            fields[i].value = [];
                                        }

                                        if (this.checked && fields[i].value.indexOf(val) == -1) {
                                            fields[i].value.push(val);
                                        }

                                        if (!this.checked) {
                                            fields[i].value = fields[i].value.filter(function(e){
                                                return e != val;
                                            });
                                        }

                                    } else {

                                        fields[i].value = val;

                                    }

                                
                                });
                                
                                if (fields[i].multiple) {

                                    sub_input_el.setAttribute('name', `${field_name}[]`);

                                    if (field_value && field_value.indexOf(choice_value) > -1) {

                                        sub_input_el.setAttribute('checked', '');

                                    }

                                } else {

                                    sub_input_el.setAttribute('name', `${field_name}`);

                                    if (field_value == choice_value) {
                                        sub_input_el.setAttribute('checked', '');
                                    }

                                }

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
                        input_el.setAttribute('type', fields[i].type);
                        input_el.setAttribute('name', field_name);
                        input_el.setAttribute('id', field_name);
                        input_el.addEventListener('input', function() { 

                            fields[i].value = this.value;
                        
                        });
                        
                        if (fields[i].watch) {
                            input_el.addEventListener('change', function() { self.render(); });
                        }

                        if (field_value) { input_el.setAttribute('value', field_value); }
                        
                    }

                    field_el.appendChild(input_el);
                    
                }
                
                return field_el;


            })();

            fields_el.appendChild(field_el);
        }

        return fields_el;

    }

    
    var self = {}; 
    var private_settings = settings;
    var private_el = private_settings.el;
    var private_fields = duplicate_fields(private_settings.fields);

    /**
     * PUBLIC
     */

    

    self.set_values = function (data, self_fields) {

        var fields = self_fields || private_fields;

        for (let i = 0; i < fields.length; i++) {

            var value = data[fields[i].name];

            if (fields[i].fields && value) {

                self.set_values(value, fields[0].fields);

            } else if (fields[i].repeater && value) {

                if (!fields[i].childrens) { fields[i].childrens = []; }

                for (var z = 0; z < value.length; z++) {
                    var element = value[z];
                    var cloned_fields = duplicate_fields(fields[i].settings.repeater);
                    fields[i].childrens.push(cloned_fields);
                }

                for (var z = 0; z < value.length; z++) {

                    var children = fields[i].childrens[z];
                    self.set_values(value[z], fields[i].childrens[z]);

                }


            } else if (fields[i].components && value) {

                for (var z = 0; z < value.length; z++) {
                    var element = value[z];
                    var keys = Object.keys(element);
                        
                    var cloned_field = null;
                    var cloned_fields = duplicate_fields(fields[i].settings.components); 
                    for (let c = 0; c < cloned_fields.length; c++) {
                        if (cloned_fields[c].name == keys[0]) {
                            cloned_field = cloned_fields[c];
                        }
                    }
                    
                    if (cloned_field) {

                        if (!fields[i].childrens) { fields[i].childrens = []; }
                        fields[i].childrens.push([cloned_field]);

                    }
    
                }
                
                for (var z = 0; z < value.length; z++) {

                    var children = fields[i].childrens[z];
                    self.set_values(value[z], children);

                }

            } else if (fields[i].branches && value) {

                var add_childrens_label = fields[i].add_childrens_label || main_add_childrens_label;
                var childrens_name = fields[i].childrens_name ||  main_childrens_name;

                if (!fields[i].childrens) { fields[i].childrens = []; }

                for (var z = 0; z < value.length; z++) {

                    var element = value[z];
                    
                    var cloned_fields = duplicate_fields(fields[i].settings.branches);

                    var childrens = duplicate_fields([{
                        label: add_childrens_label, add_childrens_label: add_childrens_label,
                        name: childrens_name, childrens_name: childrens_name,
                        branches: duplicate_fields(cloned_fields),
                        condition: fields[i].condition
                    }]);

                    cloned_fields.push(childrens[0]);

                    fields[i].childrens.push(cloned_fields);

                }

                for (var z = 0; z < value.length; z++) {

                    var children = fields[i].childrens[z];
                    self.set_values(value[z], children);

                }
                
            } else if (fields[i].type) {

                fields[i].value = value;

            }
            
        }

        return self;
    }

    self.render = function () {

        if (self.callbacks && typeof self.callbacks.before_render == 'function') { self.callbacks.before_render(); }

        var fields_el = render_fields({fields: private_fields, class: 'vanillaform__content'});

        var submit_btn_wrap = document.createElement('div');
        submit_btn_wrap.classList.add('vanillaform__submit');

        var submit_btn = document.createElement('button');
        submit_btn.setAttribute('type','submit');
        submit_btn.innerText = private_settings.submit_btn_label || 'Submit';
        submit_btn_wrap.appendChild(submit_btn);

        fields_el.appendChild(submit_btn_wrap);

        var form = document.createElement('form');
        form.classList.add('vanillaform');
        form.setAttribute('method', private_settings.method || 'post');

        if (private_settings.endpoints) {
            form.setAttribute('action', private_settings.endpoints.action || '');
        } 

        form.appendChild(fields_el);

        private_el.innerHTML = '';
        private_el.appendChild(form);

        if (self.callbacks && typeof self.callbacks.after_render == 'function') { self.callbacks.after_render(); }

        return self;
    }

    return self;

}