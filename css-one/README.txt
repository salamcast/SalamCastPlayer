CSS One, unify your your style sheet and it's images into one file

@package css_one
@authour Karl Holz <newaeon|A|mac|d|com>
@link 

June 27, 2012
 

 CSS One
 -> bigger style sheet 
 -> less http requests 
 -> faster loading 



For an example of how to use this class in your php/jQuery project, look at index.php

CSS One will do
- print minifyed CSS with images embedded into the document output
- print HTML5 or xHTML output with a the ability to add custom feeds, js files/links and a 
custom HTML (<body /> only) for your widget markup.  


CSS output example

for the best performance, please keep your styles organized in different folders with their images.
view the jQuery UI css folder (found in the unzipped release folder) for the best example to get the best results.

$css=new css_one();
$css->add_style('./book/style1.css');
$css->add_style('./css/style2.css');
$css->printCSS();
exit();

CSS One has been tested with jQuery UI css release and custom themes - http://jqueryui.com/download 
to create custom themes, use theme roller - http://jqueryui.com/themeroller/

HTML5 / xHTML output example (index.php has the best example of it's use)

$css=new css_one();
// -> set $css->HTML5=FALSE; // for xHTML output 
$css->title="CSS One ";                                                // <title />
$css->description="This is a jQuery UI CSS theme testing tool";        // <meta />
$css->keywords="HTML5, css, base64 images, phpclasses";                // <meta />
$css->add_atom('Test jQuery UI',$_SERVER['SCRIPT_NAME'].'/feed.atom'); // add ATOM feed
$css->set_jquery('/js/jquery-1.7.2.min.js');                           // add jquery, will default to web link if file is not avaliable
$css->set_jquery_ui('/js/jquery-ui-1.8.21.custom.min.js');             // add jquery-ui, will default to web link if file is not avaliable
$css->add_js('/js/ui-demo.js');                                        // add custom javascript
$css->add_style('style.php');                                          // this css is a link to the document or script
$css->load_body(dirname(__FILE__).'/jquery-ui/demo.html');             // load HTML5/xHTML markup
echo $css;                                                             // just print the object to get the html document

The demo in index.php has an example of how to impliment multiple jQuery ui themes to your web applications
I simplely reused the atom feed and a little XSLT to made a select box that would load the new style.