Debugger.on = true;
Debugger.log( "Make Control" );

jQuery(function() {
	/* Simple interface controls for home screen */

	jQblink = function($obj, t) {
		$obj.fadeOut(t);
		$obj.fadeIn(t);
		return $obj;
	};
	jQuery(window).scrollTop(2);

	jQuery('#read_site').html( function(idx) {
		if( window.location.host ) {
			this.href = "http://"+ window.location.host;
			return window.location.host;
		} else {
			this.href = window.location;
			return window.location;
		}
	});
	jQblink( jQblink( jQblink(jQuery('#mode'),600), 600), 600);

	jQuery('#toggle_control').click(function($evt) {
		var $this = jQuery(this);
		$this.unbind();
		return toggleControl( 'off', $this );
	} ).html( 
		"Hide Control" 
	).attr('href', "#null");

});
	
function toggleControl( on_off, $this ) {
	var on_off = on_off || 'off',
		$background = jQuery('#transparent_background');
	if( on_off === 'off' ) {
		$background.animate({ 
			'height': "0px",
			'min-height': "0px",
			'max-height': "0px"
		}, 1100)
		$this.html( "Show Control" );
		$this.click(function($evt) {
			var $this = jQuery(this);
			$this.unbind();
			return toggleControl( 'on', $this );
		} );

	} else {
		$background.animate({ 
			'height': "6400px",
			'min-height': "6400px",
			'max-height': "6400px"
		}, 1100);
		$this.html( "Hide Control" );
		$this.click(function($evt) {
			var $this = jQuery(this);
			$this.unbind();
			return toggleControl( 'off', $this );
		} );
	}
	return true;
}
