<?php
/**
 * @authour karl holz
 * @package css_one tester
 * @date July 1, 2012

Copyright (c) 2012 Karl Holz <newaeon|(a)|mac|d|com>

CSS_One has been created by Karl Holz, any borrowed functions have been 
noted in the code comments with a link to the origonal page.


Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

  
 * 
 */
/*
CSS One Tester page
 * This tester uses modifyd parts of the jquery ui demo provided with the relese files, 
 * this tester contains output for
 * 
 * - ATOM feed of with links that set the style for each view
 * - CSS output with embedded images, combine multiple style sheets and trim extra spaces, comments, tabs, etc
 * - JS output for the jQuery UI and XSLT transform of the ATOM Feed
 * - XSLT script for transforming an atom feed into HTML select box
 * - HTML body content from the jQuery UI demo
 * - Main document output combines all of the above and outputs HTML5 or xHTML
 * 
 */          
$webdir=  str_replace(array($_SERVER['DOCUMENT_ROOT']), array(''), dirname(__FILE__));
if (array_key_exists('style', $_GET)) { 
   $style=$_GET['style']; 
} else { $style= ''; }
// view switcher
if  (array_key_exists('ORIG_PATH_INFO', $_SERVER)) { 
   $rest=$_SERVER['ORIG_PATH_INFO']; 
} elseif  (array_key_exists('PATH_INFO', $_SERVER)) { 
   $rest=$_SERVER['PATH_INFO']; 
} else { $rest=''; }
        
require_once 'css-ui.php';
switch ($rest) {

     /**
     * Style CSS
     * this will return CSS output with images encoded into the style, minifyed
     * and combined with other style sheet 
     */
    case '/style.css':
        $css=new css_one();
        // if no style pass with query string,
        // use random custom jquery ui css file
        if ($style == '') {
            $d=glob('./css/*/*.custom.css');
            $r=rand(0, count($d)-1); //random id
            $style=$d[$r];
        }
        $css->add_style($style);
        // add custom css
//        $css->add_style('./css/ui-demo.css');
        $css->printCSS();
        exit();
    break;
 
    /**
     * xHTML/HTML5 output shell, HTML5 is default
     * -> set $css->HTML5=FALSE; // for xHTML output 
     * use this to:
     * - load your custom javascript
     * - add atom feeds
     * - add style
     * - load body markup
     */
    default :
        $css=new css_one();
        $css->title="SalamCast Podcast Player";
        $css->description="This is the upgraded version of HolzCast Podcast Player, now running with CSS One and renamed as SalamCast Podcast Player";
        $css->keywords="HTML5, iTunes, Podcast, Video, Audio";
        // add ATOM feed
//        $css->add_atom('Test jQuery UI',$_SERVER['SCRIPT_NAME'].'/feed.atom');
        // add jquery, will default to web link if file is not avaliable
        $css->set_jquery($webdir.'/js/jquery-1.7.2.min.js');
        // add jquery-ui, will default to web link if file is not avaliable
        $css->set_jquery_ui($webdir.'/js/jquery-ui-1.8.21.custom.min.js');
        $css->add_js($webdir.'/js/JSON.js');
        // add custom javascript
//        $css->add_js($webdir.'/css-one/js/jquery.xslt.js');
      $css->add_js($webdir.'/js/jquery.jplayer.js');
      $key='';
      if (array_key_exists('QUERY_STRING', $_SERVER)) { $key='/'.$_SERVER['QUERY_STRING']; }  
        $css->add_js($webdir.'/podcast.js.php'.$key);
        
        $css->add_js($webdir.'/js/holzcast.js');

        // set dynamic css changer for jquery-ui
        // this script will have it's images embedded and css minifyed
        if ($style == '') {
            $style=$_SERVER['SCRIPT_NAME'].'/style.css';
        } else {
            $style=$_SERVER['SCRIPT_NAME'].'/style.css?style='.$style;
        }
        $css->add_style($style);
        $css->add_style($webdir.'/css/podcast.css');
        // load HTML5/xHTML markup file or url
        $css->load_body('podcast.html'); 

//        $css->load_body('http://'.$_SERVER['HTTP_HOST'].$_SERVER['SCRIPT_NAME'].'/demo.html'); 
        echo $css;

    break;
}
?>
