<?php
$key='';
if (array_key_exists('PATH_INFO', $_SERVER)) {
 $key=$_SERVER['PATH_INFO'];
}
?>jQuery(function ($) {
    $.ajax({
        url: './SalamCast.php<?php echo $key; ?>',
        type: 'GET',
        dataType: 'json',
        success: function(result) {
            $.each(result, function(i, r) {
                $('head').append('<link title="'+result[i].title+'" href="'+result[i].href+'" type="application/rss+xml" rel="alternate" />');
            });
            $('#CastPlayer').SalamCast({
                swf: "./js/",
                jPlayerSolution: "flash, html",
                debug: false
            });
//            $('#tabs').tabs({ collapsible: true });
        },
    });
});