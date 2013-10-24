<!DOCTYPE html>
<html><head><meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
<meta name="viewport" content="width=1245">
<style>
@font-face {
    font-family: 'lcarsregular';
    src: url('fontface/lcars.eot');
    src: url('fontface/lcars.eot?#iefix') format('embedded-opentype'),
         url('fontface/lcars.woff') format('woff'),
         url('fontface/lcars.ttf') format('truetype'),
         url('fontface/lcars.svg#lcarsregular') format('svg');
    font-weight: normal;
    font-style: normal;

}



body, html, #svgContain{

background-color: black;
color: white;
overflow: hidden;
height: 100%;
padding: 0px;
margin: 0px;

}

#svgContain{
position:absolute;
top: 50%;
left:50%;

background-color: black;

width:1245px;
height:655px;
margin-left: -622.5px;
margin-top: -327.5px;

}


.main_body{
position:absolute;
top: 50%;
left:50%;
font-family: lcarsregular;
line-height: 32.5px;
font-size: 32px;
text-align: center;
overflow:hidden;
width:615px;
height:320px;
margin-left: -152.5px;
margin-top: -192.5px;
color:#ff9900;
z-index: -5;
}


svg{


padding: 5px;
width: 100%;
height: 100%;
z-index: 5;
}


/*BEGIN SVG STYLING*/

	  svg path, svg rect{
	  fill-opacity:1;
	  stroke: none;

	  
	  }
	
.LCARS_color1{
fill:#9999cc;
}

.LCARS_color2{
fill:#9999ff;
}

.LCARS_color3{
fill:#cc99cc;
}

.LCARS_color4{
fill:#cc6699;
}


.LCARS_color5{
fill:#cc6666;
}


.LCARS_color6{
fill:#ff9966;
}

.LCARS_color7{
fill:#ff9900;
}

.LCARS_color8{
fill:#ffcc66;
}

.LCARS_highlight{
fill:#ff9900;
}

.button{
cursor:default;
height: 60px;
}

.button text{
fill: black;
font-size:32px;
font-family:lcarsregular;
-webkit-touch-callout: none;
-webkit-user-select: none;
-khtml-user-select: none;
-moz-user-select: -moz-none;
-ms-user-select: none;
user-select: none;
text-anchor:end;
text-transform:uppercase;
}

.button image{

}

</style>

  <script src="jquery-1.7.2.js"></script><style type="text/css"></style>


  <script type="text/javascript" src="./index_files/jquery.svganim.js"></script>
  
  
  <script type="text/javascript" src="jquery.svg.js"></script>
  <script type="text/javascript" src="./index_files/jquery.svganim.js"></script>
<script type="text/javascript" src="jquery.svgdom.js"></script>
<script type="text/javascript" src="jquery.svgfilter.js"></script>
<script type="text/javascript" src="jquery.svggraph.js"></script>
<script type="text/javascript" src="jquery.svgplot.js"></script>
<script type="text/javascript" src="svg.js"></script>

<title>LCARS Control Panel</title>
<script>
var Make_LCARS_Button = function(text){
this.LCARSclass = "LCARS_color1";
this.LCARSheight = 1;
this.LCARSwidth = 1;
this.alert = "A button";
this.text = text;
}

lcarsdata = new Make_LCARS_Button("halp");



function holla(content){
alert(content);
};


function blink(selector, intime, outtime){
//This function blinks any selected element
var intime = intime || 200;
var outtime = outtime || 1000;
$(selector).fadeOut(outtime, function(){
    $(this).fadeIn(intime, function(){
        blink(this);
    });
});
}


function button_stretch_toggle(selector,columns,rows,closeothers,group) {
//This function toggles the open state of rounded buttons. depends on openButton() and closeButton().
var group = group || ".button";
if (closeothers == true){
	closeButton(group);
}

	var iteration=$(selector).data('iteration')||1
		switch ( iteration) {
			case 1:
				openButton(selector,columns,rows);
				break;
			
			case 2:
				closeButton(selector);
				break;
		}
		iteration++;
		if (iteration>2) iteration=1
		if (closeothers == true){
			$(group).data('iteration',1);
		}
		$(selector).data('iteration',iteration);

};


