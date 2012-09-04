<?php
//
require_once('podcast.php');
$x='';
//var_dump($_SERVER);

if (array_key_exists('PATH_INFO', $_SERVER)) {
 $t=$_SERVER['PATH_INFO'];
} else {
 $t='';
}
    switch ($t) {
        case '/aje':
            $x= <<<x
[podcast]
listening_post="http://feeds.aljazeera.net/podcasts/listeningpost"
inside_story="http://feeds.aljazeera.net/podcasts/insidestory"
fault_lines="http://feeds.aljazeera.net/podcasts/faultlines"
witness="http://feeds.aljazeera.net/podcasts/witness"
x
;
        break;
        case '/halal':     
            $x= <<<x
[podcast]
the_deen_show="http://salafonline.com/7anef/feed.xml"
tafseer="http://feeds.feedburner.com/BilalPhilips-TafseerofSurahAl-Kahf"
x
;
        break;
    }


new podcast($x);
?>