var tgg =true;


function test(){
    console.log('pruba de funcion generica')
}


//-------------------------- MENU LATERAL  --------------------------------------

$(".sidebar ul li").on('click', function(){
            $(".sidebar ul li.active").removeClass('active');
            $(this).addClass('active');
})
        
$(".btnmenu" ).on('click',function() {
            
            if(tgg){
                $('.sidebar').addClass('active');
                $('#nav-menu').addClass('active');
                $('.content-w').addClass('active');
                console.log( "First called." );
            }else{
                console.log( "seccond called." );
                $('.sidebar').removeClass('active');
                $('#nav-menu').removeClass('active');
                $('.content-w').removeClass('active');
            }
            tgg = !tgg
});
 
$(".content-w" ).on('click',function() {
    
    if(!tgg){
        console.log('click ww tgg');
        $('.sidebar').removeClass('active');
        $('#nav-menu').removeClass('active');
        $('.content-w').removeClass('active');
    }
    tgg = !tgg
})