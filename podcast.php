<?php
 /*
   ################################################################################
   #   
   #   HolzCast Player is now:
   #
   #   SalamCast Podcast Player, August 25, 2012
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

 class podcast {
    private $ini;
    private $podcast=array();
    
    private $feeds=array();
    function __construct($ini='') {
      header("Expires: Mon, 26 Jul 1997 05:00:00 GMT"); 
      header("Last-Modified: " . gmdate( "D, d M Y H:i:s" ) . "GMT"); 
      header("Cache-Control: no-cache, must-revalidate"); 
      header("Pragma: no-cache");
      header("Content-type: application/json");
      // use config with class name by default
      if ($ini=='') { $ini=__CLASS__.'.ini'; $this->data=dirname(__FILE__).'/data/'; }
      elseif (is_file($ini)) { $this->data=dirname(__FILE__).'/'.__CLASS__.'/'.basename($ini, '.ini').'/'; }
      else { $this->data=dirname(__FILE__).'/'.__CLASS__.'/'.$_SERVER['PATH_INFO'].'/'; }
      $this->ini = (is_file($ini)) ? parse_ini_file($ini) : parse_ini_string($ini);
      // load ini configuration
      if (! is_array($this->ini) || count($this->ini) < 1 ) die(" couldent load the configuration file"); 
      // setup podcast cacheing for this webserver
      $this->base='http://192.168.0.242/'.$_SERVER['SCRIPT_NAME'];
      if (! array_key_exists("PATH_INFO", $_SERVER)) $_SERVER['PATH_INFO']="";
      if (array_key_exists("HTTP_HOST", $_SERVER)) { $this->base='http://'.$_SERVER['HTTP_HOST'].$_SERVER['SCRIPT_NAME'].$_SERVER['PATH_INFO']; }
      
      // data dir for files, make it if it's not there
      if (! is_dir($this->data)) mkdir($this->data, 0751, TRUE);
      // check if the user has queried an rss file
      if (array_key_exists('QUERY_STRING',$_SERVER) && $_SERVER['QUERY_STRING'] != '')  {
         $this->uuid=$_SERVER['QUERY_STRING'];
         echo $this;
         exit();
      }
      // str2time format
      // update automaticly evey week
      $this->update="-1 Day";
      // User Agent
      $this->agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_4) AppleWebKit/536.25 (KHTML, like Gecko) Version/6.0 Safari/536.25";
      if (array_key_exists("HTTP_USER_AGENT", $_SERVER)) { $this->agent=$_SERVER["HTTP_USER_AGENT"]; }
      // invoke update and scan, return a list of found feeds
      $this();
   }
    
   function __invoke() {
      $this->load_feeds();
      if (count($this->feeds) > 0 ) {
         echo json_encode($this->feeds);
      } else {
         //Cli
         $this->download_feeds();
         $this->load_feeds();
         echo json_encode($this->feeds);
      }
        exit();
    }
    
    function __toString() {
        if (! is_file($this->data.$this->uuid)) die("The Feed you requested is not found");
        header("Content-type: text/xml");
        return file_get_contents($this->data.$this->uuid);    
    }
    
    function __destruct() { return TRUE; }
    
    function __set($key, $val){ $this->podcast[$key]=$val; return TRUE; }
    
    function __get($key) {
        if(array_key_exists($key,$this->podcast)) return $this->podcast[$key];
        return;
    }
    
    function load_feeds() {
      $this->feeds=array(); //reset 
      foreach (glob($this->data."*" ) as $g) {
         $this->feeds[]=array(
            'title' => $this->xslt_apply($g, $this->get_rss_title()),
            'href' => $this->base.'?'.str_replace(array($this->data), array(''), $g)
         );
      }
    }
    /**
     * Download and process each feed
     */ 
    function download_feeds() { foreach ($this->ini as $k => $v) $this->process_feeds($k, $v); }
    /**
     * private functions
     */
    private function process_feeds($title, $feed){
      $xml_load=$this->get_from_url($feed, $this->update);
      if ($xml_load != '' && preg_match('/^</', $xml_load)) { 
         $xsltmpl=$this->get_rss_xsl();
         $ini= parse_ini_string($this->xslt_apply($xml_load, $xsltmpl));
         if (array_key_exists('url', $ini) && count($ini['url']) > 0) {
            foreach($ini['url'] as $k => $v) $this->process_feeds($ini['title'][$k], $v);
            unlink($this->data.$this->uuid($feed).".xml");
         } else {
            $this->feeds[]=array(
               'title' => $title,
               'url' => $this->base.'?'.$this->uuid($feed),
               'src' => $feed
            );
         }
      }
   }
    
   private function xslt_apply($xml_load, $xsltmpl) {
      $xml=new DOMDocument();
      if (is_file($xml_load)) { $xml->load($xml_load); }
      else { $xml->loadXML($xml_load); }
      //loads XSL template file
      $xsl=new DOMDocument();
      $xsl->loadXML($xsltmpl);
      //process XML and XSLT files and return result
      $xslproc = new XSLTProcessor();
      $xslproc->importStylesheet($xsl);
      return $xslproc->transformToXml($xml);      
   }
   
   /**
    * XSLT to extract rss channel title
    */
   private function get_rss_title() {
      return <<<X
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"  version="1.0">
  <xsl:output method="text"/>
  <xsl:template match="/"><xsl:value-of select="/rss/channel/title"/></xsl:template>
</xsl:stylesheet>
X
      ;
   }
    
    /**
     * Extract rss types from enclosure tags with XSLT 1.0
     */
   private function get_rss_xsl() {
      return <<<X
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"  version="1.0">
  <xsl:output method="text"/>
  <xsl:template match="/">[podcasts]<xsl:apply-templates select="/rss/channel/item"/>
  </xsl:template>
  <xsl:template match="/rss/channel/item">
    <xsl:if test="enclosure/@type = 'application/rss+xml'">
title[]="<xsl:value-of select="title"/>"
url[]="<xsl:value-of select="enclosure/@url"/>"</xsl:if></xsl:template>
</xsl:stylesheet>
X
      ;
   }
   
   /**
    * update cached file from url
    */
   private function get_from_url($url, $time='-24 hours') {
      $file=$this->data.$this->uuid($url).".xml";
      if (! is_file($file) || filectime($file) > strtotime($time) ) { $this->cache_podcast($url); }
      if (is_file($file)) return file_get_contents($file);
      return ;
    }

    /**
    * Genarates an UUID
    * @author     Anis uddin Ahmad, modified by Karl Holz
    * @param      string  an optional prefix
    * @return     string  the formated uuid
    */
   private function uuid($key = null, $prefix =__CLASS__) {
      $key = ($key == null)? $this->base : $key;
      $chars = md5($key);
      $uuid  = substr($chars,0,8) . '-';
      $uuid .= substr($chars,8,4) . '-';
      $uuid .= substr($chars,12,4) . '-';
      $uuid .= substr($chars,16,4) . '-';
      $uuid .= substr($chars,20,12);
      return $prefix .'-'. $uuid;
   }
  
   // @TODO add header checking for 404 etc 
   private function cache_podcast($url) {
      $file=$this->data.$this->uuid($url).".xml";
      $ch = curl_init(); 
      curl_setopt($ch, CURLOPT_URL, $url); 
      curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
      // mimic users web browser
      curl_setopt($ch, CURLOPT_USERAGENT, $this->agent); 
      if ($xml = curl_exec($ch)) {
         curl_close($ch);
         file_put_contents($file, $xml);
         return TRUE;            
      }
      return FALSE;   
   }
}



?>