/*
 *  Project: jquery.adminseo
 *  Description: 
 *  Author: Leandro Rodrigues<leandrorodriguescastro@gmail.cm>
 *  License: 
 */

;(function ( $, window, undefined ) {
    
    var slug = function(str) {
		str = str.replace(/^\s+|\s+$/g, ''); // trim
		str = str.toLowerCase();

		// remove accents, swap ñ for n, etc
		var from = "ãàáäâẽèéëêìíïîõòóöôùúüûñç·/_,:;";
		var to   = "aaaaaeeeeeiiiiooooouuuunc------";
		for (var i=0, l=from.length ; i<l ; i++) {
			str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
		}

		str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
			.replace(/\s+/g, '-') // collapse whitespace and replace by -
			.replace(/-+/g, '-'); // collapse dashes

		return str;
	};
	
	var description = function(value) {
		//Máximo aproveitado pelo google:
		value = value.substring(0,155);
		
		//Última linha:
		position = value.length - value.split("").reverse().join("").indexOf('.');
		
		if(position == -1) {
			//Não cortar palavra, procurar pelo espaço
			position = value.length - value.split("").reverse().join("").indexOf(' ');
		}
		
		value = value.substring(0, position);
		
		return value;
	};
	
	var keyWords = function(value) {
		var counts = [];
		var words = value.split(/[\s,-]+/);
		
		//montando array com as contagens
		for(var i = 0; i < words.length; i++) {
			var word = words[i].toLowerCase();
			if(word.length > 3 && !word.match(/para|mais|desta/)) {
				counts[word] = (counts[word] || 0) + 1;
			}
		}
	
		//montando array com as palavras por numero de repetições
		var wordCounts = [];
		for(var word in counts) {
			if(typeof(wordCounts[counts[word]]) == 'undefined') {
				wordCounts[counts[word]] = [word];
			}
			else {
				wordCounts[counts[word]].push(word);
			}
		}
		
		//juntando as mais repetidas
		var keywords = "";
		var count = 0;
		for(var i in wordCounts.reverse()) {
			for(j in wordCounts[i]) {
				if(count >= 6)
					break;
				word = wordCounts[i][j];
				var temp = keywords + word + ", ";
				if(temp.length <= 150){
					keywords = temp;
					count ++;
				}
				else break;
			}
		}
		keywords = keywords.substring(0 , keywords.length - 2);
		
		return keywords;
	};

	 var pluginName = 'adminseo',
     document = window.document,
     defaults = {
         titleField: "#titulo",
         slugField: "#slug",
         textField: "#texto",
         descriptionField: "#description",
         keywordsField: "#keywords",
         
         remoteCheck: false,
         ckEditor: false
	 };
	
    // The actual plugin constructor
    function Plugin( element, options ) {
        this.element = element;

        this.options = $.extend( {}, defaults, options) ;
        
        this._defaults = defaults;
        this._name = pluginName;
        
        this.init();
    }

    Plugin.prototype.init = function () {
    	var self = this;
	
    	//slug:
    	$(self.options.titleField).blur(function() {
    		var value = $(this).val();
    		value = slug(value);
    		
    		var i = 0;
    		var valueAux = value;
    		
    		if(self.options.remoteCheck === false) {
    			$(self.options.slugField).val(value);
    		}
    		else {
	    		var trySlug = function() {
	    			$.get(remoteCheck + value, function(exists){
	    				if(exists) {
	    					i++;
	    					value = valueAux + '-' + i.toString();
	    					trySlug(value);
	    				}
	    				else {
	    					$(self.options.slugField).val(value);
	    				}
	    			});
	    		};
	    		trySlug(value);
    		}
    	});
    	
    	var change = function(value) {   		
    		if($(self.options.descriptionField).val() == ''){
    			console.log(value);
    			$(self.options.descriptionField).val(description(value));
    		}
    		if($(self.options.keywordsField).val() == ''){
    			$(self.options.keywordsField).val(keyWords(value));
    		}
    	}
    	
    	if(self.options.ckEditor === false) {
    		$(self.options.textField).blur(function() { change($(self.options.textField).val()); });
    	}
    	else {
    		value = $.trim($(self.options.ckEditor.getData()).text());
    		self.options.ckEditor.on('blur', function() { change(value); });
    	}
    	
    };

    // A really lightweight plugin wrapper around the constructor,
    // preventing against multiple instantiations
    $.fn[pluginName] = function ( options ) {
        return this.each(function () {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName, new Plugin( this, options ));
            }
        });
    };

}(jQuery, window));