function openButton(selector,columns,rows) {
//This function opens buttons by translating the moving button parts, scaling the button scalar, and changing the fill color. button_stretch_toggle() depends on this.
var columns = columns || 0;
var rows = rows || 0;
var hsize = 65*rows;
var vsize = 155*columns;
$(window).data("openbutton", selector);
$(selector).css("fill", "#ff9900");
	$(selector).find(".top" ).animate({
		svgTransform: 'translate('+vsize+', '+hsize+')'}, 200);


	$(selector).find(".scalar_x" ).animate({
		svgTransform: 'translate(75,0),scale('+vsize+', 1)'}, 200);
		
	$(selector).find(".scalar_y" ).animate({
		svgTransform: 'translate(0,30),scale(1, '+hsize+')'}, 200);
		
	$(selector).find(".LCARS_text" ).animate({
		svgTransform: 'translate('+vsize+', '+hsize+')'}, 200);
//	$(selector).find(".image" ).animate({
//		svgTransform: 'translate(100,25),scale(1,0)'}, 500).delay(200).animate({
//		svgTransform: 'translate(100,25),scale(1,1)'}, 200);
};



function closeButton(selector) {
//This function closes buttons by translating the moving button parts, scaling the button scalar, and changing the fill color. button_stretch_toggle() depends on this.
$(selector).css("fill", "");
//	$(selector).find(".image" ).animate({
//		svgTransform: 'translate(100,25),scale(0,0)'}, 100);

	$(selector).find(".top" ).animate({
		svgTransform: 'translate(0, 0)'}, 200);
		
		
	$(selector).find(".scalar_x" ).animate({
		svgTransform: 'translate(75,0),scale(0, 1)'}, 200);
		
	$(selector).find(".scalar_y" ).animate({
		svgTransform: 'translate(0,30),scale(1,0)'}, 200);
		
	$(selector).find(".LCARS_text" ).animate({
		svgTransform: 'translate(0, 0)'}, 200);


};


function createLCARS(selector) {
var selector = selector + " li";
$(selector).each(function() {
//This function creates two $(window).data
//$(window).data("col") & $(window).data("row") represent the location of the next ".rounded_button"
var col = $(this).attr('LCARScol') || 1;
var LCARSheight = $(this).attr('LCARSheight') || 1;
var row = $(this).attr('LCARSrow') || 1;
var LCARScommand = encodeURIComponent($(this).attr('LCARScommand'));

var url = 'svg.php?name='+$(this).text()+'&col='+col+'&row='+row+'&class='+$(this).attr('class')+'&shape='+$(this).attr('shape')+'&height='+LCARSheight+'&LCARScommand='+LCARScommand;
$("#svgContain").svg('get').load(url, {addTo: true, 
        changeSize: false});




});


}

$(window).load(function() {

//$('svg').live('click', function() {
//alert('clicked');
//});

alert(lcarsdata.alert);

$("#svgContain").svg();
//This is required to create the SVG canvas.



createLCARS("#layout");
createLCARS("#constant_controls");
if (document.location.hash !== ""){

createLCARS(document.location.hash);
} else {
createLCARS("#home");
}


$(window).on('hashchange', function() {
var hash = document.location.hash;
$(".button:not(.static)").remove();
createLCARS(hash, 1);

});


$(window).resize(function() {
//when the window is resized, close the open button
//	button_stretch_toggle($(window).data("openbutton"));
		
});

    $("html").bind("mousewheel", function() {
	//disable the mousewheel
         return false;
     });

	 


});
</script>





</head>

<body>
<div id="svgContain">

</div>

<ul id="layout" style="visibility: hidden;">

<li class="LCARS_color8 static" shape="elbow_bottom_left" LCARSheight="1" LCARSrow="10" ></li>
<li class="LCARS_color8 static" shape="elbow_bottom_right" LCARSheight="1" LCARScol="9" LCARSrow="10" ></li>
<li class="LCARS_color8 static" shape="elbow_top_right" LCARSheight="1" LCARScol="9" LCARSrow="1" ></li>
<li class="LCARS_color8 static" shape="elbow_top_left" LCARSheight="1" LCARSrow="1"></li>
</ul>


<ul id="constant_controls" style="visibility: hidden;">

