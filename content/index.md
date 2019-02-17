##Revealing the Invisible
... with Interactive Web Visualizations built by conscientious developers who enjoy participating in the creative process with other heart-motivated souls ❤
<br /><br />
[Please email us](mailto:info@real-currents.com) if you have an idea for the web or mobile devices that you would like to bring to life.
<br /><br />
[Meet the Developer](/dev)
<br /><br />

<div id="stream" style="text-align: center">
<br />
  <audio id="aud1" preload="auto" controls="true">
    <source src="https://s3-us-west-1.amazonaws.com/real-currents/js-demos/audio/morning-01.mp3" />
    <source src="https://s3-us-west-1.amazonaws.com/real-currents/js-demos/audio/morning-01.ogg" />
  </audio>
</div>

<a href="http://www.w3.org/2010/05/video/mediaevents.html" target="_blank">Media Help</a>

<p id="vstatus"></p>
<p id="license" style="color:#fff">
	<img src="http://i.creativecommons.org/l/by-sa/3.0/nz/88x31.png"  style="width: 88px;" alt="Creative Commons Licence"><br />
	<em>These demos by <a href="mailto:john@real-currents.com">John</a> are licensed under the <a href="http://creativecommons.org/licenses/by-sa/3.0/nz/deed.en_GB">Creative Commons Attribution-ShareAlike 3.0 License, 2009-2016</a></em>
</p>

<script type="text/javascript" id="cvSrc" src="/js-demos/scripts/interact-visualizer.js"></script>
<script type="text/javascript">
(function() {
	window.onload = function(){
		canvasApp(window.cv);
	};
	if (typeof Debugger === "function") {
		Debugger.on = false;
		return;
	} else {
		window.Debugger = {
			log: function() {
				/* no debugger.js */
			}
		};
	}
} )();
</script>
