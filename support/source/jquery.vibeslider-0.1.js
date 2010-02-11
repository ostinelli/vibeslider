/**
 *  jQuery vibeSlider  Plugin
 *  @requires jQuery v1.3
 *  http://code.google.com/p/vibeslider/
 *
 *  Copyright (c)  Roberto Ostinelli (ostinelli.net)
 *  Released under the MIT license:
 *  http://www.opensource.org/licenses/mit-license.php
 * 
 *  Version: 0.1
 */

(function($) {
	// utility round function
	function roundTo(decimals){
		var i = this * Math.pow(10, decimals);
		i = Math.round(i);
		return i / Math.pow(10, decimals);
	}
	Number.prototype.roundTo = roundTo;
	// vibeSlider constructor
	var vibeSliderObj = function() { this.initialize.apply(this, arguments); };
	vibeSliderObj.prototype = {
		// variables
		value: 0,
		size: 0,
		knobSize: 0,
		knobSpace: 0,
		orientation: null,	// 0: horizontal, 1: vertical
		knobMouseDelta: 0,
		dragging: false,
		space: 0,
		opts: null,
		// objects
		$this: null,
		knob: null,
		/*******************************************
		  * init
		  */
		initialize: function(el, opts){
			// init
			var self = this;
			self.opts = opts;
			// objs
			this.$this = $(el);
			// add knob
			this.$this.append('<div></div>');			
			this.knob = this.$this.children('div');
			this.knob.css('position', 'absolute');
			this.knob.css('cursor', 'pointer');
			this.knob.css('margin', '0');
			this.knob.css('padding', '0');
			// get knob width on window load -> safari issue
			$(window).load(function(){
				self.initOnLoad();
			});
		},
		
		/*******************************************
		  * continue init
		  */
		initOnLoad: function(){
			// self
			var self = this;
			// get orientation
			this.orientation = 0;
			if (this.opts.orientation == 'auto'){
				if (this.$this.width() < this.$this.height()){
					this.orientation = 1;
				}
			} else {
				if (this.opts.orientation == 'vertical'){this.orientation = 1;}
			}
			var p = this.$this.position();
			if (self.orientation === 0){
				this.space = p.left;
				this.size = this.$this.width();
				this.knobSize = this.knob.width();
			} else {
				this.space = p.top;
				this.size = this.$this.height();
				this.knobSize = this.knob.height();
			}
			// set original value
			this.setValue(this.opts.value);
			// container div cannot be position static
			if (this.$this.css('position') == 'static'){
				this.$this.css('position', 'relative');
			}
			// dragging function
			var dragFun = function(desiredSpace){
				if (desiredSpace < 0){desiredSpace = 0;}
				if (desiredSpace > self.size - self.knobSize){desiredSpace = self.size - self.knobSize;}
				self.knobSpace = desiredSpace;
				self.value = ((self.opts.maxValue - self.opts.minValue) * (self.knobSpace / (self.size - self.knobSize)) + self.opts.minValue).roundTo(self.opts.roundTo);
				if (self.orientation === 0){
					self.knob.css('left', desiredSpace + 'px');
				} else {
					self.knob.css('bottom', desiredSpace + 'px');
				}
				self.opts.slide.call(this, self.value);
			};		
			// dragging handler
			var dragHandler = function(e){
				var space = 0;
				if (self.orientation === 0){
					space = e.pageX;
				} else {
					space = -e.pageY;
				}
				dragFun(space - self.space - self.knobMouseDelta);
			};
			// mouseup handler
			var mouseUpHandler = function(e){
				self.dragging = false;
				self.opts.end.call(this, self.value);
				jQuery('body').unbind('mousemove', dragHandler);
				jQuery('body').unbind('mouseup', mouseUpHandler);
			};
			// mousedown
			this.knob.mousedown(function(e){
				self.dragging = true;
				self.opts.start.call(this, self.value);
				var space = 0;
				if (self.orientation === 0){
					space = e.pageX;
				} else {
					space = -e.pageY;
				}
				self.knobMouseDelta = space - self.space - self.knobSpace;
				jQuery('body').bind('mousemove', dragHandler);
				jQuery('body').bind('mouseup', mouseUpHandler);
			});
			// click
			this.$this.click(function(e){
				self.opts.click.call(this, e);
				if (self.orientation === 0){
					dragFun(e.pageX - self.space - (self.knobSize / 2));
				} else {
					dragFun(self.space + self.size - e.pageY - (self.knobSize / 2));
				}
			});
			// attach the instance of this object to the jQuery wrapped DOM node
			this.$this.data('vibeSliderObj', this);
		},	
		
		/*******************************************
		  * set value
		  */
		setValue: function(value){
			// save value
			this.value = value.roundTo(this.opts.roundTo);
			// set knob position function
			var desiredSpace = (this.size - this.knobSize) * value / (this.opts.maxValue - this.opts.minValue);
			this.knobSpace = desiredSpace;
			if (this.orientation === 0){
				this.knob.css('left', desiredSpace + 'px');
			} else {
				this.knob.css('bottom', desiredSpace + 'px');
			}
			this.opts.slide.call(this, this.value);
		}
	};	
	// public variables and methods
	$.vibeSlider = {
		options: {
			minValue: 0,
			maxValue: 100,
			value: 0,
			roundTo: 0,
			orientation: 'auto',
			slide: function(value){},
			click: function(e){},
			start: function(value){},
			end: function(value){}
		}
	};
	// prototype methods
	$.fn.extend({
		vibeSlider: function(options, value) {
			if (options == 'value'){
				if (typeof(value) == 'undefined'){
					return $(this).data('vibeSliderObj').value;
				} else {
					$(this).data('vibeSliderObj').setValue(value);
				}
			} else {
				// init scroller
				var opts = jQuery.extend({}, $.vibeSlider.options, options);
				return this.each(function(){
					(new vibeSliderObj(this, opts));
				});
			}
		}
	});
})(jQuery);