<li class="LCARS_color3 static mcontrol home" shape="rect" LCARSheight="1" LCARSrow="3" LCARScommand="button_stretch_toggle(this,1,0,true,'.mcontrol');document.location.hash = 'home';">HOME</li>
<li class="LCARS_color3 static mcontrol briefing" shape="rect" LCARSheight="1" LCARSrow="4" LCARScommand="button_stretch_toggle(this,1,0,true,'.mcontrol');document.location.hash = 'briefing';">BRIEFING</li>
<li class="LCARS_color3 static mcontrol subspace" shape="rect" LCARSheight="1" LCARSrow="5" LCARScommand="button_stretch_toggle(this,1,0,true,'.mcontrol');document.location.hash = 'subspace';">SUBSPACE</li>
<li class="LCARS_color3 static mcontrol officers" shape="rect" LCARSheight="1" LCARSrow="6" LCARScommand="button_stretch_toggle(this,1,0,true,'.mcontrol');document.location.hash = 'officers';">OFFICERS</li>
<li class="LCARS_color3 static mcontrol about" shape="rect" LCARSheight="2" LCARSrow="7" LCARScommand="button_stretch_toggle(this,1,0,true,'.mcontrol');document.location.hash = 'about';">ABOUT</li>

</ul>



<ul id="subspace" style="visibility: hidden;">

<li class="LCARS_color1" shape="rect" LCARSheight="1" LCARSrow="3" LCARScol="8" LCARScommand="alert(this.buttondata.alert)" >COMMAND 1</li>
<li class="LCARS_color2" shape="rect" LCARSheight="1" LCARSrow="4" LCARScol="8" LCARScommand="alert(this.buttondata.alert)" >COMMAND 2</li>
<li class="LCARS_color3" shape="rect" LCARSheight="1" LCARSrow="5" LCARScol="8" LCARScommand="alert(this.buttondata.alert)" >COMMAND 3</li>
<li class="LCARS_color4" shape="rect" LCARSheight="1" LCARSrow="6" LCARScol="8" LCARScommand="alert(this.buttondata.alert)" >COMMAND 4</li>
<li class="LCARS_color5" shape="rect" LCARSheight="1" LCARSrow="7" LCARScol="8" LCARScommand="alert(this.buttondata.alert)" >COMMAND 5</li>
<li class="LCARS_color6" shape="rect" LCARSheight="1" LCARSrow="8" LCARScol="8" LCARScommand="alert(this.buttondata.alert)" >COMMAND 6</li>

<li class="LCARS_color3" shape="rounded" LCARSheight="1" LCARScol="4" LCARSrow="8">ROTATE</li>
<li class="LCARS_color3" shape="rounded" LCARSheight="1" LCARScol="5" LCARSrow="8">ROTATE</li>
<li class="LCARS_color3" shape="rounded" LCARSheight="1" LCARScol="6" LCARSrow="8">ROTATE</li>
<li class="LCARS_color3" shape="rounded" LCARSheight="1" LCARScol="7" LCARSrow="8">ROTATE</li>

<li class="LCARS_color6" shape="rounded" LCARSheight="1" LCARScol="4" LCARSrow="9" LCARScommand="button_stretch_toggle(this,3,0,false)">LOCK</li>
<li class="LCARS_color6" shape="rounded" LCARSheight="1" LCARScol="5" LCARSrow="9" LCARScommand="button_stretch_toggle(this,2,0,false)">LOCK</li>
<li class="LCARS_color6" shape="rounded" LCARSheight="1" LCARScol="6" LCARSrow="9" LCARScommand="button_stretch_toggle(this,1,0,false)">LOCK</li>
<li class="LCARS_color6" shape="rounded" LCARSheight="1" LCARScol="7" LCARSrow="9" LCARScommand="button_stretch_toggle(this,0,0,false)">LOCK</li>

<li class="LCARS_color1" shape="rounded" LCARSheight="1" LCARScol="4" LCARSrow="2" LCARScommand="button_stretch_toggle(this,0,0,false)">COL 1</li>
<li class="LCARS_color4" shape="rounded" LCARSheight="1" LCARScol="5" LCARSrow="2" LCARScommand="button_stretch_toggle(this,0,1,false)">COL 2</li>
<li class="LCARS_color1" shape="rounded" LCARSheight="1" LCARScol="6" LCARSrow="2" LCARScommand="button_stretch_toggle(this,0,2,false)">COL 3</li>
<li class="LCARS_color4" shape="rounded" LCARSheight="1" LCARScol="7" LCARSrow="2" LCARScommand="button_stretch_toggle(this,0,3,false)">COL 4</li>



</ul>


<ul id="home" style="visibility:hidden;">

<li class="LCARS_color8" shape="rect" LCARSheight="6.5" LCARSrow="2.75" LCARScol="8" LCARScommand="" ></li>

</ul>



</body></html>