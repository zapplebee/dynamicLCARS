<?php
$x = ($_GET['col']-1)*155;
$y = ($_GET['row']-1)*65;
$trans = "($x,$y)";
$LCARScommand = urldecode($_GET['LCARScommand']);
?>


<?php

if ($_GET['shape'] == "rounded"){
$LCARSheight = (60 * $_GET['height']) + (5* ($_GET['height'] - 1));
?>

<svg xmlns="http://www.w3.org/2000/svg">

<g
       onclick="<?php echo $LCARScommand;?>"
	   onload=""
       class="button <?php echo $_GET['class'];?>"
	   transform="translate<?php echo $trans;?>"
>
    <path
		class="bottom"
		       d="M 30 0 C 13.431458 3.3306691e-015 -2.393697e-017 13.431458 0 30 C 0 46.568542 13.431458 60 30 60 L 120 60 C 136.56854 60 150 46.568542 150 30 C 150 13.431458 136.56854 -6.7092121e-015 120 0 L 30 0 z "
	/>
    <path
		class="top"
		       d="M 30 0 C 13.431458 3.3306691e-015 -2.393697e-017 13.431458 0 30 C 0 46.568542 13.431458 60 30 60 L 120 60 C 136.56854 60 150 46.568542 150 30 C 150 13.431458 136.56854 -6.7092121e-015 120 0 L 30 0 z "
	/>

	<rect
		y="0" x="0" height="60" width="1"
		class="scalar_x"
		transform="translate(75,0),scale(0,1)"
	/>
	
	<rect
		y="0" x="0" height="1" width="150"
		class="scalar_y"
		transform="translate(0,30),scale(1,0)"
	/>
	
	<text
		class="LCARS_text"
		y="<?php echo ($LCARSheight - 5);?>"
		x="120"
	><?php echo $_GET['name'];?>
		</text>
</g>
</svg>

<?php

}

?>


<?php

if ($_GET['shape'] == "rect"){

$LCARSheight = (60 * $_GET['height']) + (5* ($_GET['height'] - 1));

?>

<svg xmlns="http://www.w3.org/2000/svg">

<g
	   onclick="<?php echo $LCARScommand;?>;"
       class="button <?php echo $_GET['class'];?>"
	   transform="translate<?php echo $trans;?>"
>

	<rect
		y="0" x="0" height="<?php echo $LCARSheight;?>" width="150"
		class="top"
		transform="translate(0,0)"
	/>
	
	<rect
		y="0" x="0" height="<?php echo $LCARSheight;?>" width="150"
		class="bottom"
		transform="translate(0,0)"
	/>
	
	<rect
		y="0" x="0" height="<?php echo $LCARSheight;?>" width="1"
		class="scalar"
		transform="translate(0,0)"
	/>
	
	
	
		<rect
		y="0" x="0" height="<?php echo $LCARSheight;?>" width="1"
		class="scalar_x"
		transform="translate(75,0),scale(0,1)"
	/>
	
	<rect
		y="0" x="0" height="1" width="150"
		class="scalar_y"
		transform="translate(0,30),scale(1,0)"
	/>
	
	<text
		class="LCARS_text"

		y="<?php echo ($LCARSheight - 5);?>"
		x="145"
		transform="translate(0,0)"
	><?php echo $_GET['name'];?>
		</text>
</g>
</svg>

<?php

}

if ($_GET['shape'] == "elbow_top_left"){
$x = ($_GET['col']-1)*155;
$y = (($_GET['row']-1)*65)+30;
$trans = "($x,$y)";
$LCARSheight = (30 * $_GET['height']) + (2.5 * ($_GET['height'] - 1));

?>

<svg xmlns="http://www.w3.org/2000/svg">

<g
	   onclick="document.getElementById('svgContain').webkitRequestFullScreen(); document.getElementById('svgContain').RequestFullScreen();"
       class="button <?php echo $_GET['class'];?>"
	   transform="translate<?php echo $trans;?>,scale(1,1)"
>

    <path

       d="m 75,0 c -41.421356,0 -75,33.57864 -75,75.00002 l 0,20 150,0 0,-27.5 c 0,-20.7107 16.78932,-37.50002 37.5,-37.50002 l 0,-30 z"
/>

    <rect

       width="275"
       height="30"
       x="187"
       y="0" />


</g>
</svg>

<?php

}

if ($_GET['shape'] == "elbow_bottom_left"){
$x = ($_GET['col']-1)*155;
$y = (($_GET['row']-1)*65)+30;
$trans = "($x,$y)";
$LCARSheight = (30 * $_GET['height']) + (2.5 * ($_GET['height'] - 1));

?>

<svg xmlns="http://www.w3.org/2000/svg">

<g
	   onclick="document.webkitCancelFullScreen(); document.cancelFullScreen();"
       class="button <?php echo $_GET['class'];?>"
	   transform="translate<?php echo $trans;?>,scale(1,-1)"
>

    <path

       d="m 75,0 c -41.421356,0 -75,33.57864 -75,75.00002 l 0,20 150,0 0,-27.5 c 0,-20.7107 16.78932,-37.50002 37.5,-37.50002 l 0,-30 z"
/>

    <rect

       width="275"
       height="30"
       x="187"
       y="0" />


</g>
</svg>

<?php

}


if ($_GET['shape'] == "elbow_bottom_right"){
$x = (($_GET['col']-1)*155)-5;
$y = (($_GET['row']-1)*65)+30;
$trans = "($x,$y)";
$LCARSheight = (30 * $_GET['height']) + (2.5 * ($_GET['height'] - 1));

?>

<svg xmlns="http://www.w3.org/2000/svg">

<g

       class="button <?php echo $_GET['class'];?>"
	   transform="translate<?php echo $trans;?>,scale(-1,-1)"
>

    <path

       d="m 75,0 c -41.421356,0 -75,33.57864 -75,75.00002 l 0,20 150,0 0,-27.5 c 0,-20.7107 16.78932,-37.50002 37.5,-37.50002 l 0,-30 z"
/>

    <rect

       width="275"
       height="30"
       x="187"
       y="0" />


</g>
</svg>

<?php

}


if ($_GET['shape'] == "elbow_top_right"){
$x = (($_GET['col']-1)*155)-5;
$y = (($_GET['row']-1)*65)+30;
$trans = "($x,$y)";
$LCARSheight = (30 * $_GET['height']) + (2.5 * ($_GET['height'] - 1));

?>

<svg xmlns="http://www.w3.org/2000/svg">

<g

       class="button <?php echo $_GET['class'];?>"
	   transform="translate<?php echo $trans;?>,scale(-1,1)"
>

    <path

       d="m 75,0 c -41.421356,0 -75,33.57864 -75,75.00002 l 0,20 150,0 0,-27.5 c 0,-20.7107 16.78932,-37.50002 37.5,-37.50002 l 0,-30 z"
/>

    <rect

       width="275"
       height="30"
       x="187"
       y="0" />


</g>
</svg>

<?php

}

?>