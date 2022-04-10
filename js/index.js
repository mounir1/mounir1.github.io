function showabout(){
    $("#about_container").css("display","inherit");
    $("#about_container").addClass("animated slideInLeft");
    setTimeout(function(){
        $("#about_container").removeClass("animated slideInLeft");
    },800);
}
function closeabout(){
    $("#about_container").addClass("animated slideOutLeft");
    setTimeout(function(){
        $("#about_container").removeClass("animated slideOutLeft");
        $("#about_container").css("display","none");
    },800);
}
function showwork(){
    $("#work_container").css("display","inherit");
    $("#work_container").addClass("animated slideInRight");

      setTimeout(function(){
         document.getElementById('work_section').innerHTML=` <h2 class="animated slideInLeft">Web & Software Developer</h2>`

        $("#work_container").removeClass("animated slideInRight");
    },800);
}
function closework(){
    $("#work_container").addClass("animated slideOutRight");
    setTimeout(function(){
        $("#work_container").removeClass("animated slideOutRight");
        $("#work_container").css("display","none");
    },800);
}
function showcontact(){
    $("#contact_container").css("display","inherit");
    $("#contact_container").addClass("animated slideInDown");
    setTimeout(function(){
        $("#contact_container").removeClass("animated slideInDown");
         $('png')
        .each(function(){
            var t = $(this),
                i = t.attr('src');
            $.get(i, function(i){
                var a = $(i)
                    .find('svg');
                t.replaceWith(a);
            });
            console.clear();
        });
    },800);
}
function closecontact(){
    $("#contact_container").addClass("animated slideOutUp");
    setTimeout(function(){
        $("#contact_container").removeClass("animated slideOutUp");
        $("#contact_container").css("display","none");
    },800);
}

function showresume(){
    $("#resume_container").css("display","inherit");
    $("#resume_container").addClass("animated slideInUp");
    setTimeout(function(){
        $("#resume_container").removeClass("animated slideInUp");
    },800);
}
function closeresume(){
    $("#resume_container").addClass("animated slideOutDown");
    setTimeout(function(){
        $("#resume_container").removeClass("animated slideOutDown");
        $("#resume_container").css("display","none");
    },800);
}

setTimeout(function(){
    $("#loading").addClass("animated fadeOut");
    setTimeout(function(){
      $("#loading").removeClass("animated fadeOut");
      $("#loading").css("display","none");
      $("#box").css("display","none");
      $("#about").removeClass("animated fadeIn");
      $("#contact").removeClass("animated fadeIn");
      $("#work").removeClass("animated fadeIn");
    },1000);
},1500);
