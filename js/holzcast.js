 /*
   ################################################################################
   #   
   #   HolzCast Player is now:
   #
   #   SalamCast Podcast Player, August 25, 2012
   #	* jQuery Plugin has been trimmed of fat for making redundant HTML and CSS items
   #	* unused JS variables have been removed and code cleaned
   #	* CSS has been updated, since menu's didn't work well on iDevices
   #	* CSS ids and classes can be over ridden
   #
   #   Copyright 2012 Karl Holz, newaeon _AT_ mac _DOT_ com
   #
   #   http://www.salamcast.com
   #
   #   Licensed under the Apache License, Version 2.0 (the "License");
   #   you may not use this file except in compliance with the License.
   #   You may obtain a copy of the License at
   #
   #       http://www.apache.org/licenses/LICENSE-2.0
   #
   #   Unless required by applicable law or agreed to in writing, software
   #   distributed under the License is distributed on an "AS IS" BASIS,
   #   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   #   See the License for the specific language governing permissions and
   #   limitations under the License.
   #
   ################################################################################
 */


(function($) {
 $.fn.extend({ 
  SalamCast: function(options) {
   var p = 0; // for playlist item uniqueness
   var o = 0; // opml unique ness
   var $id = '#'+$(this).attr('id');   
   // plugin defaults
   var defaults = {
    load: 'body',
    swf: './',
    PlayPlaylist: '1', // numbered to allow multi-instances
    poster: '',
    feeds: '',   //JSON object {"title":"url"} ** remember no ',' on last item in array
    itunes: 'http://www.itunes.com/dtds/podcast-1.0.dtd',    //  set to true/any to enable
    jPlayerSolution: "html, flash", // jPlayer Solution
    debug: true,
    media: "m4v, m4a, mp3"
   };
   var opts = $.extend(defaults, options);
/* These CSS ids and classes are used for buttons and id items.  classes start with a '.'  */   
   var css_defaults = {
    link_rss: 'link[type="application/rss+xml"]',
    itunes: 	'#itunes',
    rss: 	'#rss',
    pcast_link: '#pcast_link',
    menu: 	'#menu',
    menu_items: '#menu > ul > li > a',
    podcasts: 	"#ajax",
    // jPlayer
    track: 	"#track_name_txt",
    jPlayer: 	"#jquery_jplayer_1", 
    // current playlist, can be switched off if needed
    playlist: 	"#podcast",
    play: 	'#play',
    pcast: 	"#pcast", 
    playlist_item: '#podcast_item_', // playlist item prefix
    remote: 	"#holzremote",
    // uses class
    next: 	".jp-next",
    prev: 	".jp-previous",
    full: 	"a.jp-full-screen",
    normal: 	"a.jp-restore-screen",
    controls: 	".jp-controls",
    controls_act: '.jp-controls > li > a',
    //

    playlist_title: "#title",
    playlist_url: "#href",
    track_url: 	"#track",
    max: 	"#max",
    playing: 	"#num",
    open_item_info: "#open_item_info",
    open_chan_info: "#open_chan_info",
    item_info: 	'#podcast_info',
    chan_info: 	'#channel_info',
    item_info_box: 	'#item_info_box',
    chan_info_box: 	'#chan_info_box'

   };
   
   var cssId = $.extend(css_defaults, options.cssId);
   // one liners for basic HTML structures
   var html = {
    a_ref: function(title, playlist, p) { 
     if (p) { return '<a  id="play'+p+'" href="'+playlist+'" >'+title+'</a>'; }
     else { return '<a title="'+title+'" href="'+playlist+'" >play</a>'; }
    },
    podcast_item: function(p, title, playlist){ return '<li>'+this.a_ref(title, playlist, p)+'</li>'; },
    playlist_item: function(id,url, name, i){
     return "<li ><a  id='" +id.replace('#', '')+"' href='"+url+"' ext='"+ext(url)+"' tabindex='"+i+"'>"+name+"</a></li>";
    },
    rss_link: function(t, l) { return "<link type='application/rss+xml' rel='alternate' title='"+t+"' href='"+l+"' />"; },
    feed_html: function(t,id) { return '<h3 class="ui-widget-header ui-corner-all">'+t+'</h3><br /><div id="'+id.replace('#', '')+'"></div><br />'; }
   };
// ------------   
   var podcast_links = function($url){
    $(cssId.rss).attr('href',$url);
    // replace http:// with itpc://
    $(cssId.itunes).attr('href', $url.replace("http://", "itpc://"));
    $(cssId.pcast_link).attr('href', $url.replace("http://", "pcast://")); 
   };
      
//################################################################################################
// setMedia for jPlayer
   var media = function(url) {
    var e = ext(url);
    var c;
    switch (e) {
     case "m4v": c={ m4v: url, poster: opts.poster }; break;
     case "m4a": c={ m4a: url, poster: opts.poster }; break;
     case "mp3": c={ mp3: url, poster: opts.poster }; break;
    }
    return c;
   };
//################################################################################################
// returns the file extention from url to be used in jPlayer
   var ext = function(url){
    if (url) {
     var e = url.substr(url.lastIndexOf('.'));
     var o = e;
     switch (e) {
      // mp4 video
      case ".mp4": o="m4v"; break; case ".m4v": o="m4v"; break; case ".mov": o="m4v"; break;
      // mp3 audio
      case ".mp2": o="mp3"; break; case ".mp3": o="mp3"; break;
      // mp4 Audio
      case ".m4a": o="m4a"; break; case ".m4b": o="m4a"; break;
     }
     return o;   
    }
    return 'm4v';
   };
   var set_title = function(t) {
	$(cssId.track).attr('title', t);
	$(cssId.playlist_title).text(t);
   };

//################################################################################################
   /* Fix jPlayer hight and width  issues */
   var fix_jplayer = function() {
    $(cssId.jPlayer+' object' ).removeAttr('width').removeAttr('height').removeAttr('style');
    $(cssId.jPlayer+' video' ).removeAttr('width').removeAttr('height').removeAttr('style');
    $(cssId.jPlayer+' img' ).removeAttr('width').removeAttr('height');
    $(cssId.jPlayer).removeAttr('style');
    $(cssId.controls_act).css('display', function() {
      var s = $(this).css('display');
      if (s == 'inline') { return 'block'; }
      else if (s == 'block') { return 'block'; }
      else  { return 'none'; }
    });    
   };
   /* set to normal video */
   var set_normal = function (){
    $($id).removeClass('full').addClass('normal');
    $(cssId.jPlayer+' object' ).removeAttr('class').addClass('normal');
    $(cssId.jPlayer+' video' ).removeAttr('class').addClass('normal');
    $(cssId.jPlayer+' img' ).removeAttr('class').addClass('normal');
    $(cssId.jPlayer).removeClass('full').addClass('normal');
   };
   /* set to full screen video */
   var set_fullscreen = function() {
    $($id).removeClass('normal').addClass('full');
    $(cssId.jPlayer).removeAttr('class').addClass('full').removeAttr('style');
   }
  
   /* configure next track to play */  
   var playlistConfig = function(index) {
    var current = parseInt($(cssId.playing).text());
    $p=0;
    $(cssId.playlist_item  + current).removeClass("jp-playlist-current").parent().removeClass("jp-playlist-current");
    $(cssId.playlist_item  + index).addClass("jp-playlist-current").parent().addClass("jp-playlist-current");
    current = parseInt(index);
    var a = $(cssId.playlist_item  + current).attr('href');
    var json = JSON.parse($(cssId.playlist_item  + current).attr('json'));
    json.desc.replace("&lt;", "<").replace("&gt;", ">");
    // set track number
    $(cssId.playing).text(current);
    var txt=$(cssId.playlist_item + current).text();

    $(cssId.track).html(txt);
    $(cssId.item_info).empty();
    if (json.title) {
	$(cssId.item_info).append(html.feed_html('Title', cssId.item_info+$p));
	$(cssId.item_info+$p).html(json.title);
	$p++;
    }
    if (json.pubdate) {
	$(cssId.item_info).append(html.feed_html('Published Date', cssId.item_info+$p));
	$(cssId.item_info+$p).text(json.pubdate);
	$p++;
    }
    if (json.author) {
	$(cssId.item_info).append(html.feed_html('Author', cssId.item_info+$p));
	$(cssId.item_info+$p).html(json.author);
	$p++;
    }
    if (json.block) {
	$(cssId.item_info).append(html.feed_html('Block Podcast in iTunes', cssId.item_info+$p));
	$(cssId.item_info+$p).html(json.block);
	$p++;
    }
    if (json.img) {
	$(cssId.item_info).append(html.feed_html('Podcast Poster', cssId.item_info+$p));
	$(cssId.item_info+$p).html('<img width="380" />');
	$(cssId.item_info+$p+" > img").attr('src', json.img);
	opts.poster=json.img;
	$p++;
    }
    if (json.time) {
	$(cssId.item_info).append(html.feed_html('Play Time', cssId.item_info+$p));
	$(cssId.item_info+$p).html(json.time);
	$p++;
    }
    if (json.explicit) {
	$(cssId.item_info).append(html.feed_html('Explicit', cssId.item_info+$p));
	$(cssId.item_info+$p).html(json.explicit);
	$p++;
    }
    if (json.isCC) {
	$(cssId.item_info).append(html.feed_html('Closed Caption Video', cssId.item_info+$p));
	$(cssId.item_info+$p).html(json.isCC);
	$p++;
    }
    if (json.order) {
	$(cssId.item_info).append(html.feed_html('Order', cssId.item_info+$p));
	$(cssId.item_info+$p).html(json.order);
	$p++;
    }
    if (json.keywords) {
	$(cssId.item_info).append(html.feed_html('Keywords', cssId.item_info+$p));
	$(cssId.item_info+$p).html('<ul><li>'+json.keywords.replace(/,/g, "</li><li>")+'</li></ul>');
	$p++;
    }
    if (json.subtitle) {
	$(cssId.item_info).append(html.feed_html('Subtitle', cssId.item_info+$p));
	$(cssId.item_info+$p).html(json.subtitle);
	$p++;
    }
    if (json.desc) {
	$(cssId.item_info).append(html.feed_html('Summary', cssId.item_info+$p));
	$(cssId.item_info+$p).html(json.desc);
	$p++;
    }
    if (json.guid) {
	$(cssId.item_info).append(html.feed_html('guid', cssId.item_info+$p));
	$(cssId.item_info+$p).html(json.guid);
	$p++;
    }
    if (json.url) {
	$(cssId.item_info).append(html.feed_html('Media File', cssId.item_info+$p));
	$(cssId.item_info+$p).html('<a></a>');
	$(cssId.item_info+$p+' > a').html('Download').attr('href', json.url);
	$p++;
    }
    if (json.type) {
	$(cssId.item_info).append(html.feed_html('Type', cssId.item_info+$p));
	$(cssId.item_info+$p).html(json.type);
	$p++;
    }
    if (json.size) {
	$(cssId.item_info).append(html.feed_html('Size', cssId.item_info+$p));
	$(cssId.item_info+$p).html(json.size);
	$p++;
    }
    if (json.comments) {
	$(cssId.item_info).append(html.feed_html('Comments', cssId.item_info+$p));
	$(cssId.item_info+$p).html('<a></a>');
	$(cssId.item_info+$p+' > a').html(json.comments).attr('href', json.comments);
	$p++;
    }
    if (json.source) {
	$(cssId.item_info).append(html.feed_html('Source', cssId.item_info+$p));
	$(cssId.item_info+$p).html('<a></a>');
	$(cssId.item_info+$p+' > a').html(json.source).attr('href', json.source);
	$p++;
    }
    set_media(a);      
   };
   
   /* Change Playlist */  
   var playlistChange = function(index) { playlistConfig(index); };
   
   /* Next Playlist item */
   var playlistNext = function() {

    var current = parseInt($(cssId.playing).text())+1; 
    var max = parseInt($(cssId.max).text()); 
    var index = (current <= max) ? current : 1;
    playlistChange(index);
   };
   
   /* Previous Playlist item */
   var playlistPrev = function() {
    var current = parseInt($(cssId.playing).text()) -1; 
    var max = parseInt($(cssId.max).text());
    var index = (current >= 1) ? current  : max;
    playlistChange(index);
   };

   /* Set the playlist */
   function playlist($url) {
    var i=1;
    var list=new Array();
    var first={};
    // jPlayer
    podcast_links($url);
    reset_ui();
    $.ajax({ type: 'GET', url: $url, dataType: 'xml',  success: function(d){
      var chan;
      $(d).find('channel').each(function(xml){
	var c = jQuery(this);
	var $c=0;
	opts.poster=''; // reset poster
/*
iTunes XML Schema: http://www.itunes.com/dtds/podcast-1.0.dtd

http://www.podcast411.com/howto_1.html
xml tag			channel	item	where content appears in iTunes
<title>			Y	Y	Name column
<link>			Y	 	website link and arrow in Name column
<copyright>		Y	 	not visible
<itunes:author>		Y	Y	Artist column
<itunes:block>		Y	Y	prevent an episode or podcast from appearing
<itunes:category>	Y	 	Category column and in iTunes Store Browse
<itunes:image>		Y	Y	Same location as album art
<itunes:explicit>	Y	Y	parental advisory graphic in Name column
<itunes:complete>	Y		indicates completion of podcasts; no more episodes
<itunes:keywords>	Y	Y	not visible but can be searched
<itunes:new-feed-url>	Y		not visible, used to inform iTunes of new feed URL location
<itunes:owner>		Y	 	not visible, used for contact only
<itunes:subtitle>	Y	Y	Description column
<itunes:summary>	Y	Y	when the "circled i" in Description column is clicked
*/
	chan = {
	 title: c.find('title').first().text(),
 	 link:c.find('link').first().text(),
	 copyright: c.find('copyright').first().text(),
	 author:c.find('*').ns_filter(opts.itunes, 'author').first().text(),
	 block: c.find('*').ns_filter(opts.itunes, 'block').first().text(),
 	 category:c.find('*').ns_filter(opts.itunes, 'category').attr('text'),
	 img:c.find('*').ns_filter(opts.itunes, 'image').first().attr('href'), 
	 explicit: c.find('*').ns_filter(opts.itunes, 'explicit').first().text(),
	 complete: c.find('*').ns_filter(opts.itunes, 'complete').first().text(),
	 keywords: c.find('*').ns_filter(opts.itunes, 'keywords').first().text(),
	 new_feed_url: c.find('*').ns_filter(opts.itunes, 'new-feed-url').first().text(),
	 subtitle: c.find('*').ns_filter(opts.itunes, 'subtitle').first().text(),
	 desc:c.find('*').ns_filter(opts.itunes, 'summary').first().text(),
	 pubDate:c.find('pubDate').first().text(),
	 build:c.find('lastBuildDate').first().text(),
	 generator:c.find('generator').first().text(),
	 lang: c.find('language').first().text(),
	 docs: c.find('docs').first().text(),
	 webMaster: c.find('webMaster').first().text(),
	 ttl: c.find('ttl').first().text()
	}

	if (! chan.desc) { chan.desc=c.find('description').first().text(); }
	if (! chan.category) {chan.desc=c.find('category').text(); }
	if (! chan.author) {chan.author=c.find('author').first().text(); }
	if (! chan.author) {chan.author=c.find('managingEditor').first().text(); }
	c.find('*').ns_filter(opts.itunes, 'owner').each(function(){
	 chan.name=$(this).find('*').ns_filter(opts.itunes, 'name').first().text();
	 chan.email=$(this).find('*').ns_filter(opts.itunes, 'email').first().text();
	});
	
	if (chan.title) {
	 $(cssId.chan_info).append(html.feed_html('Title', cssId.chan_info+$c));
	 $(cssId.chan_info+$c).html(chan.title);
	 $(cssId.playlist_title).html(chan.title);
	 $c++
	}
	if (chan.link) {
	 $(cssId.chan_info).append(html.feed_html('Link', cssId.chan_info+$c));
	 $(cssId.chan_info+$c).html('<a></a>');
	 $(cssId.chan_info+$c+' > a').html(chan.link).attr('href', chan.link);
	 $c++;
	}
	if (chan.copyright) {
	 $(cssId.chan_info).append(html.feed_html('Copyright', cssId.chan_info+$c));
	 $(cssId.chan_info+$c).html(chan.copyright);
	 $c++;
	}
	if (chan.author) {
	 $(cssId.chan_info).append(html.feed_html('Author', cssId.chan_info+$c));
         $(cssId.chan_info+$c).html(chan.author);
	 $c++;
	}
	if (chan.block) {
	 $(cssId.chan_info).append(html.feed_html('Block Channel', cssId.chan_info+$c));
         $(cssId.chan_info+$c).html(chan.block);
	 $c++;
	}
	if (chan.category) {
	 $(cssId.chan_info).append(html.feed_html('Categorys', cssId.chan_info+$c));
	 $(cssId.chan_info+$c).html(chan.category);
	 $c++;
	}
	if (chan.img) {
	 $(cssId.chan_info).append(html.feed_html('Podcast Channel Image', cssId.chan_info+$c));
	 $(cssId.chan_info+$c).html('<img width="385" />');
	 $(cssId.chan_info+$c+' > img').attr('src', chan.img).attr('alt', chan.title);
	 opts.poster=chan.img; 
	 $c++;
	}
	if (chan.explicit) {
	 $(cssId.chan_info).append(html.feed_html('Explicit Content', cssId.chan_info+$c));
	 $(cssId.chan_info+$c).html(chan.explicit);
	 $c++;
	}
	if (chan.complete) {
	 $(cssId.chan_info).append(html.feed_html('Complete', cssId.chan_info+$c));
	 $(cssId.chan_info+$c).html(chan.complete);
	 $c++;
	}
	if (chan.keywords) {
	 $(cssId.chan_info).append(html.feed_html('Keywords', cssId.chan_info+$c));
	 $(cssId.chan_info+$c).html('<ul><li>'+chan.keywords.replace(/,/g, "</li><li>")+'</li></ul>');
	 $c++;
	}
	if (chan.new_feed_url) {
	 $(cssId.chan_info).append(html.feed_html('New Feed Url', cssId.chan_info+$c));
         $(cssId.chan_info+$c).html('<a></a>');
	 $(cssId.chan_info+$c+' > a').html(chan.new_feed_url).attr('href',chan.new_feed_url);
	 $c++;
	}
	if (chan.email) {
	 var name;
	 if (chan.name) { name = chan.name; } else { name=chan.email; }
	 $(cssId.chan_info).append(html.feed_html('Owner', cssId.chan_info+$c));
	 $(cssId.chan_info+$c).html('<a></a>');
	 $(cssId.chan_info+$c+'> a').html(name).attr('href','mailto:'+chan.email);
	 $c++;
	}
	if (chan.subtitle) {
	 $(cssId.chan_info).append(html.feed_html('Subtitle', cssId.chan_info+$c));
	 $(cssId.chan_info+$c).html(chan.subtitle);
	 $c++;
	}
	if (chan.desc) {
	 $(cssId.chan_info).append(html.feed_html('Summary', cssId.chan_info+$c));
	 $(cssId.chan_info+$c).html(chan.desc);
	 $c++;
	}
	if (chan.pubDate) {
	 $(cssId.chan_info).append(html.feed_html('Published Date', cssId.chan_info+$c));
	 $(cssId.chan_info+$c).html(chan.pubDate);
	 $c++
	}
	if (chan.build) {
	 $(cssId.chan_info).append(html.feed_html('Build Date', cssId.chan_info+$c));
	 $(cssId.chan_info+$c).html(chan.build);
	 $c++
	}
	if (chan.generator) {
	 $(cssId.chan_info).append(html.feed_html('Feed Generator', cssId.chan_info+$c));
	 $(cssId.chan_info+$c).html(chan.generator);
	 $c++
	}
	if (chan.lang) {
	 $(cssId.chan_info).append(html.feed_html('Language', cssId.chan_info+$c));
	 $(cssId.chan_info+$c).html(chan.lang);
	 $c++;
	}
	if (chan.docs) {
	 $(cssId.chan_info).append(html.feed_html('Feed Documentation', cssId.chan_info+$c));
	 $(cssId.chan_info+$c).html(chan.docs);
	 $c++;
	}
	if (chan.webMaster) {
	 $(cssId.chan_info).append(html.feed_html('WebMaster', cssId.chan_info+$c)); 
	 $(cssId.chan_info+$c).html('<a></a>');
	 $(cssId.chan_info+$c+'> a').html(name).attr('href','mailto:'+chan.webMaster);
	 $c++;
	}	
	$(cssId.chan_info).append(html.feed_html('Feed URL', cssId.chan_info+$c));
        $(cssId.chan_info+$c).html('<a></a>');
	$(cssId.chan_info+$c+' > a').html('Open Feed').attr('href', $url);
	$c++;
      });
      $(d).find('item').each(function(){
       var $item = jQuery(this);
       var $desc = $item.find('description').text();
       var $desc2 = $item.find('*').ns_filter(opts.itunes, 'summary').text();
       if ($desc2.length > $desc.length) { $desc=$desc2; }
       $desc.replace(/\n/g, '<br />')
      
       var pitem = cssId.playlist_item + i;     // set first item to play
/* http://www.podcast411.com/howto_1.html
xml tag				channel	item	where content appears in iTunes
<title>				Y	Y	Name column
<pubDate>			 	Y	Release Date column
<itunes:author>			Y	Y	Artist column
<itunes:block>			Y	Y	prevent an episode or podcast from appearing
<itunes:image>			Y	Y	Same location as album art
<itunes:duration>		 	Y	Time column
<itunes:explicit>		Y	Y	parental advisory graphic in Name column
<itunes:isClosedCaptioned>		Y	Closed Caption graphic in Name column
<itunes:order>				Y	override the order of episodes on the store
<itunes:keywords>		Y	Y	not visible but can be searched
<itunes:subtitle>		Y	Y	Description column
<itunes:summary>		Y	Y	when the "circled i" in Description column is clicked
*/
       var item_info= { // 
	title: $item.find('title').text().replace(chan.title,'').replace(chan.title.replace('.', ''),''),
	pubdate: $item.find('pubDate').text(),
	author: $item.find('*').ns_filter(opts.itunes, 'author').first().text(),
	block: 	$item.find('*').ns_filter(opts.itunes, 'block').first().text(),
	img: $item.find('*').ns_filter(opts.itunes, 'image').first().attr('href'),
	time: $item.find('*').ns_filter(opts.itunes, 'duration').first().text(),
	explicit: $item.find('*').ns_filter(opts.itunes, 'explicit').first().text(),
	isCC: $item.find('*').ns_filter(opts.itunes, 'isClosedCaptioned').first().text(),
        order: $item.find('*').ns_filter(opts.itunes, 'order').first().text(),
	keywords: $item.find('*').ns_filter(opts.itunes, 'keywords').first().text(),	
	subtitle: $item.find('*').ns_filter(opts.itunes, 'subtitle').first().text(),
	desc: $desc,
	guid: $item.find('guid').text(),
	// enclosure
	url: $item.find('enclosure').attr("url"),
        type: $item.find('enclosure').attr("type"),
        size: $item.find('enclosure').attr("length"),
	//opt RSS
	comments: $item.find('comments').text(),
	source: $item.find('source').text()
       };
       
       
       if (! item_info.img) {
	item_info.img=$item.find('image').find('url').text();
       }
       if (! item_info.author) {
	item_info.author=$item.find('author').first().text();
       }
       
       if (i == 1){ first = { url: item_info.url, name: item_info.title }; }
       $(cssId.pcast).append( html.playlist_item(pitem, item_info.url, item_info.title, i) );
       $(pitem).attr('json', JSON.stringify(item_info, null, 2));
       $(pitem).click(function(event) {
        event.preventDefault();
	
        var a = $(this).attr("href");
        var index = $(this).attr('tabindex');
        playlistChange(index);
       });
       $(cssId.max).text(i);
       if (first.url) {
	$(cssId.playing).text('1');
        $(cssId.track).html(first.name); 
        playlistChange('1'); 
       }
       i++;
       });
      } 
    }); // ajax end
   }

   /* Set Media to play */
   var set_media = function(url) { 
    $(cssId.jPlayer).jPlayer("setMedia", media(url)).jPlayer("play"); 
    fix_jplayer();
   };
   
   /* Stop jPlayer */
   var no_play = function() { $(cssId.jPlayer).jPlayer("stop"); }
 
   // jplayer setup, plays the first video
   var jplayer = function() {
    $(cssId.jPlayer).jPlayer({
     jPlayer: cssId.jPlayer,  
     cssSelectorAncestor: cssId.remote,
     ready: function () {
      // RSS feeds must be sent as xml/text for IE or jQuery.get() will not work!
      if (!opts.feeds) {
       $('link[type="application/rss+xml"]').each(function () { p++;
        $(cssId.podcasts).append(html.podcast_item(p, $(this).attr('title'), $(this).attr('href')));
       }); 
      } else {
       opts.feeds.each(function (k, v) { p++; $(cssId.podcasts).append(html.podcast_item(p, k, v)); });   
      }
      // start the work of loading in menu plain items
      if (opts.PlayPlaylist > p) { play=p; }
      else if (opts.PlayPlaylist < 1){ play=1; }
      else { play=opts.PlayPlaylist; }
      set_title($(cssId.play+play).text());
      playlist($(cssId.play+play).attr('href'));
      $(cssId.menu_items).click(function(event) { event.preventDefault(); fix_jplayer(); playlist($(this).attr('href')); });
      $(cssId.full).click(function(event)  { event.preventDefault(); fix_jplayer(); set_fullscreen(); });
      $(cssId.normal).click(function(event){ event.preventDefault(); fix_jplayer(); set_normal(); });
      $(cssId.next).click(function(event)  { event.preventDefault(); playlistNext(); fix_jplayer();  });
      $(cssId.prev).click(function(event)  { event.preventDefault(); playlistPrev(); fix_jplayer(); });
      $(cssId.controls_act).click(function(e){ e.preventDefault(); fix_jplayer(); });
      fix_jplayer();
      set_normal();
     },
     play: function()  { $(cssId.jPlayer).jPlayer("play"); fix_jplayer(); },
     ended: function() { playlistNext(); fix_jplayer(); },
     pause: function() { fix_jplayer(); },
     mute: function()  { fix_jplayer(); },
     supplied: opts.media, 
     solution: opts.jPlayerSolution, 
     swfPath: opts.swf, 
     errorAlerts: opts.debug, 
     warningAlerts: opts.debug
    });
    return false;
   };
   /* reset jPlayer UI */
//################################################################################################
   var reset_ui =function() {
     $(cssId.track).html('');
     $(cssId.pcast).empty();
     $(cssId.chan_info).empty();
     $(cssId.item_info).empty();
     $(cssId.playlist_title).html('Playlist');
     $(cssId.playing).html('0');
     $(cssId.max).html('0');
   }
   var reset = function() { $(cssId.jPlayer).jPlayer("destroy"); };
// ################################################################################################   
   /* boot strap the player for client useage */
   $(cssId.podcasts).empty();
   $(cssId.playlist).empty();
   $($id).addClass('normal').show();
   $(cssId.chan_info_box).dialog({ title: "Channel Details", autoOpen: false, width: 600, height: 600, zindex: 999999 });
   $(cssId.item_info_box).dialog({ title: "Media Information", autoOpen: false, width: 600, height: 600, zindex: 999999 });
   $(cssId.open_chan_info).click(function(e) {
	e.preventDefault();
	$(cssId.chan_info_box).dialog("open");
   });
   $(cssId.open_item_info).click(function(e) {
	e.preventDefault();
	$(cssId.item_info_box).dialog("open");
   });
   jplayer(); // all the work is done when jPlayer is ready
   // return each to work with jQuery
   return this.each(function() {  var o = opts; var obj = $(this); var items = $("a", obj);  });
  }
 });
})(jQuery);
//#############################################################################################
// Extras to make this plugin work
//#############################################################################################
// ns_filter, a jQuery plugin for XML namespace queries.
// http://www.ibm.com/developerworks/xml/library/x-feedjquery/#listing2
(function($) {
 $.fn.ns_filter = function(namespaceURI, localName) {
  return $(this).filter(function() {
   var domnode = $(this)[0];
   return (domnode.namespaceURI == namespaceURI && domnode.localName == localName);
  });
 };
})(jQuery);

