/* golly.js : v0.0.1 on 09/12/2012
* http://dannygarcia.github.com/golly/
* Copyright (c) 2012 Danny Garcia; Licensed MIT */

// Base
window['GOLLY'] = function(params) {

	if ( !params ) {
		params = {};
	}

	// Do we support canvas?
	if ( !document.createElement('canvas').getContext ) {
		if ( params.fallback ) {
			params.fallback();
		}
		return;
	}

	var _this = this,
		_keysDown = {},
		k = 1e3,
		_privateParts =
		{
			'ctx' : undefined,
			'domElement' : undefined,
			'width' : undefined,
			'height' : undefined,
			'desiredFrameTime' : k/60,
			'frameCount' : 0,
			'key' : undefined,
			'keyCode' : undefined,
			'mouseX' : 0,
			'mouseY' : 0,
			'pmouseX' : undefined,
			'pmouseY' : undefined,
			'mousePressed' : false,
			'offset' : {x:0, y:0}
		},
		_actualFrameTime,
		d; // shorthand for the dom element

	var getOffset = function() {
		var obj = d;
		var x = 0, y = 0;
		while (obj) {
			y += obj.offsetTop;
			x += obj.offsetLeft;
			obj = obj.offsetParent;
		}
		_privateParts['offset'].x = x;
		_privateParts['offset'].y = y;
	};

	// Default parameters

	if ( !params['context'] ) {
		params['context'] = '2d';
	}


	// Create domElement, grab context

	d = _privateParts['domElement'] = document.createElement('canvas');
	_privateParts['ctx'] = d.getContext( params['context'] );

	// Are we capable of this context?

	if (_privateParts['ctx'] === null) {
		if ( params.fallback ) {
			params.fallback();
		}
		return;
	}

	// Set up width and height setters / listeners

	if ( params['fullscreen'] ) {

		var onResize = function() {

			getOffset();

			if ( params['width'] ) {
				_privateParts['width'] = d['width'] = params['width'];
			} else {
				_privateParts['width'] = d['width'] = window.innerWidth;
			}

			if ( params['height'] ) {
				_privateParts['height'] = d['height'] = params['height'];
			} else {

				_privateParts['height'] = d['height'] = window.innerHeight;
			}

			if ( !_this.loop ) {

				// Why do I need this?
				if ( _this['draw'] ) {
					_this['draw']();
				}

			}

		};

		window.addEventListener( 'resize', onResize, false );
		onResize();

		if ( !params['container'] ) {
			document.body.style.margin = '0px';
			document.body.style.padding = '0px';
			document.body.style.overflow = 'hidden';
		}

		params['container'] = params['container'] || document.body;


	} else {

		if ( !params['width'] ) {
			params['width'] = 500;
		}

		if ( !params['height'] ) {
			params['height'] = 500;
		}



		window.addEventListener( 'resize', getOffset, false );
		getOffset();


		_this.__defineSetter__('width', function(v) {
			_privateParts['width'] = d['width'] = v;
		});

		_this.__defineSetter__('height', function(v) {
			_privateParts['height'] = d['height'] = v;
		});

		_this['width'] = params['width'];
		_this['height'] = params['height'];

	}

	// Put it where we talked about (if we talked about it).

	if ( params['container'] ) {
		params['container'].appendChild(d);
		getOffset();
	}

	var getter = function(n) {
		_this.__defineGetter__(n, function() {
			return _privateParts[n];
		});
	};

	// Would love to reduce this to params.

	getter('ctx');
	getter('domElement');
	getter('width');
	getter('height');
	getter('frameCount');
	getter('key');
	getter('keyCode');
	getter('mouseX');
	getter('mouseY');
	getter('pmouseX');
	getter('pmouseY');
	getter('mousePressed');

	var n = function() {};

	// TODO: Ensure data type
	_this['loop'] = true;

	// TODO: Ensure data type
	_this['keyup'] = n;
	_this['keydown'] = n;
	_this['draw'] = n;
	_this['mousedown'] = n;
	_this['mouseup'] = n;
	_this['mousemove'] = n;
	_this['mousedrag'] = n;
	_this['mouseover'] = n;
	_this['mouseout'] = n;

	// Custom Getters & Setters

	_this.__defineGetter__('frameRate', function(v) {
		return 1E3/_actualFrameTime;
	});

	_this.__defineGetter__('frameTime', function(v) {
		return _actualFrameTime;
	});

	_this.__defineGetter__('keyPressed', function(v) {
		for (var i in _keysDown) {
			if (_keysDown[i]) {
				return true;
			}
		}
		return false;
	});

	_this.__defineSetter__('frameTime', function(v) {
		_privateParts['desiredFrameTime'] = v;
	});

	_this.__defineSetter__('frameRate', function(v) {
		_privateParts['desiredFrameTime'] = k/v;
	});

	// Listeners

	d.addEventListener('mouseover', function(e) {
		getOffset();
		_this['mouseover']();
	}, false);

	d.addEventListener('mouseout', function(e) {
		getOffset();
		_this['mouseout']();
	}, false);

	var fireMouseMove = function(e) {
		_this['mousemove']();
	};

	var updateMousePosition = function(e) {
		var x = e.pageX - _privateParts['offset'].x;
		var y = e.pageY - _privateParts['offset'].y;
		if (typeof _privateParts['pmouseX'] === 'undefined') {
			_privateParts['pmouseX'] = x;
			_privateParts['pmouseY'] = y;
		} else {
			_privateParts['pmouseX'] = _privateParts['mouseX'];
			_privateParts['pmouseY'] = _privateParts['mouseY'];
		}
		_privateParts['mouseX'] = x;
		_privateParts['mouseY'] = y;
	};

	d.addEventListener('mousemove', updateMousePosition, false);
	d.addEventListener('mousemove', fireMouseMove, false);

	d.addEventListener('mousedown', function() {
		_privateParts['mousePressed'] = true;
		_this['mousedown']();
		d.addEventListener('mousemove', _this['mousedrag'], false);
		d.removeEventListener('mousemove', fireMouseMove, false);
	}, false);

	d.addEventListener('mouseup', function() {
		_privateParts['mousePressed'] = false;
		_this['mouseup']();
		d['removeEventListener']('mousemove', _this['mousedrag'], false);
		d.addEventListener('mousemove', fireMouseMove, false);
	}, false);

	window.addEventListener('keydown', function(e) {
		var kc = e.keyCode;
		_privateParts['key'] = String.fromCharCode(kc); // Kinda busted.
		_privateParts['keyCode'] = kc;
		_keysDown[kc] = true;
		_this['keydown']();
	}, false);

	window.addEventListener('keyup', function(e) {
		var kc = e.keyCode;
		_privateParts['key'] = String.fromCharCode(kc); // Kinda busted.
		_privateParts['keyCode'] = kc;
		_keysDown[kc] = false;
		_this['keyup']();
	}, false);

	// Internal loop.
	window.requestAnimationFrame = (function(){
		return  window.requestAnimationFrame   ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame    ||
			window.oRequestAnimationFrame      ||
			window.msRequestAnimationFrame     ||
			function( callback ){
				window.setTimeout(callback, 1000 / 60);
			};
	}());

	_privateParts['_idraw'] = function() {

		_privateParts['frameCount']++;

		var prev = new Date().getTime();

		_this['draw']();

		var delta = new Date().getTime() - prev;

		if (delta > _privateParts['desiredFrameTime']) {
			_actualFrameTime = delta;
		} else {
			_actualFrameTime = _privateParts['desiredFrameTime'];
		}

		if ( _this['loop'] ) {
			window.requestAnimationFrame( _privateParts['_idraw'] );
		}

	};

	_privateParts['_idraw']();

};