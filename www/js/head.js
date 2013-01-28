mouseX = 0;
mouseY = 0;
jQuery(document).ready(function(){
    $(document).mousemove(function(e){
	mouseX = e.pageX;
	mouseY = e.pageY;
    }); 
})