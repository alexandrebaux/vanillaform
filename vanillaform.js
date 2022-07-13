class vanillaform {

    constructor (settings) {
        
        var self = this;
        self.settings = settings;
        
        self.el = self.settings.el;
        self.fields = self.duplicate_fields(self.settings.fields);   
    
    }
   
    fix_field_data (param) {

        var self = this;

        var field = {settings: param.settings};

        Object.assign(field, param.settings);

        if (!field.name) { field.name = `field_${param.index}`; }
        if (!field.label) { field.label = `Label ${param.index}`; }
        if (!field.type) { field.type = `text`; }

        if (field.fields || field.repeater || field.branches || field.components) { field.type = null; }

        return field;
        
    }

    duplicate_fields (fields) {

        var self = this;

        var clone = fields.map(function(field, index){
                                
            return self.fix_field_data({
                settings: field,
                index: index
            });
            
        });
    
        var clone = clone;
            clone = JSON.stringify(clone);
            clone = JSON.parse(clone);

        return clone;
    }

    removable (el, field, index) {

        var self = this;

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

    draguable (el, field) {

        var self = this;

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


    set_values (data, self_fields) {

        var self = this;

        var fields = self_fields || self.fields;

        //console.log(data, self_fields);

        for (let index = 0; index < fields.length; index++) {

            var value = data[fields[index].name];
        
            if (fields[index].repeater && value) {

                if (!fields[index].childrens) { fields[index].childrens = []; }
                for (var z = 0; z < value.length; z++) {
                    var element = value[z];
                    var cloned_fields = self.duplicate_fields(fields[index].settings.repeater);
                    fields[index].childrens.push(cloned_fields);
                }

                for (var z = 0; z < value.length; z++) {

                    var children = fields[index].childrens[z];
                    self.set_values(value[z], fields[index].childrens[z]);

                }


            } else if (fields[index].components && value) {

                for (var z = 0; z < value.length; z++) {
                    var element = value[z];
                    var keys = Object.keys(element);
                        
                    var cloned_field = null;
                    var cloned_fields = self.duplicate_fields(fields[index].settings.components); 
                    for (let c = 0; c < cloned_fields.length; c++) {
                        if (cloned_fields[c].name == keys[0]) {
                            cloned_field = cloned_fields[c];
                        }
                    }
                    
                    if (cloned_field) {

                        if (!fields[index].childrens) { fields[index].childrens = []; }
                        fields[index].childrens.push([cloned_field]);

                    }
    
                }
                
                for (var z = 0; z < value.length; z++) {

                    var children = fields[index].childrens[z];
                    var element = value[z];
                    var keys = Object.keys(element);
                    self.set_values(value[z][keys[0]], children[0].fields);

                }

            } else if (fields[index].branches && value) {

                var childrens_label = fields[index].childrens_label || 'Add Childrens';
                var childrens_name = fields[index].childrens_name ||  'childrens';

                if (!fields[index].childrens) { fields[index].childrens = []; }

                for (var z = 0; z < value.length; z++) {

                    var element = value[z];
                    
                    var cloned_fields = self.duplicate_fields(fields[index].settings.branches);

                    var childrens = self.duplicate_fields([{
                        label: childrens_label, childrens_label: childrens_label,
                        name: childrens_name, childrens_name: childrens_name,
                        branches: self.duplicate_fields(cloned_fields)
                    }]);

                    cloned_fields.push(childrens[0]);

                    fields[index].childrens.push(cloned_fields);

                }

                for (var z = 0; z < value.length; z++) {

                    var children = fields[index].childrens[z];
                    self.set_values(value[z], children);

                }
                
            } else if (fields[index].type) {

                fields[index].value = value;

            }
            
        }

        return self;
    }

    render_fields (param) {

        var self = this;

        var fields = param.fields;
        var fields_el = document.createElement('div');
        var current_depth = param.current_depth || 0;

        if (param.class) { fields_el.classList.add(param.class); }

        for (let i = 0; i < fields.length; i++) {

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

            if (fields[i].type != 'hidden')  {

                var label_el = document.createElement('label');
                label_el.classList.add('vanillaform__label');
                label_el.innerText = fields[i].label;
                label_el.setAttribute('for', field_name);

                field_el.appendChild(label_el);
                
            }

            if (fields[i].fields || fields[i].components || fields[i].repeater || fields[i].branches) {

                field_el.classList.add('vanillaform__field--has-subfield');
                
                if (fields[i].fields) {

                    var subfields_el = self.render_fields({
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
                        
                        var subfields_el = self.render_fields({
                            fields: fields[i].childrens[j],
                            prefix_fields_name: `${field_name}[${j}]`,
                            current_depth: current_depth + 1
                        });
                        subfields_el.classList.add('vanillaform__subfield');

                        self.removable(subfields_el, fields[i], j);
                        self.draguable(subfields_el, fields[i]);
                        
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

                    var cloned_fields = self.duplicate_fields(fields[i].settings.repeater);

                    add_btn.addEventListener('click', function(e){
                        
                        e.preventDefault();
                        
                        fields[i].childrens.push(cloned_fields);

                        self.render();

                    });

                    field_el.appendChild(add_btn);

                } else if (fields[i].components) {

                    var cloned_fields = self.duplicate_fields(fields[i].settings.components);

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
                    
                    var childrens_label = fields[i].childrens_label || 'Add Childrens';
                    var childrens_name = fields[i].childrens_name ||  'childrens'
                   
                    var cloned_fields = self.duplicate_fields(fields[i].settings.branches);
                    
                    var childrens = self.duplicate_fields([{
                        label: childrens_label, childrens_label: childrens_label,
                        name: childrens_name, childrens_name: childrens_name,
                        branches: self.duplicate_fields(cloned_fields)
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
    
                if (fields[i].type == 'textarea' ||
                    fields[i].type == 'wysiwyg')  {
    
                    var input_el = document.createElement('textarea');
                    input_el.setAttribute('name', field_name);
                    input_el.setAttribute('id', field_name);
                    input_el.addEventListener('input', function() { fields[i].value = this.value; });
                    
                    if (field_value) { input_el.innerHTML = field_value; }
    
                }
                else if (fields[i].type == 'image' ||
                        fields[i].type == 'file') {
    
                    var input_file = document.createElement('input');
                    input_file.setAttribute('type', 'file');
                    input_file.setAttribute('id', field_name);
                    input_file.classList.add('vanillaform__inputfile');

                    var img_preview = document.createElement('img');
                    img_preview.setAttribute('src', '');
                    img_preview.classList.add('vanillaform__img__preview');

                    input_file.addEventListener('change', function() {

                        if (self.settings.endpoints.upload && input_file.files.length > 0) {

                            let formData = new FormData();           
                            formData.append("file", input_file.files[0]);

                            var oReq = new XMLHttpRequest();
                            oReq.onload = function(e) {

                                if (self.settings.callbacks.on_upload_response) {

                                    self.settings.callbacks.on_upload_response(oReq.response, input_hidden);

                                    input_hidden.dispatchEvent(new Event('change'));

                                }
                                
                            };
                            oReq.open("POST", self.settings.endpoints.upload, true);
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
                        input_el.addEventListener('input', function() { fields[i].value = this.value; });
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

                            if (field_value == choice_value) { sub_input_el.setAttribute('selected', '');  }

                            input_el.appendChild(sub_input_el);
    
                        }  else {
                            
                            var sub_input_el_wrap = document.createElement('div');
                            sub_input_el_wrap.classList.add(`vanillaform__${fields[i].type}`);

                            var sub_input_el = document.createElement('input');
                            sub_input_el.setAttribute('type', fields[i].type);
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
                    input_el.setAttribute('type', fields[i].type);
                    input_el.setAttribute('name', field_name);
                    input_el.setAttribute('id', field_name);
                    input_el.addEventListener('input', function() { 

                        fields[i].value = this.value;
                    
                    });

                    if (field_value) { input_el.setAttribute('value', field_value); }
                    
                }

                field_el.appendChild(input_el);
                
            }
            
            fields_el.appendChild(field_el);

        }

        return fields_el;

    }



    render () {

        var self = this;

        if (self.callbacks && typeof self.callbacks.before_render == 'function') { self.callbacks.before_render(); }

        var fields_el = self.render_fields({fields: self.fields, class: 'vanillaform__content'});

        var submit_btn_wrap = document.createElement('div');
        submit_btn_wrap.classList.add('vanillaform__submit');

        var submit_btn = document.createElement('button');
        submit_btn.setAttribute('type','submit');
        submit_btn.innerText = self.settings.submit_btn_label || 'Submit';
        submit_btn_wrap.appendChild(submit_btn);

        fields_el.appendChild(submit_btn_wrap);

        var form = document.createElement('form');
        form.classList.add('vanillaform');
        form.setAttribute('method', self.settings.method || 'post');

        if (self.settings.endpoints) {
            form.setAttribute('action', self.settings.endpoints.action || '');
        } 

        form.appendChild(fields_el);

        self.el.innerHTML = '';
        self.el.appendChild(form);

        if (self.callbacks && typeof self.callbacks.after_render == 'function') { self.callbacks.after_render(); }

        return self;
    }

}