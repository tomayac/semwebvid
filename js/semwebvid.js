var Util;
if (!Util) {
  Util = {};
}
Util.PROXY_URI = "./proxy.php5";      
Util.contains = function (a, obj) {
  var i = a.length;
  while (i--) {
    if (a[i] === obj) {
      return true;
    }
  }
  return false;
}
Util.containsPrefixAndWhich = function (a, str) {
  var i = a.length;
  while (i--) {
    if (str.indexOf(a[i]) !== -1) {
      return i;
    }
  }
  return -1;
}
Util.isArray = function(o) {
  return Object.prototype.toString.call(o) === '[object Array]';
}
Util.isString = function(o) {
  if (typeof o === 'string') {
    return true;
  }
  if (typeof o === 'object') {
    var criterion = o.constructor.toString().match(/string/i); 
    return (criterion !== null); 
  }
  return false;
}
Util.notify = function(message) {
  var div = document.createElement("div");
  div.setAttribute("class", "message");
  div.innerHTML = '<span class="messageText">' + message + '</span>';       
  document.body.appendChild(div);
  window.setTimeout(function() {
    div.parentNode.removeChild(div);
  },
  3 * 1000);
  if (AppLogic._debug) {
    AppLogic.consoleReplacement.log("[UI] Notification: \"" + message + "\"");
  }
}
Util.xmlDecode = function(textToDecode) {
  var result = textToDecode;

  var amp = /&amp;/g;
  var gt = /&gt;/g;
  var lt = /&lt;/g;
  var quot = /&quot;/g;
  var apos = /&apos;/g;
  var nbsp = /&nbsp;/g;

  var html_gt = ">";
  var html_lt = "<";
  var html_amp = "&";
  var html_quot = "\"";
  var html_apos = "'";
  var html_nbsp = " ";

  result = result.replace(amp, html_amp);
  result = result.replace(quot, html_quot);
  result = result.replace(lt, html_lt);
  result = result.replace(gt, html_gt);
  result = result.replace(apos, html_apos);
  result = result.replace(nbsp, html_nbsp);

  return result;
}
Util.stripslashes = function(str) {
  str = str.replace(/\\'/g,'\'');
  str = str.replace(/\\"/g,'"');
  str = str.replace(/\\0/g,'\0');
  str = str.replace(/\\\\/g,'\\');
  return str;
}
Util.quotemeta = function(str) {
  return (str+'').replace(/([\.\\\+\*\?\[\^\]\$\(\)])/g, '\\$1');
}    
Util.truncateToNKb = function(chars, n) {
  function toBytesUTF8(chars) {
      return unescape(encodeURIComponent(chars));
  }
  function fromBytesUTF8(bytes) {
      return decodeURIComponent(escape(bytes));
  }
  var bytes = toBytesUTF8(chars).substring(0, n);
  while (true) {
    try {
      return fromBytesUTF8(bytes);
    } catch(e) {
      // empty
    }
    bytes = bytes.substring(0, bytes.length - 1);
  }
} 
Util.getRandomAlphaNumericString = function() {
  var chars =
      "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
  var length = 8;
  var random = '';
  for (var i = 0; i < length; i++) {
    var rnum = Math.floor(Math.random() * chars.length);
    random += chars.substring(rnum, rnum+1);
  }
  return random;
}      

/* SemWeb */
var SemWeb;
if (!SemWeb) {
  SemWeb = {};
}
SemWeb._captions = [];
SemWeb._normalizedCaptions = [];
SemWeb._factors = {};      
SemWeb._scrollOffset = -1;          
SemWeb._getCurrentCaption = function(milliseconds) {
  var semanticDepictionContainer =
      document.getElementById("semantic-depiction-container");        
  var length = SemWeb._captions.length;     
  for (var i = 0; i < length; i++) {
    var caption = document.getElementById("caption-" + i);                          
    var semanticCaption =
        document.getElementById("semantic-caption-" + i);          
    if ((SemWeb._captions[i].from <= milliseconds) &&
        (milliseconds <= SemWeb._captions[i].to)) {                
      var semanticDepictionContainerInnerHTML = '';
      var matches =
          semanticCaption.textContent.match(
              /.*?event:factor\s+<(.*?)>.*?/g);
      if (matches) {        
        var uris = matches.join(',');
        uris = uris.replace(/\s*/g, '');
        uris = uris.replace(/event:factor</g, '').replace(/>/g, '');
        uris = uris.split(',');              
        var length2 = uris.length;                  
        for (var j = 0; j < length2; j++) {
          if (uris[j].indexOf('opencalais.com') !== -1) {
            uris = uris.concat(OpenCalais._sameAs[uris[j]]);
          }
        }   
        length2 = uris.length;                  
        for (var j = 0; j < length2; j++) {
          if (Depictor.concepts[uris[j]]) {
            var length3 = Depictor.concepts[uris[j]].length;                
            for (var k = 0; k < length3; k++) {
              var src = Depictor.concepts[uris[j]][k];
              semanticDepictionContainerInnerHTML +=
                  "<img class='semantic-depiction' src='" + src + "' />";
              if (AppLogic._debug) {
                AppLogic.consoleReplacement.log("[UI] Depiction: \"" + src + "\" for concept \"" + uris[j] + "\"");
              }                        
            }
          }
        }                
        if (semanticDepictionContainerInnerHTML !== VideoPlayer._oldHTML) {
          semanticDepictionContainer.innerHTML = semanticDepictionContainerInnerHTML;                  
        }
        VideoPlayer._oldHTML = semanticDepictionContainerInnerHTML;
      } else {
        semanticDepictionContainer.innerHTML = '';                
      }                
      caption.setAttribute("class", "highlighted");
      semanticCaption.setAttribute("class", "highlighted");
      caption.parentNode.scrollTop =
          caption.offsetTop - SemWeb._scrollOffset;
      semanticCaption.parentNode.parentNode.scrollTop =
          semanticCaption.offsetTop - SemWeb._scrollOffset;
    } else {
      caption.setAttribute("class", "transparent");
      semanticCaption.setAttribute("class", "transparent");
    }
  }
}
SemWeb._annotateFactor = function(query, sourceColor, index) {
  if (SemWeb._factors[query]) {
    var literalFactorRegExp =
        new RegExp('event:factor "' +
            Util.quotemeta(query) + '"');        
    var literalTagRegExp = 
        new RegExp('\tctag:label "' + Util.quotemeta(query) + '"');                  
    var semanticCaptions = document.getElementsByClassName('semanticCode');                    
    for (var i = 0, semanticCaption; semanticCaption = semanticCaptions[i]; i++) {
      if (semanticCaption.textContent.indexOf('event:factor "' + query + '"') !== -1) {
        semanticCaption.innerHTML = semanticCaption.innerHTML.replace(
            literalFactorRegExp,
            "event:factor &lt;<a href='" + SemWeb._factors[query][index] +
                "'><span style='background-image: url(\"" + sourceColor +
                "\"); background-repeat: repeat-x;'>" +
                SemWeb._factors[query][index] + "</span></a>&gt;");                          
        if (AppLogic._debug) {
          AppLogic.consoleReplacement.log("[RDF] Annotated literal event factor \"" + decodeURIComponent(query) + "\" with concept \"" + SemWeb._factors[query][index] + "\" from \"" + AppLogic._colorsToServicesMap[sourceColor] + "\"");
        }                      
      }
      if (semanticCaption.textContent.indexOf('ctag:label "' + query + '"') !== -1) {
        semanticCaption.innerHTML = semanticCaption.innerHTML.replace(
            literalTagRegExp,
            '\tctag:means &lt;<a href="' + SemWeb._factors[query][index] + '">' +
                '<span style="background-image: url(\'' + sourceColor +
                '\'); background-repeat: repeat-x;">' +
                SemWeb._factors[query][index] + '</span></a>&gt;;\n' +
                '\tctag:label "' + query + '"');
        if (AppLogic._debug) {
          AppLogic.consoleReplacement.log("[RDF] Annotated literal YouTube tag \"" + decodeURIComponent(query) + "\" with concept \"" + SemWeb._factors[query][index] + "\" from \"" + AppLogic._colorsToServicesMap[sourceColor] + "\"");
        }            
      }
    }          
  }
}   
SemWeb._annotateOpenCalaisEntity = function(openCalaisUri, uri, sourceColor) {
  var openCalaisRegExp = new RegExp(
      '(event:factor &lt;.*' +
      Util.quotemeta(openCalaisUri) + '.*&gt;;)');                        
  var semanticCaptions = document.getElementsByClassName('semanticCode');                    
  for (var i = 0, semanticCaption; semanticCaption = semanticCaptions[i]; i++) {
    if (semanticCaption.textContent.indexOf(openCalaisUri) !== -1) {
      semanticCaption.innerHTML = semanticCaption.innerHTML.replace(
          openCalaisRegExp,
          "event:factor &lt;<a href='" + uri +
              "'><span style='background-image: url(\"" + sourceColor +
              "\"); background-repeat: repeat-x;'>" +
              uri + "</span></a>&gt;;\n\t$1");
      if (AppLogic._debug) {
        AppLogic.consoleReplacement.log("[" + AppLogic._colorsToServicesMap[sourceColor] + "] Replaced OpenCalais entity \"" + decodeURIComponent(openCalaisUri) + "\" with concept \"" + uri + "\"");
      }                            
    }
  }                
}                       
SemWeb._annotateTag = function(literal, uri, sourceColor) {
  var literalTagRegExp = 
      new RegExp('\tctag:label "' + Util.quotemeta(literal) + '"');
  var semanticCaptions = document.getElementsByClassName('semanticCode');                    
  for (var i = 0, semanticCaption; semanticCaption = semanticCaptions[i]; i++) {
    if (semanticCaption.textContent.indexOf('ctag:label "' + literal + '"') !== -1) {
      semanticCaption.innerHTML = semanticCaption.innerHTML.replace(
          literalTagRegExp,
          '\tctag:means &lt;<a href="' + uri + '">' +
              '<span style="background-image: url(\'' + sourceColor +
              '\'); background-repeat: repeat-x;">' + uri + '</span></a>&gt;;\n' +
              '\tctag:label "' + literal + '"');
      if (AppLogic._debug) {
        AppLogic.consoleReplacement.log("[RDF] Annotated literal YouTube tag \"" + decodeURIComponent(literal) + "\" with concept \"" + uri + "\" from \"" + AppLogic._colorsToServicesMap[sourceColor] + "\"");
      }                              
    }
  }
  semanticCaptions = document.getElementsByClassName('labelSemanticTag');                    
  for (var i = 0, semanticCaption; semanticCaption = semanticCaptions[i]; i++) {
    if (semanticCaption.textContent.indexOf('ctag:label "' + literal + '"') !== -1) {
      semanticCaption.innerHTML = semanticCaption.innerHTML.replace(
          literalTagRegExp,
          '\tctag:means &lt;<a href="' + uri + '">' +
              '<span style="background-image: url(\'' + sourceColor +
              '\'); background-repeat: repeat-x;">' + uri + '</span></a>&gt;;\n' +
              '\tctag:label "' + literal + '"');
      if (AppLogic._debug) {
        AppLogic.consoleReplacement.log("[RDF] Annotated literal YouTube tag \"" + decodeURIComponent(literal) + "\" with concept \"" + uri + "\" from \"" + AppLogic._colorsToServicesMap[sourceColor] + "\"");
      }                              
    }
  }
  
}          

/* HTTP */
var Http;
if (!Http) {
  Http = {};
}
Http.FRAGMENT_KEY_SEPARATOR = ";";      
Http._factories = [
    function() { return new XMLHttpRequest(); },
    function() { return new ActiveXObject("Msxml2.XMLHTTP"); },
    function() { return new ActiveXObject("Microsoft.XMLHTTP"); }
];
Http._factory = null;
Http.newRequest = function() {
  if (Http._factory !== null) return Http._factory();

  for(var i = 0; i < Http._factories.length; i++) {
    try {
      var factory = Http._factories[i];
      var request = factory();
      if (request !== null) {
        Http._factory = factory;
        return request;
      }
    } catch(e) {
      continue;
    }
  }
  Http._factory = function() {
    throw new Error("XMLHttpRequest not supported");
  }
  Http._factory(); // Throw an error
}

Http.get = function(url, callback, options) {
  var request = Http.newRequest();
  var timer;
  if (options.timeout) {
    timer = window.setTimeout(function() {
      request.abort();
    },
    options.timeout);
  }
  request.onreadystatechange = function() {
    if (request.readyState === 4) {
      if (timer) {
        window.clearTimeout(timer);
      }
      if (request.status === 200) {
        callback(Http._getResponse(request));
      } else {
        if (options.errorHandler) {
          options.errorHandler(request.status, request.statusText);
        } else {
          callback(null);
        }
      }
    }
  }
  var target = url;
  if (options.parameters) {
    target += "?" + HTTP.encodeFormData(options.parameters);
  }
  request.open("GET", target);
  request.send(null);
}
Http.exists = function(url, callback, options) {
  var request = Http.newRequest();
  var timer;
  if (options.timeout) {
    timer = window.setTimeout(function() {
      request.abort();
      callback(-1);
    },
    options.timeout);
  }
  request.onreadystatechange = function() {
    if (request.readyState === 4) {
      if (timer) {
        window.clearTimeout(timer);
      }
      if (request.status === 200) {              
        callback(request.getResponseHeader('Content-Type'));
      } else {
        if (options.errorHandler) {
          options.errorHandler(request.status, request.statusText);
        } else {
          callback(request.status);
        }
      }            
    }
  }
  var target = url;
  if (options.parameters) {
    target += "?" + HTTP.encodeFormData(options.parameters);
  }
  target += "&headOnly=1";        
  request.open("HEAD", target);
  request.send(null);
}      

Http.post = function(url, values, callback, errorHandler) {
  var request = Http.newRequest();
  request.onreadystatechange = function() {
    if (request.readyState === 4) {
      if (request.status === 200) {
        callback(Http._getResponse(request));
      } else {
        if (errorHandler) {
          errorHandler(request.status,request.statusText);
        } else {                
          callback(null);
        }
      }
    }
  }
  request.open("POST", url);
  request.setRequestHeader(
      "Content-Type",
      "application/x-www-form-urlencoded");
  request.send(Http.encodeFormData(values));
}

Http.encodeFormData = function(data) {
  var pairs = [];
  var regexp = /%20/g; // A regular expression to match an encoded space

  for (var name in data) {
    var value = data[name].toString();
    var pair = encodeURIComponent(name).replace(regexp, "+") + '=' +
        encodeURIComponent(value).replace(regexp, "+");
    pairs.push(pair);
  }
  return pairs.join('&');
}

Http._getResponse = function(request) {
  switch(request.getResponseHeader("Content-Type")) {
    case "text/xml":
        return request.responseXML;
    case "text/json":
    case "application/json": 
    case "text/javascript":
    case "application/javascript":
    case "application/x-javascript":
        if (request.responseText.indexOf('{') !== -1) {
          return eval('(' + request.responseText + ')');              
        }
    default:
        return request.responseText;
  }
}

Http.newCrossXhr = function() {};
Http.newCrossXhr.prototype.open = function(_method, uri) {
  var script = document.createElement("script");        
  script.setAttribute("src", uri);
  script.setAttribute("type", "text/javascript");
  if (!Http.newCrossXhr.scripts) {
    Http.newCrossXhr.scripts = [script];        
  } else {
    Http.newCrossXhr.scripts.push(script);        
  }        
}
Http.newCrossXhr.prototype.send = function(_null) {
  var script = Http.newCrossXhr.scripts.pop();
  if (script.src.indexOf("callback") !== -1) {
    document.body.appendChild(script);
  }
  window.setTimeout(function() {
    for (var prop in script) {
      delete script[prop];
    }        
    document.body.removeChild(script);          
  },
  60 * 1000);
}
Http.setFragmentKey = function(key, value) {
  var trailingSeparatorRegExp =
      new RegExp(Http.FRAGMENT_KEY_SEPARATOR + '+$');
  window.location.hash =
      window.location.hash.replace(trailingSeparatorRegExp, '');
  var leadingSeparatorRegExp =
      new RegExp('^' + Http.FRAGMENT_KEY_SEPARATOR + '+');
  window.location.hash =
      window.location.hash.replace(leadingSeparatorRegExp, '');        
  var keys = window.location.hash.split(Http.FRAGMENT_KEY_SEPARATOR);
  var length = keys.length;
  for (var i = 0; i < length; i++) {
    if (keys[i].indexOf(key + "=") !== -1) {
      keys[i] = key + "=" + value;
      window.location.hash = keys.join(Http.FRAGMENT_KEY_SEPARATOR);
      break;
    }
  }          
  if (window.location.hash.indexOf(key + "=") === -1) {
    window.location.hash += window.location.hash.length > 0?
        Http.FRAGMENT_KEY_SEPARATOR + key + "=" + value : 
        key + "=" + value;
  }
  if (AppLogic._debug) {
    AppLogic.consoleReplacement.log("[HTTP] Set fragment key \"" + key + "\" with value \"" + value + "\"");
  }                
}
Http.unsetFragmentKey = function(key) {
  var trailingSeparatorRegExp =
      new RegExp(Http.FRAGMENT_KEY_SEPARATOR + '+$');
  window.location.hash =
      window.location.hash.replace(trailingSeparatorRegExp, '');
  var leadingSeparatorRegExp =
      new RegExp('^' + Http.FRAGMENT_KEY_SEPARATOR + '+');
  window.location.hash =
      window.location.hash.replace(leadingSeparatorRegExp, '');
  var keys = window.location.hash.split(Http.FRAGMENT_KEY_SEPARATOR);
  var length = keys.length;
  for (var i = 0; i < length; i++) {
    if (keys[i].indexOf(key + "=") !== -1) {
      keys[i] = '';
      window.location.hash =
          keys.join(Http.FRAGMENT_KEY_SEPARATOR).replace(
              trailingSeparatorRegExp, '');
      break;
    }
  }          
  if (AppLogic._debug) {
    AppLogic.consoleReplacement.log("[HTTP] Unset fragment key \"" + key + "\"");
  }                        
}    

/* YouTube */
var YouTube;
if (!YouTube) {
  YouTube = {};
}
YouTube.VIDEO_FEED_URI = "http://gdata.youtube.com/feeds/api/videos/";
YouTube.VIDEO_SEARCH_URI =
    "http://gdata.youtube.com/feeds/api/videos?max-results=5" +
    "&caption&format=5&v=2&alt=json";
YouTube.CAPTION_LIST_URI =
    "http://www.youtube.com/api/timedtext?asr_langs=en&caps=asr&key=yttt&hl=en&type=list&tlangs=1&v="; 
YouTube.CAPTION_URI =           
    "http://www.youtube.com/api/timedtext?type=track";            
YouTube._tags = [];
YouTube._videoId = -1;
YouTube.search = function(query, callback) {
  if (AppLogic._debug) {
    AppLogic.consoleReplacement.log("[YouTube] Searched for videos with: \"" + query + "\"");
  }                        
  query = encodeURIComponent(query);
  Http.unsetFragmentKey("id");
  Http.unsetFragmentKey("t");        
  Http.setFragmentKey("q", query);        
  var crossXhr = new Http.newCrossXhr();
  crossXhr.open(
      "GET",
      YouTube.VIDEO_SEARCH_URI +
          '&q=' + query +
          '&callback=' + callback
  );
  crossXhr.send(null);        
}
YouTube._receiveVideoSearchResult = function(response) {
  var youtubeSearchResults =
      document.getElementById("youtube-search-results");
  var length = response.feed.entry? response.feed.entry.length : 0;        
  if (AppLogic._debug) {
    AppLogic.consoleReplacement.log("[YouTube] Received " + length + " video results");
  }                                
  if (length > 0) {
    var html = '<table><tbody>';
    for(var i = 0; i < length; i++) {
      var id = response.feed.entry[i].id.$t.replace(/.*:(.*)$/, '$1');
      var title =
          response.feed.entry[i].title.$t.length > 100?
              response.feed.entry[i].title.$t.substring(0, 100) + ' [...]' :
              response.feed.entry[i].title.$t;
      var description =
          response.feed.entry[i].media$group.media$description.$t.length > 150?
              response.feed.entry[i].media$group.media$description.$t.substring(0, 150) + ' [...]' :
              response.feed.entry[i].media$group.media$description.$t;
      var duration =
          VideoPlayer._millisecondsToHoursMinutesSecondsMilliseconds(
              response.feed.entry[i].media$group.media$content[0].duration * 1000); 
      var thumb = response.feed.entry[i].media$group.media$thumbnail[0].url;
      html +=
          '<tr><td valign="top" rowspan="3"><img src="' + thumb +
          '" style="width:100px;" /></td><td><strong><nobr>' + title +
          '</nobr></strong></td></tr><tr><td>' + description +
          '</td></tr><tr><td><small>Duration ' + duration + ' &middot; On YouTube <a href="http://www.youtube.com/watch?v=' + id + '">' + id + '</a></small></td></tr><tr><td>' +
          '<button onclick="document.getElementById(\'youtube-video-id\').value = \'' +
          id +
          '\'; AppLogic._onGetVideoDataButtonClick();" type="button">' +
          'Annotate this Video</button></td>';          
    }
    html += '</tr></table>';
    youtubeSearchResults.innerHTML = html;
  } else {
    youtubeSearchResults.innerHTML =
        'No results <span style"font-family:monospace;">:-(</span>';
  }

}
YouTube.getVideoData = function(videoId, callback) {
  YouTube._videoId = videoId;
  var crossXhr = new Http.newCrossXhr();
  crossXhr.open(
      "GET",
      YouTube.VIDEO_FEED_URI +
          videoId + "?alt=json" +
          "&caption&callback=" + callback
  );        
  crossXhr.send(null);        
  if (AppLogic._debug) {
    AppLogic.consoleReplacement.log("[YouTube] Getting video details for \"" + videoId + "\"");
  }                                
}     

YouTube.getVideoCaptionList = function(videoId, callback) {
  var crossXhr = new Http.newCrossXhr();
  crossXhr.open(
      "GET",
      Util.PROXY_URI +
          "?path=" + encodeURIComponent(YouTube.CAPTION_LIST_URI + videoId) + 
          "&callback=" + callback + "&nocache=" +
          (new Date().getTime()) + "&tunnelXmlOverJson=1"
  );
  crossXhr.send(null);        
  if (AppLogic._debug) {
    AppLogic.consoleReplacement.log("[YouTube] Getting closed caption list for \"" + videoId + "\"");
  }                                
}     

YouTube.getVideoCaption = function(videoId, lang, callback) {
  var crossXhr = new Http.newCrossXhr();
  crossXhr.open(
      "GET",
      Util.PROXY_URI +
          "?path=" + encodeURIComponent(YouTube.CAPTION_URI + "&lang=" + lang + "&v=" + videoId ) + 
          "&callback=" + callback + "&nocache=" +
          (new Date().getTime()) + "&tunnelXmlOverJson=1"                  
  );
  crossXhr.send(null);        
  if (AppLogic._debug) {
    AppLogic.consoleReplacement.log("[YouTube] Getting closed captions for \"" + videoId + "\" in \"" + lang + "\"");
  }                                
}

YouTube._receiveVideoData = function(responseText) {
  var length = responseText.entry.media$group.media$content.length;
  var videoUrl = '';   
  var videoType = '';     
  var videoId = responseText.entry.id.$t.replace(/.*\/(.*?)$/g, "$1");
  if (AppLogic._debug) {
    AppLogic.consoleReplacement.log("[YouTube] Received video details for \"" + videoId + "\"");
  }                                        
  var plainTextContainer = document.getElementById("plaintext-container");        
  YouTube._tags = [];
  var videoTypeArray = responseText.entry.media$group.media$content;
  for (var i = 0; i < length; i++) {
    if ((videoTypeArray[i] === "video/webm") ||
        (videoTypeArray[i] === "video/ogg") ||
        (videoTypeArray[i].type === "video/mp4") ||              
        (videoTypeArray[i].type === "application/x-shockwave-flash")) {            
      videoType = videoTypeArray[i].type;
      videoUrl = videoType !== "application/x-shockwave-flash"?
          videoTypeArray[i].url :
          videoId
      break;    
    }
  }
  length = responseText.entry.category.length;
  var categories = [];
  var categoryArray = responseText.entry.category;
  for (var i = 0; i < length; i++) {
    var category = categoryArray[i];
    if (category.scheme === "http://gdata.youtube.com/schemas/2007/keywords.cat") {
      var tag = category.term.toLowerCase();
      YouTube._tags.push(tag);
      if (tag.length > Sindice.SINDICE_QUERY_MIN_LENGTH) {
        Sindice.search(encodeURIComponent(tag), "Sindice._receiveSindiceResult");              
        if (AppLogic._debug) {
          AppLogic.consoleReplacement.log("[Sindice] Searching for concepts for YouTube tag: \"" + tag + "\"");
        }                                      
      }
      Dbpedia.search(encodeURIComponent(tag), "Dbpedia._receiveDbpediaResult");
      Uberblic.search(encodeURIComponent(tag), "Uberblic._receiveUberblicResult");
      Freebase.search(encodeURIComponent(tag), "Freebase._receiveFreebaseResult");
      if (AppLogic._debug) {
        AppLogic.consoleReplacement.log("[DBpedia] Searching for concepts for YouTube tag: \"" + tag + "\"");
        AppLogic.consoleReplacement.log("[Uberblic] Searching for concepts for YouTube tag: \"" + tag + "\"");
        AppLogic.consoleReplacement.log("[Freebase] Searching for concepts for YouTube tag: \"" + tag + "\"");                            
      }                                                  
    } else if (category.scheme === "http://gdata.youtube.com/schemas/2007/categories.cat") {
      categories.push(category.term.toLowerCase() + "/" + category.label.toLowerCase());
    }
  }
  YouTube.getVideoCaptionList(
      YouTube._videoId,
      'YouTube._receiveVideoCaptionList'
  );
  YouTube._tags.sort(function(a, b) {  
    if (a.length > b.length)  
       return -1;  
    if (a.length < b.length)  
       return 1;  
    return 0;  
  });          
  var semanticContainer = 
      document.getElementById("semantic-container");
  var semanticContainerInnerHTML =
      "&lt;<a href='" + responseText.entry.id.$t + "'>" + responseText.entry.id.$t + '</a>&gt;\n' +
      '\tdc:title "' + responseText.entry.title.$t + '";\n';
  var plainTextContainerInnerHTML = responseText.entry.title.$t + ' ';     
  length = categories.length;
  var categoriesMarkup = '';
  for (var i = 0; i < length; i++) {            
    categoriesMarkup +=
        '\tdc:subject "' + categories[i] + '";\n';
  }
  semanticContainerInnerHTML += categoriesMarkup;

  length = responseText.entry.author.length;
  for (var i = 0; i < length; i++) {    
    semanticContainerInnerHTML += 
        '\tdc:creator [\n' +
          '\t\ta foaf:Person;\n' +
          '\t\tfoaf:nick "' + responseText.entry.author[i].name.$t + '";\n' + 
          '\t\tfoaf:homepage &lt;<a href="' + responseText.entry.author[i].uri.$t + '">' +
          responseText.entry.author[i].uri.$t + '</a>&gt;;\n' + 
          '\t\t];\n';
  }
  var description = responseText.entry.content.$t;
  description = description.replace(/[\[\]]/g, '').replace(/\n/g, ' ');
  description = description.replace(/\s+/g, ' ');
  semanticContainerInnerHTML += 
      '\tdc:date "' + responseText.entry.published.$t.substring(0, 10) + '";\n' + 
      '\tdc:description "' + description.replace(/"/g, '') + '".\n\n';
  plainTextContainerInnerHTML +=
      description.replace(/\bhttps?:\/\/.*?\b/gi, '') + ' ';    
  length = YouTube._tags.length;
  var tagsMarkup = '';
  for (var i = 0; i < length; i++) {            
    tagsMarkup +=
        "<span class='labelSemanticTag'>&lt;<a href='" + responseText.entry.id.$t + "'>" +
        responseText.entry.id.$t + "</a>&gt; ctag:tagged :tag" + i +
        ".\n" + ':tag' + i + '\n' +
        '\ta ctag:Tag;\n' +
        '\tctag:label "' + YouTube._tags[i] +'".\n\n</span>';
    plainTextContainerInnerHTML +=
        (i === 0? '' : ', ') +
        YouTube._tags[i] +
        (i === length - 1? ' ' : '');    
  }
  semanticContainerInnerHTML += tagsMarkup;
  semanticContainer.innerHTML = semanticContainerInnerHTML;

  var posterUrl = responseText.entry.media$group.media$thumbnail[0].url;
  var youTubeVideoContainer =
      document.getElementById("youtube-video-container");
  var youTubeVideoContainerInnerHTML;    
  if (videoType !== "application/x-shockwave-flash") {
    youTubeVideoContainerInnerHTML =  
        "<video id=\"video\" poster=\"" + posterUrl + "\" src=\"" +
        videoUrl + "\" height=\"300\">" +
        "</video>";
    Util.notify("Non-Flash video content is currently not supported by the YouTube API.");    
  } else {            
    youTubeVideoContainerInnerHTML =
        "<div style=\"overflow:hidden;height:310px !important;\">" +
        "<div id=\"youtube-inner-video-container\"></div></div>";
  }
  youTubeVideoContainerInnerHTML += 
      "<button class=\"controls\" type=\"button\" onclick=\"VideoPlayer.play();\">&#x25B6;</button>" +
      "<button class=\"controls\" type=\"button\" onclick=\"VideoPlayer.pause();\">\u2590\u2590&nbsp;</button>" +
      "<span id=\"currentTime\" class=\"currentTime\"><small>&nbsp;Use these controls, not the YouTube ones</small></span>";
  youTubeVideoContainer.innerHTML = youTubeVideoContainerInnerHTML;
  if (videoType === "application/x-shockwave-flash") {        
    YouTube.embedVideo(videoUrl);
  }
  plainTextContainer.innerHTML = plainTextContainerInnerHTML;
  YouTube._plaintextContainerText = plainTextContainerInnerHTML;        
}
YouTube._receivedCaptionList = {};
YouTube._tagsTurtle = '';

YouTube._receiveVideoCaptionList = function(responseText, defaultLanguage) {         
  if (AppLogic._debug) {
    AppLogic.consoleReplacement.log("[YouTube] Received closed caption list for video \"" + YouTube._videoId + "\"");                            
  }                
  YouTube._receivedCaptionList = responseText;                                                    
  var parser = new DOMParser();
  xmlDoc = parser.parseFromString(YouTube._receivedCaptionList.xml, "text/xml");        
  var results = xmlDoc.getElementsByTagName("target");
  var length = results.length;
  var html = '';
  if (length > 0) {            
    var availableLanguages = {};                      
    for (var i = 0; i < length; i++) {         
      var language = results[i].getAttribute('lang_code');
      var languageOriginal = results[i].getAttribute('lang_original');
      var isDefaultLanguage = results[i].getAttribute('lang_default');
      if (AppLogic._debug) {
        AppLogic.consoleReplacement.log("[YouTube] Found a closed caption track in \"" + languageOriginal + "\"" + (isDefaultLanguage? ' (default language)' : ''));                            
      }                                                                      
      availableLanguages[languageOriginal] = language;
      /*
      if ((isDefaultLanguage) &&
          (!defaultLanguage)) {
        html +=
            "<option selected='selected' value='" + language +
            "'>" + languageOriginal + "</option>";
            defaultLanguage = language;
      } else if ((defaultLanguage) && (language === defaultLanguage)) {
        html +=
            "<option selected='selected' value='" + language +
            "'>" + languageOriginal + "</option>";
            defaultLanguage = language;              
        if (AppLogic._debug) {
          AppLogic.consoleReplacement.log("[YouTube] Switched closed caption track language to \"" + languageOriginal + "\"");                            
        }                                                                            
      } else {
        html += "<option value=" + language + ">" + languageOriginal + "</option>";
        if (defaultLanguage === false) {
          defaultLanguage = language;
        }
      }
      */
      if (isDefaultLanguage) {
        html +=
            "<option selected='selected' value='" + language +
            "'>" + languageOriginal + "</option>";
        defaultLanguage = language;
      } else if ((defaultLanguage) && (language === defaultLanguage)) {
        html +=
            "<option selected='selected' value='" + language +
            "'>" + languageOriginal + "</option>";
            defaultLanguage = language;              
        if (AppLogic._debug) {
          AppLogic.consoleReplacement.log("[YouTube] Switched closed caption track language to \"" + languageOriginal + "\"");                            
        }                                                                            
      } else {
        html += "<option value=" + language + ">" + languageOriginal + "</option>";
        if (defaultLanguage === false) {
          defaultLanguage = language;
        }
      }              
      
      
      var languageSelect = document.getElementById("languageSelect")
      languageSelect.innerHTML = html;
      languageSelect.style.display = "block";
    }
  }
  var semanticContainer = 
      document.getElementById("semantic-container");
  //semanticContainer.innerHTML += html;
  YouTube.getVideoCaption(
      YouTube._videoId,
      defaultLanguage,              
      'YouTube._receiveVideoCaption'
  ); 
} 

YouTube._receiveVideoCaption = function(responseText, defaultLanguage) {         
  if (AppLogic._debug) {
    AppLogic.consoleReplacement.log("[YouTube] Received closed captions for video \"" + YouTube._videoId + "\"");                            
  }                                                          
  SemWeb._captions = [];
  Depictor.concepts = {};                       
  Depictor._receivedDepictions = [];                  
  document.getElementById("alchemy-container").innerHTML = '';
  document.getElementById("zemanta-container").innerHTML = '';
  document.getElementById("opencalais-container").innerHTML = '';
  document.getElementById("semantic-depiction-container").innerHTML = '';
  document.getElementById("depiction-container").innerHTML = '';
  var plainTextContainer = document.getElementById("plaintext-container");        
  var plainTextContainerInnerHTML = YouTube._plaintextContainerText;
  var youtubeCaptionContainer =
      document.getElementById("youtube-caption-container");
  youtubeCaptionContainer.innerHTML = '';    
  var youtubeCaptionContainerInnerHTML = '';
  var semanticContainer =
      document.getElementById("semantic-container");        

  if (!YouTube._tagsTurtle) {
    YouTube._tagsTurtle = semanticContainer.innerHTML;
  }        
  var semanticContainerInnerHTML =
      "@prefix event: &lt;<a href='http://purl.org/NET/c4dm/event.owl#'>http://purl.org/NET/c4dm/event.owl#</a>&gt;.\n" +            
      "@prefix owl: &lt;<a href='http://www.w3.org/2002/07/owl#'>http://www.w3.org/2002/07/owl#</a>&gt;.\n" +
      "@prefix foaf: &lt;<a href='http://xmlns.com/foaf/0.1/'>http://xmlns.com/foaf/0.1/</a>&gt;.\n" +
      "@prefix ctag: &lt;<a href='http://commontag.org/ns#'>http://commontag.org/ns#</a>&gt;.\n" + 
      "@prefix dc: &lt;<a href='http://purl.org/dc/elements/1.1/'>http://purl.org/dc/elements/1.1/</a>&gt;.\n" +              
      "@prefix tl: &lt;<a href='http://purl.org/NET/c4dm/timeline.owl#'>http://purl.org/NET/c4dm/timeline.owl#</a>&gt;.\n" +
      "@prefix xsd: &lt;<a href='http://www.w3.org/2001/XMLSchema#'>http://www.w3.org/2001/XMLSchema#</a>&gt;.\n" +
      "@prefix bibo: &lt;<a href='http://purl.org/ontology/bibo/'>http://purl.org/ontology/bibo/</a>&gt;.\n" +
      "@prefix rdf: &lt;<a href='http://www.w3.org/1999/02/22-rdf-syntax-ns#'>http://www.w3.org/1999/02/22-rdf-syntax-ns#</a>&gt;.\n\n" + 
      YouTube._tagsTurtle + '\n' +
      ":timeline a tl:TimeLine.\n\n";

  var speakerNameRegExp = new RegExp(".*>+\\s*(.+):.*", "g");
  var factorsRegExp =  new RegExp("(.*\\[\\s*(.+)\\s*\\].*)+", "g");
  var html;

  var lastSpeaker = '';
  var languageDetectionString = '';
  var languageDetectionStarted = false;
  
  var parser = new DOMParser();
  xmlDoc = parser.parseFromString(responseText.xml, "text/xml");        
  var results = xmlDoc.getElementsByTagName("text");
  var length = results.length;          
  for (var i = 0; i < length; i++) {          
    var result = results[i];
    var caption = {};
    if (!result.firstChild) {
      break;
    }
    caption.text = result.firstChild.nodeValue;
    caption.text = caption.text.replace(/\n/g, " ");          
    caption.start_ms = parseFloat(result.getAttribute('start'));
    caption.dur_ms = parseFloat(result.getAttribute('dur'));             
    if (languageDetectionString.length < 100) {
      languageDetectionString += caption.text + " ";
    } else {
      if (!languageDetectionStarted) {
        languageDetectionStarted = true;
        Goog.Language.detect(
            languageDetectionString,
            Goog.Language._receiveLanguageDetectionResult);
        if (AppLogic._debug) {
          AppLogic.consoleReplacement.log("[Google] Detecting language");                            
        }                                                                            
      }
    }
    var to = caption.start_ms + caption.dur_ms;
    SemWeb._captions[i] =
        {
          "from" : caption.start_ms,
          "to" : to
        };
    var factorsInCurrentCaption = [];
    var highlightedCaptionText = caption.text;
    var length2 = YouTube._tags.length;          
    // Checking whether YouTube tags are literally contained in the
    // current caption
    for (var j = 0; j < length2; j++) {                        
      var pattern =
          new RegExp("\b(" + Util.quotemeta(YouTube._tags[j]) + ")\b", "g");
      if (caption.text.match(pattern)) {
        highlightedCaptionText = caption.text.replace(
            pattern,
            '<span style="background-color:rgb(' + (j + 10) * 10 +', ' +
                (j + 10) * 10 + ', ' + (j + 10) * 10 + ')">$1</span>');
        factorsInCurrentCaption[j] = YouTube._tags[j].replace(/"/g, "");    
        if (AppLogic._debug) {
          AppLogic.consoleReplacement.log("[YouTube] Found YouTube tag \"" + YouTube._tags[j] + "\" in caption \"" + VideoPlayer._millisecondsToHoursMinutesSecondsMilliseconds(caption.start_ms) + "\"");                            
        }                                                                        
      }
    }           
    var normalizedCaptionText = caption.text;         
    // Checking for "Super joke [Laughter]"
    if (caption.text.match(factorsRegExp)) {                          
      var factor = caption.text.replace(factorsRegExp, "$2").toLowerCase();
      factorsInCurrentCaption.push(factor.replace(/"/g, ""));
      if (factor.length > Sindice.SINDICE_QUERY_MIN_LENGTH) {
        Sindice.search(encodeURIComponent(factor), "Sindice._receiveSindiceResult"); 
        if (AppLogic._debug) {
          AppLogic.consoleReplacement.log("[Sindice] Searching for concepts for literal factor: \"" + factor + "\"");
        }                                                    
      }
      Dbpedia.search(encodeURIComponent(factor), "Dbpedia._receiveDbpediaResult");
      Uberblic.search(encodeURIComponent(factor), "Uberblic._receiveUberblicResult");
      Freebase.search(encodeURIComponent(factor), "Freebase._receiveFreebaseResult");
      if (AppLogic._debug) {
        AppLogic.consoleReplacement.log("[DBpedia] Searching for concepts for literal factor: \"" + factor + "\"");
        AppLogic.consoleReplacement.log("[Uberblic] Searching for concepts for literal factor: \"" + factor + "\"");
        AppLogic.consoleReplacement.log("[Freebase] Searching for concepts for literal factor: \"" + factor + "\"");                            
      }                                                                
      var defactorizeRegExp =
          new RegExp("\\[\\s*" + Util.quotemeta(factor) + "\\s*\\]", "g");
      normalizedCaptionText = normalizedCaptionText.replace(defactorizeRegExp, "").replace(/\s+/g, " ");            
    }    
    var seconds = Math.floor(caption.start_ms / 1000);                  
    youtubeCaptionContainerInnerHTML +=
        "<div id=\"caption-" + i + "\" class=\"caption-div mouseout\">" +
        "<span class='caption-time'>" +
        VideoPlayer._millisecondsToHoursMinutesSecondsMilliseconds(caption.start_ms) +
        " - " + VideoPlayer._millisecondsToHoursMinutesSecondsMilliseconds(to) +
        "</span><br/><span class=\"captionText\">" +
        highlightedCaptionText +
        "</span> [<span class=\"seek-to\" value='" + seconds +
        "'>#</span>]</div>";
    html =
        "<div id=\"semantic-caption-" + i + "\" class=\"semantic-caption-div mouseout\">" +
        "<code class=\"semanticCode\">" + "&lt;<a href='http://gdata.youtube.com/feeds/api/videos/" +
        YouTube._videoId + "'>http://gdata.youtube.com/feeds/api/videos/" +
        YouTube._videoId + "</a>&gt; event:Event :captionEvent" + i + ".\n" +
        ":captionEvent" + i + "\n" +
        "\ta event:Event;\n";
    html +=
        "\tevent:time [\n" +
    		"\t\ttl:start \"PT" + (caption.start_ms / 1000) + "S\"^^xsd:duration;\n" +
    		"\t\ttl:end \"PT" + (to / 1000) + "S\"^^xsd:duration;\n" +          		
    		"\t\ttl:duration \"PT" + (caption.dur_ms / 1000) + "S\"^^xsd:duration;\n" +
        "\t\ttl:timeline :timeline;\n" +
    		"\t\t];\n";
    // Check for ">>Speaker: Hi dude"
    var matches = caption.text.match(speakerNameRegExp);
    if ((matches) || (lastSpeaker)) {    
      lastSpeaker = matches?                
          caption.text.replace(speakerNameRegExp, "$1") :
          lastSpeaker;
      var denamedRegExp =
          new RegExp(">+\\s*" + Util.quotemeta(lastSpeaker) + ":", "gi"); 
      normalizedCaptionText =
          normalizedCaptionText.replace(denamedRegExp, "").replace(/\s+/g, " ");
      html +=            
          "\tevent:agent [\n" +
          "\t\ta foaf:Person;\n" +
          "\t\tfoaf:name \"" +
          lastSpeaker +
          "\"" + ";\n" +
          "\t\t];\n";
    }          		
    var length3 = factorsInCurrentCaption.length;	
    for (var k = 0; k < length3; k++) {		            
      var semanticFactor = "\"" + factorsInCurrentCaption[k] + "\"";
      if (SemWeb._factors[factorsInCurrentCaption[k]]) {
        semanticFactor =
            "&lt;<a href='" + SemWeb._factors[factorsInCurrentCaption[k]][0] +
            ">" + SemWeb._factors[factorsInCurrentCaption[k]][0] + "</a>&gt;";
      }

      html +=          		
          "\tevent:factor " + semanticFactor + ";\n";
    }
    normalizedCaptionText =
        normalizedCaptionText.replace(/"/g, "").replace(
              /'/g, "&apos;").replace(/>*/g, "").trim();
    html +=          		
        "\tevent:product [\n" + 
        "\t\ta bibo:Quote;\n" +
        "\t\trdf:value \"" + normalizedCaptionText + "\"@" +
        Goog.Language._detectedLanguage + ";\n" +
        "\t\t].\n";
    html += "\n</code></div>";                         
    semanticContainerInnerHTML += html;
    plainTextContainerInnerHTML += " " + normalizedCaptionText;
    SemWeb._normalizedCaptions.push(
        Util.xmlDecode(Util.stripslashes(normalizedCaptionText)));
  }
  OpenCalais.search(plainTextContainerInnerHTML.replace(/%/g, '%25'));
  Zemanta.search(plainTextContainerInnerHTML);
  Alchemy.search(plainTextContainerInnerHTML);
  OpenAmplify.search(plainTextContainerInnerHTML);   
  if (AppLogic._debug) {
    AppLogic.consoleReplacement.log("[OpenCalais] Analyzing title, description, tags, and closed captions");
    AppLogic.consoleReplacement.log("[Zemanta] Analyzing title, description, tags, and closed captions");
    AppLogic.consoleReplacement.log("[Alchemy] Analyzing title, description, tags, and closed captions");
    AppLogic.consoleReplacement.log("[OpenAmplify] Analyzing title, description, tags, and closed captions");                            
  }
  plainTextContainer.innerHTML = plainTextContainerInnerHTML;
  youtubeCaptionContainer.innerHTML = youtubeCaptionContainerInnerHTML;
  semanticContainer.innerHTML = semanticContainerInnerHTML;                                                                                    
}
YouTube.embedVideo = function(videoId) {
  var params = { allowScriptAccess: "always" };
  var attributes = { id: "video" };
  swfobject.embedSWF(
      "http://www.youtube.com/v/" + videoId +
          "?enablejsapi=1&version=3&rel=0&autoplay=0&loop=0&disablekb=1&" +
          "egm=0&border=0&fs=0&hd=0&showsearch=0&showinfo=0&" +
          "iv_load_policy=3&cc_load_policy=0",
      "youtube-inner-video-container",
      "425",
      "356",
      "8",
      null,
      null,
      params,
      attributes
  );
} 

/* Sindice */
var Sindice;
if (!Sindice) {
  Sindice = {};    
}
Sindice.SINDICE_SEARCH_API_URI = "http://api.sindice.com/v2/search?";
Sindice.SINDICE_QUERY_MIN_LENGTH = 2;
Sindice.MAX_RESULTS = 1;
Sindice._color = "orange.png";
Sindice.search = function(query, callback) {
  var preserveQuery = query;
  query = query.replace(/[!\.,;\?:]*/g, '');
  var crossXhr = new Http.newCrossXhr();
  crossXhr.open(
      "GET",
      Util.PROXY_URI + 
          "?path=" + encodeURIComponent(Sindice.SINDICE_SEARCH_API_URI +
          "q=" + query +
          "&qt=term&page=1&format=json") + "&callback=" + callback +
          "&callbackParams=" + encodeURIComponent(preserveQuery));
  crossXhr.send(null);            
}
Sindice._receiveSindiceResult = function(responseText, query) {
  if (responseText.entries) {
    var length = Math.min(responseText.entries.length, Sindice.MAX_RESULTS);
    for (var i = 0; i < length; i++) {
      if (!SemWeb._factors[query]) {
        SemWeb._factors[query] = [];
      }
      if (!Util.contains(
              SemWeb._factors[query],
              responseText.entries[i].link)) {          
        var index = SemWeb._factors[query].length;    
        SemWeb._factors[query].push(responseText.entries[i].link);
        if (!Depictor.concepts.hasOwnProperty(
            responseText.entries[i].link)) {
          Depictor.concepts[responseText.entries[i].link] = [];          
        }
        SemWeb._annotateFactor(
            query,
            Sindice._color,
            index);              
      }
    }
    if (AppLogic._debug) {
      AppLogic.consoleReplacement.log("[Sindice] Received " + length + " concepts for YouTube tag \"" + decodeURIComponent(query) + "\"");
    }          
  }
}
Sindice.searchConcepts = function(query, callback, uri) {
  var preserveQuery = query;
  query = query.replace(/[!\.,;\?]*/g, '');
  var crossXhr = new Http.newCrossXhr();
  crossXhr.open(
      "GET",
      Util.PROXY_URI + 
          "?path=" + encodeURIComponent(Sindice.SINDICE_SEARCH_API_URI +
          "q=" + query +
          "&qt=term&page=1&format=json") + "&callback=" + callback +
          "&callbackParams=" + encodeURIComponent(uri) + "***" + preserveQuery);
  crossXhr.send(null);            
}
Sindice._receiveSindiceConceptsResult = function(responseText, uri) {
  if (responseText.entries) {
    var temp = uri.split("***");
    uri = temp[0];
    var length = Math.min(responseText.entries.length, Sindice.MAX_RESULTS);
    if (AppLogic._debug) {
      AppLogic.consoleReplacement.log("[Sindice] Received " + length + " concepts for OpenCalais entity \"" + decodeURIComponent(uri) + "\" named \"" + temp[1] + "\"");
    }                    
    for (var i = 0; i < length; i++) {
      if (!Depictor.concepts.hasOwnProperty(
          responseText.entries[i].link)) {
        Depictor.concepts[responseText.entries[i].link] = [];          
        Depictor._getDepictions(responseText.entries[i].link);                        
        if (AppLogic._debug) {
          AppLogic.consoleReplacement.log("[Sindice] Getting depictions of concept \"" + responseText.entries[i].link + "\"");
        }                                              
      }
      SemWeb._annotateOpenCalaisEntity(uri, responseText.entries[i].link, Sindice._color);
      break;
    }
  }
}      

/* Freebase */
var Freebase;
if (!Freebase) {
  Freebase = {};    
}
Freebase.FREEBASE_SEARCH_API_URI = "http://api.freebase.com/api/service/search?";
Freebase.FREEBASE_BASE_URI = "http://freebase.com";
Freebase.MAX_RESULTS = 1;
Freebase._color = "pink.png";
Freebase.search = function(query, callback) {
  var crossXhr = new Http.newCrossXhr();
  crossXhr.open(
      "GET",
      Util.PROXY_URI +
          "?path=" + encodeURIComponent(Freebase.FREEBASE_SEARCH_API_URI +
          "query=" + encodeURIComponent(query)) + "&callback=" + callback +
           "&callbackParams=" + encodeURIComponent(query));
  crossXhr.send(null);            
}
Freebase._receiveFreebaseResult = function(responseText, query) {
  if (responseText.result) {
    var length = Math.min(responseText.result.length, Freebase.MAX_RESULTS);
    for (var i = 0; i < length; i++) {
      if (!SemWeb._factors[query]) {
        SemWeb._factors[query] = [];
      }
      if (!Util.contains(
              SemWeb._factors[query],
              Freebase.FREEBASE_BASE_URI + responseText.result[i].id)) {
        var index = SemWeb._factors[query].length;
        SemWeb._factors[query].push(
            Freebase.FREEBASE_BASE_URI + responseText.result[i].id);          
        if (!Depictor.concepts.hasOwnProperty(
            Freebase.FREEBASE_BASE_URI + responseText.result[i].id)) {
          Depictor.concepts[
              Freebase.FREEBASE_BASE_URI + responseText.result[i].id] = [];          
        }                  
        SemWeb._annotateFactor(query, Freebase._color, index);                  
      }
    }
    if (AppLogic._debug) {
      AppLogic.consoleReplacement.log("[Freebase] Received " + length + " concepts for YouTube tag \"" + decodeURIComponent(query) + "\"");
    }                              
  }
}

/* Uberblic */
var Uberblic;
if (!Uberblic) {
  Uberblic = {};    
}
Uberblic.UBERBLIC_SEARCH_API_URI = "http://platform.uberblic.org/api/search?";
Uberblic.MAX_RESULTS = 1;
Uberblic._color = "lightblue.png";
Uberblic.search = function(query, callback) {
  var preserveQuery = query;
  query = query.replace(/[!\.,;\?]*/g, '');
  var crossXhr = new Http.newCrossXhr();
  crossXhr.open(
      "GET",
      Util.PROXY_URI +
          "?path=" + encodeURIComponent(Uberblic.UBERBLIC_SEARCH_API_URI +
          "query=" + encodeURIComponent(query)) + "&callback=" + callback +
          "&callbackParams=" + encodeURIComponent(preserveQuery));
  crossXhr.send(null);            
}
Uberblic._receiveUberblicResult = function(responseText, query) {
  if (responseText.results) {
    var length = Math.min(responseText.results.length, Uberblic.MAX_RESULTS);
    for (var i = 0; i < length; i++) {
      if (!SemWeb._factors[query]) {
        SemWeb._factors[query] = [];
      }
      if (!Util.contains(
              SemWeb._factors[query],
              responseText.results[i].uri)) {                            
        var index = SemWeb._factors[query].length;    
        SemWeb._factors[query].push(responseText.results[i].uri);          
        if (!Depictor.concepts.hasOwnProperty(
            responseText.results[i].uri)) {
          Depictor.concepts[responseText.results[i].uri] = [];                        
        }
        SemWeb._annotateFactor(query, Uberblic._color, index);
      }
    }
    if (AppLogic._debug) {
      AppLogic.consoleReplacement.log("[Uberblic] Received " + length + " concepts for YouTube tag \"" + decodeURIComponent(query) + "\"");
    }                              
  }
}

/* DBpedia */
var Dbpedia;
if (!Dbpedia) {
  Dbpedia = {};    
}
Dbpedia.DBPEDIA_SEARCH_API_URI =
    "http://lookup.dbpedia.org/api/search.asmx/KeywordSearch?QueryClass=";
Dbpedia.MAX_RESULTS = 1;
Dbpedia._color = 'darkblue.png';
Dbpedia.search = function(query, callback) {
  var crossXhr = new Http.newCrossXhr();
  crossXhr.open(
      "GET",
      Util.PROXY_URI +
          "?path=" + encodeURIComponent(Dbpedia.DBPEDIA_SEARCH_API_URI +
          "&MaxHits=" + Dbpedia.MAX_RESULTS + 
          "&QueryString=" + encodeURIComponent(query)) + "&callback=" +
          callback + "&tunnelXmlOverJson=1" +
          "&callbackParams=" + encodeURIComponent(query));
  crossXhr.send(null);            
}
Dbpedia._receiveDbpediaResult = function(responseText, query) {
  var parser = new DOMParser();
  xmlDoc = parser.parseFromString(responseText.xml, "text/xml");        
  var results = xmlDoc.getElementsByTagName("Result");
  if (results.length > 0) {
    var length = Math.min(results.length, Dbpedia.MAX_RESULTS);
    for (var i = 0; i < length; i++) {
      var childNodes = results[i].childNodes;
      var length2 = childNodes.length;
      for (var j = 0; j < length2; j++) {
        if (childNodes[j].nodeName === 'URI') {
          if (!SemWeb._factors[query]) {
            SemWeb._factors[query] = [];
          }
          if (!Util.contains(
                  SemWeb._factors[query],
                  childNodes[j].firstChild.nodeValue)) {          
            var index = SemWeb._factors[query].length;    
            SemWeb._factors[query].push(childNodes[j].firstChild.nodeValue);          
            if (!Depictor.concepts.hasOwnProperty(
                childNodes[j].firstChild.nodeValue)) {
              Depictor.concepts[
                  childNodes[j].firstChild.nodeValue] = [];                        
            }                  
            SemWeb._annotateFactor(query, Dbpedia._color, index);
          }
          break;
        }
      }
    }          
    if (AppLogic._debug) {
      AppLogic.consoleReplacement.log("[DBpedia] Received " + length + " concepts for YouTube tag \"" + decodeURIComponent(query) + "\"");
    }                    
  }
}      

/* Alchemy */
var Alchemy;
if (!Alchemy) {
  Alchemy = {};
}
Alchemy.LICENSE_ID = "c161578ef310b99d523277918f66ac8ecee5057a";
Alchemy.MAX_REQUEST_LENGTH_IN_BYTES = 150 * 1024;
Alchemy.API_URI = "http://access.alchemyapi.com/";
Alchemy._entities = {};
Alchemy._color = "red";
Alchemy.search = function(content) {      
  content =
      Util.truncateToNKb(content, Alchemy.MAX_REQUEST_LENGTH_IN_BYTES);

  function _receiveSearchResult1(response) {
    Alchemy._entities = response.entities;
    var params = {
        "apikey":	Alchemy.LICENSE_ID,
        "text":	content,
        "outputMode":	"json",
        "disambiguate": 1,
        "linkedData": 1,
        "coreference": 1,
        "quotatioms": 1,
        "showSourceText": 0,
        "path": Alchemy.API_URI + "calls/text/TextGetRankedConcepts"
    }
    Http.post(Util.PROXY_URI, params, Alchemy._receiveSearchResult, null);            
  }

  var params = {
      "apikey":	Alchemy.LICENSE_ID,
      "text":	content,
      "outputMode":	"json",
      "disambiguate": 1,
      "linkedData": 1,
      "coreference": 1,
      "quotatioms": 1,
      "showSourceText": 0,
      "path": Alchemy.API_URI + "calls/text/TextGetRankedNamedEntities"
  }
  Http.post(Util.PROXY_URI, params, _receiveSearchResult1, null);            
}
Alchemy._receiveSearchResult = function(response) {
  if (AppLogic._debug) {
    AppLogic.consoleReplacement.log("[AlchemyAPI] Received analysis results");
  }                     
  response.entities = Alchemy._entities;
  var alchemyContainer = document.getElementById("alchemy-container");
  var alchemyContainerInnerHTML = '';
  if (!response.concepts) {
    return;
  }
  var length1 = response.concepts.length;
  var socialTags = [];
  for (var i = 0; i < length1; i++) {
    var socialTag = response.concepts[i];
    var uris = [];
    for (key in socialTag) {
      if ((key === "text") ||
          (key === "relevance") ||
          (key === "name") ||
          (key === "subType") ||
          (key === "website") ||
          (key === "geo")) {              
        continue;
      }
      socialTag[key] = decodeURIComponent(socialTag[key]);
      uris.push(socialTag[key]);
      if (!Depictor.concepts.hasOwnProperty(socialTag[key])) {
        Depictor.concepts[socialTag[key]] = [];
        Depictor._getDepictions(socialTag[key]);                        
        if (AppLogic._debug) {
          AppLogic.consoleReplacement.log("[AlchemyAPI] Getting depictions of concept \"" + socialTag[key] + "\"");
        }                                
      }            
    }
    if (uris.length > 0) {
      socialTags.push(
          {
            "name": socialTag.text,
            "relevance": socialTag.relevance,
            "uris": uris
          });          
    }
  }
  var youtubeCaptionContainer =
      document.getElementById("youtube-caption-container");                
  alchemyContainerInnerHTML +=
      "<strong style='background-color:" + Alchemy._color +
      ";'>Social Tags (Alchemy):</strong><ul>";
  var length1 = socialTags.length;        
  for (var i = 0; i < length1; i++) {
    var length2 = socialTags[i].uris.length;
    var urisString = '';
    for (var j = 0; j < length2; j++) {
      urisString += '<li><a href="' + socialTags[i].uris[j] + '">' +
          socialTags[i].uris[j] + '</a></li>';
      if (Util.contains(YouTube._tags, socialTags[i].name.toLowerCase())) {
        SemWeb._annotateTag(
            socialTags[i].name.toLowerCase(),
            socialTags[i].uris[j],
            Alchemy._color);
      }                                       
    }
    alchemyContainerInnerHTML +=
        "<li>Name: <strong>" + socialTags[i].name + "</strong><br/>" +
        "Relevance: " + socialTags[i].relevance + "<br/>URIs: <ul>" +
        urisString + "</ul></li>"; 
    var exactRegExp =
        new RegExp("\\b(" + Util.quotemeta(socialTags[i].name) + ")\\b", "gi");          
    var length3 = socialTags[i].uris.length;          
    var captionTexts = document.getElementsByClassName('captionText');                    
    for (var j = 0, captionText; captionText = captionTexts[j]; j++) {              
      if (captionText.textContent.indexOf(socialTags[i].name) !== -1) {                   
        captionText.innerHTML = captionText.innerHTML.replace(
            exactRegExp,
            "<span style='color:black; background-image: url(" +
            Alchemy._color + ".png); " +
            "background-repeat: repeat-x;'>$1</span>");                  
        var semanticCaptionDiv =
            document.getElementById("semantic-caption-" + j);              
        for (var k = 0; k < length3; k++) {    
          if (semanticCaptionDiv.textContent.indexOf(socialTags[i].uris[k]) === -1) {
            semanticCaptionDiv.innerHTML = semanticCaptionDiv.innerHTML.replace(                    
                /\tevent:product \[/g,
                "\tevent:factor &lt;<a href='" + socialTags[i].uris[k] +
                    "'><span style='background-image: url(" +
                    Alchemy._color +
                    "); background-repeat: repeat-x;'>" +
                    socialTags[i].uris[k] +
                    "</span></a>&gt;;\n\tevent:product [");    
          }                                
        }
      }
    }
  }
  alchemyContainerInnerHTML += "</ul>";
  var length1 = response.entities.length;
  var entities = [];
  for (var i = 0; i < length1; i++) {
    var entity = response.entities[i];
    var uris = [];
    if (!entity.hasOwnProperty('disambiguated')) {
      continue;
    }
    for (key in entity.disambiguated) {
      if ((key === "name") ||
          (key === "subType") ||
          (key === "website") ||
          (key === "geo")) {
        continue;
      }            
      entity.disambiguated[key] =
          decodeURIComponent(entity.disambiguated[key]);
      uris.push(entity.disambiguated[key]);            
      if (!Depictor.concepts.hasOwnProperty(
          entity.disambiguated[key])) {
        Depictor.concepts[entity.disambiguated[key]] = [];                        
        Depictor._getDepictions(entity.disambiguated[key]);                        
        if (AppLogic._debug) {
          AppLogic.consoleReplacement.log("[AlchemyAPI] Getting depictions of concept \"" + entity.disambiguated[key] + "\"");
        }                                              
      }
    }
    if (uris.length > 0) {
      entities.push(
          {
            "name": entity.text,
            "relevance": entity.relevance,
            "uris": uris
          });          
    }
  }      
  alchemyContainerInnerHTML +=
      "<strong style='background-color:" + Alchemy._color +
      ";'>Entities (Alchemy):</strong><ul>";
  var length1 = entities.length;        
  for (var i = 0; i < length1; i++) {
    var length2 = entities[i].uris.length;
    var urisString = '';
    for (var j = 0; j < length2; j++) {
      urisString +=
          '<li><a href="' + entities[i].uris[j] + '">' +
          entities[i].uris[j] + '</a></li>';
      if (Util.contains(YouTube._tags, entities[i].name.toLowerCase())) {
        SemWeb._annotateTag(
            entities[i].name.toLowerCase(),
            entities[i].uris[j],
            Alchemy._color);
      }                                       
    }
    alchemyContainerInnerHTML +=
        "<li>Name: <strong>" + entities[i].name + "</strong><br/>" +
        "Relevance: " + entities[i].relevance + "<br/>URIs: <ul>" +
        urisString + "</ul></li>"; 
    alchemyContainerInnerHTML += "</ul>";        
    alchemyContainer.innerHTML = alchemyContainerInnerHTML;        

    var exactRegExp =
        new RegExp("\\b(" + Util.quotemeta(entities[i].name) + ")\\b", "gi");          
    var captionTexts = document.getElementsByClassName('captionText');                    
    for (var j = 0, captionText; captionText = captionTexts[j]; j++) {            
      if (captionText.textContent.toLowerCase().indexOf(entities[i].name.toLowerCase()) !== -1) {
        captionText.innerHTML = captionText.innerHTML.replace(
            exactRegExp,
            "<span style='color:black; background-image: url(" +
                Alchemy._color + ".png); " +
                "background-repeat: repeat-x;'>$1</span>");
        var semanticCaptionDiv =
            document.getElementById("semantic-caption-" + j);            
        for (var k = 0; k < length2; k++) {    
          semanticCaptionDiv.innerHTML = semanticCaptionDiv.innerHTML.replace(                    
              /\tevent:product \[/g,
              "\tevent:factor &lt;<a href='" + entities[i].uris[k] +
                  "'><span style='background-image: url(" + 
                  Alchemy._color + ".png);" +
                  "background-repeat: repeat-x;'>" +
                  entities[i].uris[k] +
                  "</span></a>&gt;;\n\tevent:product [");    
        }                                  
      }
    }
  }         
}        

/* Zemanta */
var Zemanta;
if (!Zemanta) {
  Zemanta = {};
}
Zemanta.MAX_REQUEST_LENGTH_IN_BYTES = 8 * 1024;
Zemanta.LICENSE_ID = "fnzgpfwqthaaexbmqvet5rcx";
Zemanta.API_URI = "http://api.zemanta.com/services/rest/0.0/";
Zemanta._color = "lime";
Zemanta.search = function(content) {
  content =
      Util.truncateToNKb(content, Zemanta.MAX_REQUEST_LENGTH_IN_BYTES);
  var params = {
      "method": "zemanta.suggest_markup",
      "api_key":	Zemanta.LICENSE_ID,
      "text":	content,
      "format":	"json",
      "return_rdf_links": 1,
      "path": Zemanta.API_URI
  }
  Http.post(Util.PROXY_URI, params, Zemanta._receiveSearchResult, null);            
}
Zemanta._receiveSearchResult = function(response) {
  if (!response) {
    return;
  }
  if (AppLogic._debug) {
    AppLogic.consoleReplacement.log("[Zemanta] Received analysis results");
  }                          
  var zemantaContainer = document.getElementById("zemanta-container");
  var zemantaContainerInnerHTML = '';
  if (!response.markup) {
    return;
  }
  var length1 = response.markup.links.length;
  var entities = [];
  for (var i = 0; i < length1; i++) {
    var entity = response.markup.links[i];
    var length2 = entity.target.length;
    var uris = [];
    for (var j = 0; j < length2; j++) {
      if (entity.target[j].type === "rdf") {
        entity.target[j].url = decodeURIComponent(entity.target[j].url);
        uris.push(entity.target[j].url);
        if (!Depictor.concepts.hasOwnProperty(
            entity.target[j].url)) {
          Depictor.concepts[entity.target[j].url] = [];                        
          Depictor._getDepictions(entity.target[j].url);
          if (AppLogic._debug) {
            AppLogic.consoleReplacement.log("[Zemanta] Getting depictions of concept \"" + entity.target[j].url + "\"");
          }                                                              
        }
      }
    }
    if (uris.length > 0) {
      entities.push(
          {
            "name": entity.anchor,
            "relevance": entity.confidence,
            "uris": uris
          });                          
    }
  }
  var youtubeCaptionContainer =
      document.getElementById("youtube-caption-container");        
  zemantaContainerInnerHTML +=
      "<strong style='background-color:" + Zemanta._color +
      ";'>Entities (Zemanta):</strong><ul>";
  length1 = entities.length;        
  for (var i = 0; i < length1; i++) {
    var length2 = entities[i].uris.length;
    var urisString = '';
    for (var j = 0; j < length2; j++) {
      urisString += '<li><a href="' + entities[i].uris[j] + '">' + entities[i].uris[j] + '</a></li>';
      if (Util.contains(YouTube._tags, entities[i].name.toLowerCase())) {
        SemWeb._annotateTag(
            entities[i].name.toLowerCase(),
            entities[i].uris[j],
            Zemanta._color);
      }                       
    }
    zemantaContainerInnerHTML +=
        "<li>Name: <strong>" + entities[i].name + "</strong><br/>" +
        "Relevance: " + entities[i].relevance + "<br/>URIs: <ul>" +
        urisString + "</ul></li>"; 
    zemantaContainerInnerHTML += "</ul>";        
    zemantaContainer.innerHTML = zemantaContainerInnerHTML;              
    var exactRegExp =
        new RegExp("\\b(" + Util.quotemeta(entities[i].name) + ")\\b", "gi");          
    var captionTexts = document.getElementsByClassName('captionText');                    
    for (var j = 0, captionText; captionText = captionTexts[j]; j++) {
      if (captionText.textContent.indexOf(entities[i].name) !== -1) {
        captionText.innerHTML = captionText.innerHTML.replace(
            exactRegExp,
            "<span style='color:black; background-image: url(" +
                Zemanta._color + ".png); " +
                "background-repeat: repeat-x;'>$1</span>");
        var semanticCaptionDiv =
            document.getElementById("semantic-caption-" + j);            
        for (var k = 0; k < length2; k++) {    
          semanticCaptionDiv.innerHTML = semanticCaptionDiv.innerHTML.replace(                    
              /\tevent:product \[/g,
              "\tevent:factor &lt;<a href='" + entities[i].uris[k] +
                  "'><span style='background-image: url(" + 
                  Zemanta._color + ".png);" +
                  "background-repeat: repeat-x;'>" +
                  entities[i].uris[k] +
                  "</span></a>&gt;;\n\tevent:product [");    
        }                                  
      }
    }
  }
}      

/* OpenAmplify */
var OpenAmplify;
if (!OpenAmplify) {
  OpenAmplify = {};
}
OpenAmplify.LICENSE_ID = "7ekfpx5dtccnnx88fkj39mfy67jx6b9y";
OpenAmplify.MAX_REQUEST_LENGTH_IN_BYTES = Math.floor(2.5 * 1024);
OpenAmplify.API_URI =
    "http://portaltnx20.openamplify.com/AmplifyWeb_v20/AmplifyThis?";
OpenAmplify.search = function(content) {
  content =
      Util.truncateToNKb(content, OpenAmplify.MAX_REQUEST_LENGTH_IN_BYTES);        
  var params =
      {
        "analysis": "all",
        "apiKey": OpenAmplify.LICENSE_ID,
        "outputformat": "json",
        "scoring": "standard",
        "inputtext": content,
        "path": OpenAmplify.API_URI
      };
  Http.post(Util.PROXY_URI, params, OpenAmplify._receiveSearchResult, null);                        
}
OpenAmplify._receiveSearchResult = function(response) {
  if (AppLogic._debug) {
    AppLogic.consoleReplacement.log("[OpenAmplify] Received analysis results");
  }                          
  // doing nothing with the results so far...
}

/* OpenCalais */
var OpenCalais;
if (!OpenCalais) {
  OpenCalais = {};
}
OpenCalais.MAX_REQUEST_CHARS = 100000;
OpenCalais.LICENSE_ID = "vvdskgg3qj86h5w7jn2ay9yh";
OpenCalais._color = "yellow";
OpenCalais._sameAs = {};
OpenCalais.PARAMS_XML =
    '<c:params ' +
        'xmlns:c="http://s.opencalais.com/1/pred/" '+
        'xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">' +
      '<c:processingDirectives ' +
          'c:contentType="TEXT/RAW" ' +
          'c:outputFormat="Application/JSON" ' +
          'c:calculateRelevanceScore="TRUE" ' +
          'c:omitOutputtingOriginalText="TRUE" ' +
          'c:enableMetadataType="SocialTags">' + 
      '</c:processingDirectives>' +
      '<c:userDirectives ' +
          'c:allowDistribution="FALSE" ' +
          'c:allowSearch="FALSE" ' +
          'c:externalID="tomayac.com" ' +
          'c:submitter="Thomas Steiner">' +
      '</c:userDirectives>' +                
    '</c:params>';
OpenCalais.API_URI = "http://api.opencalais.com/enlighten/rest/";
OpenCalais.search = function(content) { 
  if (content.length > OpenCalais.MAX_REQUEST_CHARS) {
    content = content.substring(0, OpenCalais.MAX_REQUEST_CHARS);
  }               
  var params =
      {
        "licenseID": OpenCalais.LICENSE_ID,
        "content": content,        
        "paramsXML": encodeURIComponent(OpenCalais.PARAMS_XML),
        "path": OpenCalais.API_URI
      };  
  Http.post(Util.PROXY_URI, params, OpenCalais._receiveSearchResult, null);            
}
OpenCalais._receiveSearchResult = function(response) {
  if (!response) {
    return;
  }
  if (AppLogic._debug) {
    AppLogic.consoleReplacement.log("[OpenCalais] Received analysis results");
  }                                  
  var openCalaisContainer =
      document.getElementById("opencalais-container");
  var openCalaisContainerInnerHTML = ''; 
  var entities = [];
  var socialTags = [];
  var topics = [];
  for (key in response) {
    if (key === "doc") {
      continue;
    } else {
       var name = response[key]["categoryName"]?
          response[key]["categoryName"] :
          response[key]["name"];
      var uri = key;    
      if (response[key]["resolutions"]) {
        uri = response[key]["resolutions"][0].id;                
        name = response[key]["resolutions"][0].name;
      }
      switch(response[key]["_typeGroup"]) {
        case "topics":
            topics.push(
                {
                  "name": name,
                  "relevance": response[key].score,
                  "uri": response[key].category
                });
            break;
        case "entities":
            entities.push(
                {
                  "name": name,
                  "relevance": response[key].relevance,
                  "uri": uri,
                  "instances" : response[key].instances
                }); 
            break;
        case "socialTag":
            socialTags.push(
                {
                  "name": name,
                  "relevance": response[key].importance,
                  "uri": response[key].socialTag
                });
            break;
      }
    }          
  }
  openCalaisContainerInnerHTML +=
      "<strong style='background-color:" + OpenCalais._color +
      ";'>Topics (OpenCalais):</strong><ul>";
  var length = topics.length;
  for (var i = 0; i < length; i++) {
    openCalaisContainerInnerHTML +=
        "<li>Name: <strong>" + topics[i].name + "</strong><br/>Relevance: " +
        topics[i].relevance + "<br/>URI: <a href='" + topics[i].uri +
        "'>" + topics[i].uri + "</a></li>"; 
  }
  openCalaisContainerInnerHTML += "</ul>";

  openCalaisContainerInnerHTML +=
      "<br/><strong style='background-color:" + OpenCalais._color +
      ";'>Entities (OpenCalais):</strong><ul>";
  var length0 = entities.length;
  var length2 = SemWeb._normalizedCaptions.length;
  for (var i = 0; i < length0; i++) {
    OpenCalais.getSameAsData(entities[i].uri, 'OpenCalais._receiveSameAsResult');
    if (AppLogic._debug) {
      AppLogic.consoleReplacement.log("[OpenCalais] Getting owl:sameAs data for concept \"" + entities[i].uri + "\"");
    }
    if (entities[i].name.length > Sindice.SINDICE_QUERY_MIN_LENGTH) {
      Sindice.searchConcepts(encodeURIComponent(entities[i].name.toLowerCase()), "Sindice._receiveSindiceConceptsResult", entities[i].uri);              
      if (AppLogic._debug) {
        AppLogic.consoleReplacement.log("[Sindice] Searching for concepts for OpenCalais entity: \"" + entities[i].uri + "\" named \"" + entities[i].name.toLowerCase() + "\"");
      }                                      
    }                                                                       
    if (Util.contains(YouTube._tags, entities[i].name.toLowerCase())) {
      SemWeb._annotateTag(
          entities[i].name.toLowerCase(),
          entities[i].uri,
          OpenCalais._color);
    }           
    openCalaisContainerInnerHTML +=
        "<li>Name: <strong>" + entities[i].name + "</strong><br/>" +
        "Relevance: " + entities[i].relevance + "<br/>URI: <a href='" +
        entities[i].uri + "'>" + entities[i].uri + "</a></li>"; 
    var length1 = entities[i].instances.length;
    for (var j = 0; j < length1; j++) {
      var instance = entities[i].instances[j];
      var exact = instance.exact.trim().replace(/\s+/g, " ");
      var prefix = instance.prefix?
          instance.prefix.trim().replace(/\s+/g, " ") :
          '';          
      prefix = Util.quotemeta(Util.stripslashes(prefix));
      var suffix = instance.suffix?
          instance.suffix.trim().replace(/\s+/g, " ") :
          '';
      suffix = Util.quotemeta(Util.stripslashes(suffix));
      var instanceRegExp =
          new RegExp(prefix + '\\s*' + exact + '\\s*' + suffix);                  
      for (var k = 0; k < length2; k++) {
        var matchAgainstCapation;
        if (k === 0) {
          matchAgainstCapation =
              SemWeb._normalizedCaptions[k] + ' ' +
              SemWeb._normalizedCaptions[k + 1] + ' ' +
              SemWeb._normalizedCaptions[k + 2];  
        } else if (k === 1) {
          matchAgainstCapation =
              SemWeb._normalizedCaptions[k - 1] + ' ' +
              SemWeb._normalizedCaptions[k] + ' ' +
              SemWeb._normalizedCaptions[k + 1] + ' ' +
              SemWeb._normalizedCaptions[k + 2];                  
        } else if (k === length2 - 2) {
          matchAgainstCapation =
              SemWeb._normalizedCaptions[k - 2] + ' ' +
              SemWeb._normalizedCaptions[k - 1] + ' ' +
              SemWeb._normalizedCaptions[k] + ' ' +
              SemWeb._normalizedCaptions[k + 1];
        } else if (k === length2 - 1) {
          matchAgainstCapation =
              SemWeb._normalizedCaptions[k - 2] + ' ' +
              SemWeb._normalizedCaptions[k - 1] + ' ' +
              SemWeb._normalizedCaptions[k];
        } else {
          matchAgainstCapation =
              SemWeb._normalizedCaptions[k - 2] + ' ' +
              SemWeb._normalizedCaptions[k - 1] + ' ' +
              SemWeb._normalizedCaptions[k] + ' ' +
              SemWeb._normalizedCaptions[k + 1] + ' ' +
              SemWeb._normalizedCaptions[k + 2];  
        }   
        if (instanceRegExp.test(matchAgainstCapation)) {
          var exactRegExp =
              new RegExp("\\b(" + Util.quotemeta(exact) + ")\\b", "gi");                              
          var exactCaptionIndex;
          // ordered by frequency (tested) 
          if (exactRegExp.test(SemWeb._normalizedCaptions[k])) {
            exactCaptionIndex = k;                      
          } else if (exactRegExp.test(SemWeb._normalizedCaptions[k - 1])) {
            exactCaptionIndex = k - 1;                      
          } else if (exactRegExp.test(SemWeb._normalizedCaptions[k + 1])) {                  
            exactCaptionIndex = k + 1;                      
          }
          var captionDiv =
              document.getElementById("caption-" + exactCaptionIndex);                
          if (captionDiv) {
            captionDiv.innerHTML = captionDiv.innerHTML.replace(
                exactRegExp,
                "<span style='color:black; background-image: " +
                    "url(" + OpenCalais._color +
                    ".png); background-repeat: repeat-x;'>" +
                    "$1</span>");
          }
          var semanticCaptionDiv =
              document.getElementById("semantic-caption-" +
              exactCaptionIndex);                
          if (semanticCaptionDiv) {
            if (semanticCaptionDiv.textContent.indexOf(entities[i].uri) === -1) {
              semanticCaptionDiv.innerHTML = semanticCaptionDiv.innerHTML.replace(                    
                  /\tevent:product \[/g,
                  "\tevent:factor &lt;<a href='" + entities[i].uri +
                      "'><span style='background-image: url(" +
                      OpenCalais._color + ".png); " +
                      "background-repeat: repeat-x;'>" + entities[i].uri +
                      "</span></a>&gt;;\n\tevent:product [");    
            }
          }
        }              
      }    
    }
  }
  openCalaisContainerInnerHTML += "</ul>";

  openCalaisContainerInnerHTML +=
      "<br/><strong style='background-color:" + OpenCalais._color +
      ";'>Social Tags (OpenCalais):</strong><ul>";
  length = socialTags.length;
  for (var i = 0; i < length; i++) {
    openCalaisContainerInnerHTML +=
        "<li>Name: <strong>" + socialTags[i].name + "</strong><br/>" +
        "Relevance: " + socialTags[i].relevance + "<br/>URI: <a href='" +
        socialTags[i].uri + "'>" + socialTags[i].uri + "</a></li>"; 
  }
  openCalaisContainerInnerHTML += "</ul>";        
  openCalaisContainer.innerHTML = openCalaisContainerInnerHTML;          
}
OpenCalais.getSameAsData = function(uri, callback) {
  var crossXhr = new Http.newCrossXhr();
  crossXhr.open(
      "GET",
      Util.PROXY_URI + "?path=" + uri + ".json" + "&callback=" + callback);
  crossXhr.send(null);            
}
OpenCalais._receiveSameAsResult = function(response) {        
  var semanticContainer =
      document.getElementById("semantic-container");
  if (AppLogic._debug) {
    for (var key in response) {          
      if (key.substring(0, 7) === "http://") { 
        AppLogic.consoleReplacement.log("[OpenCalais] Received owl:sameAs results for concept \"" + key + "\"");
        break;
      }
    }
  }   
  for (var key in response) {          
    if (key.substring(0, 7) === "http://") { 
      var length;
      if (response[key].sameAs && Util.isArray(response[key].sameAs)) {
        response[key].sameAs =
            response[key].sameAs.concat(response[key].page);
        length = response[key].sameAs.length;
      } else if (response[key].sameAs) {              
        response[key].sameAs = [response[key].sameAs];              
        response[key].sameAs =
            response[key].sameAs.concat(response[key].page);
        length = response[key].sameAs.length;    
      } else if ((response[key].disambiguationAlternative) &&
                 (Util.isString(response[key].disambiguationAlternative))) {
        if (Util.isArray(response[response[key].disambiguationAlternative].sameAs)) {
          response[key].sameAs =
              response[response[key].disambiguationAlternative].sameAs;
          response[key].sameAs =
              response[key].sameAs.concat(response[response[key].disambiguationAlternative].page);    
          length = response[key].sameAs.length;     
        } else {
          response[response[key].disambiguationAlternative].sameAs =
              [response[response[key].disambiguationAlternative].sameAs];
          response[key].sameAs =  
              response[response[key].disambiguationAlternative].sameAs;
          response[key].sameAs =
              response[key].sameAs.concat(response[response[key].disambiguationAlternative].page);
          length = response[key].sameAs.length;     
        }
      } else {
        length = null;
      }            

      if (length) {    
        var sameAsString = '';            
        OpenCalais._sameAs[key] = [];  
        for (var i = 0; i < length; i++) {
          response[key].sameAs[i] =
              decodeURIComponent(response[key].sameAs[i]);                
          sameAsString +=
              '&lt;<a href="' + key + '">' + key + '</a>&gt; = &lt;' +
              '<a href="' + response[key].sameAs[i] + '">' +
              response[key].sameAs[i] + '</a>&gt;.\n';                
          OpenCalais._sameAs[key].push(response[key].sameAs[i]);                    
          if (!Depictor.concepts.hasOwnProperty(
              response[key].sameAs[i])) {
            Depictor.concepts[response[key].sameAs[i]] = [];                        
            Depictor._getDepictions(response[key].sameAs[i]);
            if (AppLogic._debug) {
              AppLogic.consoleReplacement.log("[OpenCalais] Getting depictions of concept \"" + response[key].sameAs[i] + "\"");
            }                                                              
          }                                       
        }
        sameAsString += '\n';
        semanticContainer.innerHTML += '\n' + sameAsString;
      }
      break;
    }
  }
}

/* Goog */
var Goog;
if (!Goog) {
  Goog = {};
}
if (!Goog.Language) Goog.Language = {};
if (!Goog.Image) Goog.Image = {};
Goog.Language._detectedLanguage = false;      
Goog.Language.detect = function(languageDetectionString, callback) {
  google.language.detect(languageDetectionString, callback);                
}
Goog.Language._receiveLanguageDetectionResult = function(responseText) {        
  if (!responseText.error) {
    var semanticContainer =
        document.getElementById("semantic-container");
    Goog.Language._detectedLanguage = responseText.language;    
    if (AppLogic._debug) {
      AppLogic.consoleReplacement.log("[Google] Detected language is \"" + Goog.Language._detectedLanguage + "\"");
    }                                                                        
    var semanticCaptions = document.getElementsByClassName('semanticCode');       
    for (var i = 0, semanticCaption; semanticCaption = semanticCaptions[i]; i++) {
      if (semanticCaption.textContent.indexOf('@false') !== -1) {
        semanticCaption.innerHTML = semanticCaption.innerHTML.replace(
            /"@false/g,
            "\"@" + Goog.Language._detectedLanguage);                                
      }
    }
  }
}
Goog.Image.API_SEARCH_URI =
    "http://ajax.googleapis.com/ajax/services/search/images?v=1.0";
Goog.Image.search = function(query, callback) {
  var crossXhr = new Http.newCrossXhr();
  crossXhr.open(
      "GET",
      Goog.Image.API_SEARCH_URI +
          '&q=' + query +
          '&hl=' + Goog.Language._detectedLanguage +
          '&callback=' + callback
  );
  crossXhr.send(null); 
}
Goog.Image._receiveSearchResult = function(
    response,
    originalUri,
    index,
    uri,
    query) {
  var length = response.responseData.results.length;
  for (var i = (index !== null? index : 0); i < length; /* noop */) {
    var currentImage =
        decodeURIComponent(response.responseData.results[i].url);          
    Http.exists(
      Util.PROXY_URI + '?path=' + currentImage,
      function(innerResponse) {
        if (innerResponse !== 404) {
          if ((innerResponse === 'text/xml') ||
              (innerResponse === 'image/svg+xml')) {
            currentImage += '####IS_SVG';
          }
          Depictor._storeDepiction(currentImage, originalUri, uri, true);
          if (AppLogic._debug) {
            AppLogic.consoleReplacement.log("[Google] Received image for query \"" + decodeURIComponent(query) + "\" at URL \"" + currentImage + "\" for concept \"" + uri + "\"");
          }                                                                                        
          return;
        } else if (innerResponse === 404) { 
          i++; 
          if (i < length) {                  
            Goog.Image._receiveSearchResult(
                response, 
                originalUri,
                i,
                uri,
                null);
          } else {
            return;
          }
        }
      },
      {"timeout": 60 * 1000});          
    break;  
  }
}

/* Converter */
var Converter;
if (!Converter) {
  Converter = {};
}
Converter._sourceRdfXml = '';
Converter._sourceRdfTurtle = '';
Converter._outputFormat = '';
Converter.convert = function(output) { 
  Converter._outputFormat = output;        
  if (output === "turtle") {
    var semanticContainer =
        document.getElementById("semantic-container");
    if (Converter._sourceRdfTurtle) {    
      semanticContainer.innerHTML =
          Converter._sourceRdfTurtle;
    }
    if (AppLogic._debug) {
      AppLogic.consoleReplacement.log("[Converter] Getting conversion to " + output);
    }                                                                                                                  
    return;
  } else {
    if (VideoPlayer.initialized) {
      VideoPlayer.pause();
    }                
  }        
  if (Converter._sourceRdfXml) {     
    if (output !== "rdfxml") {
      var params =
          {
            "body": encodeURIComponent(
                  Converter._sourceRdfXml).replace(/%20/g, '+'),
            "format": output,        
            "type": "",
            "tunnelXmlOverJson": 1,
            "path": 'http://any23.org/'
          };  
      Http.post(Util.PROXY_URI, params, Converter._receiveConversion, null);
      if (AppLogic._debug) {
        AppLogic.consoleReplacement.log("[Converter] Getting conversion to " + output);
      }                                                                                                    
    } else {
      var semanticContainer =
          document.getElementById("semantic-container");
      var html = Converter._sourceRdfXml.replace(/&/g, '&amp;');
      html = html.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      semanticContainer.innerHTML = html;
      if (AppLogic._debug) {
        AppLogic.consoleReplacement.log("[Converter] Getting conversion to " + output);
      }                                                                                                                
    }
  } else {
    Converter.initialConvert(output);
  }
}
Converter._receiveConversion = function(response) {
  var semanticContainer =
      document.getElementById("semantic-container");
  var html = response.xml.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  html =
      html.replace(/\s\.&lt;/g, ' .\n&lt;').replace(/\s\._:/g, ' .\n_:');
  html = html.replace(/\s\.@/g, ' .\n@');
  html = html.replace(/\s;\s/g, ' ;\n\t');
  semanticContainer.innerHTML = html;
  if (AppLogic._debug) {
    AppLogic.consoleReplacement.log("[Converter] Received conversion to " + Converter._outputFormat);
  }                                                                                                                
}      
Converter.initialConvert = function(output) {        
  var semanticContainer =
      document.getElementById("semantic-container");
  Converter._sourceRdfTurtle = semanticContainer.innerHTML;                    
  var params =
      {
        "content": encodeURIComponent(semanticContainer.textContent),
        "format": "n3",        
        "tunnelXmlOverJson": 1,
        "path": 'http://www.rdfabout.com/demo/validator/validate.xpd'
      };  
  Http.post(Util.PROXY_URI, params, Converter._receiveInitialConversion, null);
  if (AppLogic._debug) {
    AppLogic.consoleReplacement.log("[Converter] Getting conversion to " + output);
  }                                                                                                            
}
Converter._receiveInitialConversion = function(response) {
  var from =
      response.xml.indexOf("&lt;?xml version=\"1.0\"?&gt;&lt;rdf:RDF");
  var temp = "&lt;/rdf:RDF&gt;";    
  var to = response.xml.indexOf(temp) + temp.length;
  var xmlRdfString = response.xml.substring(from, to);
  xmlRdfString = xmlRdfString.replace(/&gt;(\s*)&lt;/g, "&gt;\n$1&lt;");
  Converter._sourceRdfXml =
      xmlRdfString.replace(/&gt;/g, '>').replace(/&lt;/g, '<');
  if (Converter._outputFormat !== "rdfxml") {
    Converter.convert(Converter._outputFormat);
  } else {
    var semanticContainer =
        document.getElementById("semantic-container");
    semanticContainer.innerHTML = xmlRdfString;              
  }
  if (AppLogic._debug) {
    AppLogic.consoleReplacement.log("[Converter] Received conversion to " + Converter._outputFormat);
  }                                                                                                                        
}  

var Download;
if (!Download) {
  Download = {};
}
Download.DOWNLOAD_URI = "./download.php5";
Download.postData = function(format) {
  var semanticContainer =
      document.getElementById("semantic-container");        
  var contentType;
  var extension;
  if (format === "rdfxml") {
    extension = "rdf";
    contentType = "application/rdf+xml";
  } else if (format === "n3") {
    extension = "n3";
    contentType = "text/n3";          
  } else if (format === "turtle") {
    extension = "ttl";
    contentType = "text/turtle";                    
  } else if (format === "ntriples") {
    extension = "nt";
    contentType = "text/plain";                              
  } 
  var form = document.createElement("form");
  form.setAttribute("action", Download.DOWNLOAD_URI);
  form.setAttribute("method", "post");
  form.setAttribute("encoding", "application/x-www-form-urlencoded");
  form.setAttribute("style", "display:none;");
  var data = semanticContainer.textContent.replace(/&/g, '&amp;');
  form.innerHTML = 
    '<textarea name="body">' + data + '</textarea>' +
    '<input type="text" name="contentType" value="' + contentType + '" />' +
    '<input type="text" name="extension" value="' + extension + '" />' +
    '<input type="text" name="videoId" value="' + YouTube._videoId + '" />';        
  document.body.appendChild(form);
  form.submit(); 
  if (AppLogic._debug) {
    AppLogic.consoleReplacement.log("[Download] Prepared data for download");
  }                                                                                                                                   
  window.setTimeout(function() {
    form.parentNode.removeChild(form);
  },
  10 * 1000);
}   

var Depictor;
if (!Depictor) {
  Depictor = {};
}
Depictor.concepts = {};
Depictor._urisWithDepictions =
    [
      'dbpedia.org',
      'freebase.com',
      'semsol.org'
    ];
Depictor._potentialDepictionCandidates = 
    [
      'foaf:depiction',
      '<http://rdf.freebase.com/ns/common.topic.image>',
      'cb:image'
    ];
Depictor._receivedDepictions = [];    
Depictor._drawnDepictions = [];
Depictor._getDepictions = function(uri) {
  var originalUri = uri;
  if (Depictor.concepts[uri].length === 0) {
    var index =
        Util.containsPrefixAndWhich(Depictor._urisWithDepictions, uri);
    if (index >= 0) {
      var engine = Depictor._urisWithDepictions[index];
      switch(engine) {
        case "dbpedia.org":
          uri = uri.replace(
              /http:\/\/dbpedia\.org\/resource\/(.*)/gi,
              'http://dbpedia.org/data/$1') + '.n3';
          break;
        case "freebase.com":
          uri = uri.replace(
              /http:\/\/rdf\.freebase\.com\/ns\/(.*)/gi,
              '$1');
          uri = uri.replace(/\//g, '.');    
          uri = 'http://rdf.freebase.com/rdf/' + uri;
          break;
        case "semsol.org":
          uri = uri.replace(/#.*$/g, '.ttl');
          uri = uri.replace(/\.rdf$/g, '.ttl');
          break;
      }                            
      Depictor._helperHttpGet(uri, originalUri);
    }
  }
}
Depictor._helperHttpGet = function(uri, originalUri) {
  Http.get(
      Util.PROXY_URI +
          '?path=' + uri +
          '&contentType=text/plain' +
          '&acceptHeader=application/x-turtle, text/turtle, text/n3',
      function(response) {
        Depictor._receiveDepiction(response, originalUri);              
      },                      
      {
        "timeout": 60 * 1000
      });                        
}

Depictor._receiveDepiction = function(response, uri) {
  if (!response) {
    return;
  }
  var length = Depictor._potentialDepictionCandidates.length;
  var regExps = [];
  for (var i = 0; i < length; i++) {
    var depictorCandidate = Depictor._potentialDepictionCandidates[i];
    regExps.push(new RegExp(Util.quotemeta(depictorCandidate)));
  }
  for (var i = 0; i < length; i++) {
    var depictorCandidate = Depictor._potentialDepictionCandidates[i];
    var candidateIndex = response.indexOf(depictorCandidate);
    if (candidateIndex >= 0) {
      var temp = response.substring(candidateIndex);
      var length3 = temp.length - 1;
      var index1 = temp.indexOf(';') !== -1?
          temp.indexOf(';') :
          length3; 
      var index2 = temp.indexOf('> .') !== -1?
          temp.indexOf('> .') + 1 :
          length3; 
      var index3 = temp.indexOf('>.') !== -1?
          temp.indexOf('>.') + 1 :
          length3; 
      var candidateEndindex = Math.min(index1, index2, index3);
      var snippet = temp.substring(0, candidateEndindex);
      snippet = snippet.replace(regExps[i], '').replace(/\s*/g, '');
      snippet = snippet.replace(/[<>]/g, '');
      var images = snippet.split(',');            
      var length2 = images.length;
      for (var j = 0; j < length2; j++) {
        var originalUri = images[j];
        if (images[j].indexOf('freebase.com') !== -1) {
          var freebaseRegExp =
              /http:\/\/\w+\.freebase\.com\/\w+\/(.*?)[\.\/]([\d\w]+)$/g;
          var middlePart = images[j].replace(
              freebaseRegExp,
              '$1').replace(/\./g, '/');
          var id = images[j].replace(
              freebaseRegExp,
              '$2');                    
          images[j] =
              'http://img.freebase.com/api/trans/raw/' +
              middlePart + '/' + id;    
        }
        var currentImage = images[j];           
        if (!Util.contains(Depictor._receivedDepictions, currentImage)) {
          Depictor._receivedDepictions.push(currentImage);                 
          Depictor._helperHttpExists(currentImage, originalUri, uri);
        }              
      }
      if (AppLogic._debug) {
        AppLogic.consoleReplacement.log("[Depictor] Received " + length2 + " depictions for \"" + uri + "\"");
      }                                                                                                                                            
    }
  }        
}
Depictor._helperHttpExists = function(currentImage, originalUri, uri) {
  Http.exists(
    Util.PROXY_URI + '?path=' + currentImage,
    function(response) {
      if (response !== 404) {
        if ((response === 'text/xml') ||
            (response === 'image/svg+xml')) {
          currentImage += '####IS_SVG';
        }              
        Depictor._storeDepiction(
            currentImage,
            originalUri,
            uri,
            false);
      } else if (response === 404) {
        Depictor._helperGoogleSearch(
            currentImage,
            originalUri,
            uri);
      }
    },
    {"timeout": 60 * 1000});
}      
Depictor._helperGoogleSearch = function(currentImage, originalUri, uri) {
  currentImage = currentImage.replace(/.*\/(.*)$/g, '$1');
  currentImage = decodeURIComponent(currentImage);
  var random = Util.getRandomAlphaNumericString();
  var script = document.createElement('script');
  script.setAttribute('type', 'text/javascript');
  script.setAttribute('id', random);
  script.appendChild(document.createTextNode(
      "Goog.Image._receiveSearchResult" + random +
      " = function(response) { " +
      "Goog.Image._receiveSearchResult(response, '" +
      originalUri + "', null, '" + uri +
      "', '" + currentImage + "'); var self = document.getElementById('" +
      random + "'); " +
      "self.parentNode.removeChild(self); }"));
  document.body.appendChild(script);                      
  Goog.Image.search(
      currentImage,
      'Goog.Image._receiveSearchResult' + random);        
  if (AppLogic._debug) {
    AppLogic.consoleReplacement.log("[Depictor] Depiction at URL \"" + originalUri + "\" for concept \"" + uri + "\" does not exist. Trying Google image search for \"" + currentImage + "\"");
  }                                                                                                                                            
}
Depictor._storeDepiction = function(
    currentImage,
    originalUri,
    uri,
    fromGoogle) {
  if (fromGoogle) {
    currentImage += '####FROM_GOOGLE';
  }
  if (Depictor.concepts[uri] && !Util.contains(Depictor.concepts[uri], currentImage)) {
    Depictor.concepts[uri].push(currentImage);                                  
    Depictor._drawDepiction(uri);
    Depictor._drawnDepictions.push(currentImage);
  }
}
Depictor._drawDepiction = function(uri) {
  var nobr = document.getElementById(uri);
  if (!nobr) {          
    var depictionContainer = document.getElementById("depiction-container");        
    depictionContainer.innerHTML += 
        "<div><a href='" + uri + "'>" + uri +
        "</a><br/><nobr id='" + uri + "'></nobr></div>";
    nobr = document.getElementById(uri);              
  }        
  var html = '';
  var length = Depictor.concepts[uri].length;                                  
  for (var i = 0; i < length; i++) {
    var currentImage = Depictor.concepts[uri][i];
    if (!Util.contains(Depictor._drawnDepictions, currentImage)) {          
      var fromGoogle = (currentImage.indexOf(/####FROM_GOOGLE/) !== -1);
      var isSvg = (currentImage.indexOf(/####IS_SVG/) !== -1);          
      var cleanedCurrentImage =
          currentImage.replace(/####IS_SVG/, '').replace(/####FROM_GOOGLE/, '');
      if (isSvg) {
        html +=
            "<img style='" + (fromGoogle? 'border: solid red 2px;' : '') +
            "' class='semantic-depiction' src='" +
            cleanedCurrentImage + "'/>";                                        
      } else {
        html +=
            "<img style='" + (fromGoogle? 'border: solid red 2px;' : '') +
            "' class='semantic-depiction' src='" +
            cleanedCurrentImage + "'/>";                                        
      }
    }
  }
  nobr.innerHTML += html; 
}

var VideoPlayer;
if (!VideoPlayer) {
  VideoPlayer = {};
}
VideoPlayer.initialized = false;
VideoPlayer._oldHTML = '';
VideoPlayer.init = function() {
  VideoPlayer._interval = 0;
  VideoPlayer._video = document.getElementById('video');
  VideoPlayer._currentTime = document.getElementById('currentTime');        
  VideoPlayer.initialized = true;
  if (AppLogic._debug) {
    AppLogic.consoleReplacement.log("[VideoPlayer] Initialized video player");
  }                                                                                             
}
VideoPlayer.play = function() {
  if (!VideoPlayer.initialized) {
    VideoPlayer.init();
  }
  VideoPlayer.seekToTime(null);
  (VideoPlayer._video.play)?
      VideoPlayer._video.play() :
      VideoPlayer._video.playVideo();        
  Converter.convert("turtle");                
  if (AppLogic._debug) {
    AppLogic.consoleReplacement.log("[VideoPlayer] Play");
  }                                                                                                     
}
VideoPlayer.pause = function() {
  if (VideoPlayer.initialized) {
    window.clearInterval(VideoPlayer._interval);
    VideoPlayer._interval = 0;        
    (VideoPlayer._video.pause)?
        VideoPlayer._video.pause() :
        VideoPlayer._video.pauseVideo();
    var currentTime = (((VideoPlayer._video.currentTime)?
        VideoPlayer._video.currentTime :
        VideoPlayer._video.getCurrentTime()) + "").split(".");
    Http.setFragmentKey("t", currentTime[0]);        
  }
  if (AppLogic._debug) {
    AppLogic.consoleReplacement.log("[VideoPlayer] Pause");
  }                                                                                                             
}
VideoPlayer._getCurrentTime = function() {
  var currentTime = (VideoPlayer._video.currentTime)?
      VideoPlayer._video.currentTime :
      VideoPlayer._video.getCurrentTime();        
  VideoPlayer._currentTime.innerHTML = 
    VideoPlayer._secondsToHoursMinutesSecondsMilliseconds(currentTime) + 
    " / " +
    ((VideoPlayer._video.duration)?
        VideoPlayer._secondsToHoursMinutesSecondsMilliseconds(VideoPlayer._video.duration) :
        VideoPlayer._secondsToHoursMinutesSecondsMilliseconds(VideoPlayer._video.getDuration()));
  SemWeb._getCurrentCaption(Math.floor(currentTime * 1000));          
  if (VideoPlayer._video.ended) {
    VideoPlayer.pause();
    VideoPlayer.seekToTime("0");
  } else if (VideoPlayer._video.getPlayerState() === 0) {        
    VideoPlayer.pause();      
    VideoPlayer.seekToTime("0");          
  }
}
VideoPlayer.seekToTime = function(seconds) {
  if (seconds) {
    Http.setFragmentKey("t", seconds);
  } else {
    seconds = window.location.hash.match(/.*t=(\d+);?.*/g);
  }
  if (!VideoPlayer.initialized) {
    VideoPlayer.init();
  }
  if ((window.location.hash) &&
      (seconds)) {         
    var seekToSeconds =
        window.location.hash.replace(/.*t=(\d+);?.*/g, "$1");     
    var friendlyTime =
        VideoPlayer._secondsToHoursMinutesSecondsMilliseconds(seekToSeconds);
    Util.notify("Seeking to " + friendlyTime);
    if (AppLogic._debug) {
      AppLogic.consoleReplacement.log("[VideoPlayer] Sought to \"" + friendlyTime + "\"");
    }                                                                                                                       
    if (VideoPlayer._video.currentTime) {
      VideoPlayer._video.currentTime = seekToSeconds;  
    } else {
      VideoPlayer._video.seekTo(seekToSeconds);
    }        
    if (!VideoPlayer._interval) {
      VideoPlayer._interval =
          window.setInterval(function() {
            VideoPlayer._getCurrentTime('');
          },
          100);          
    }
  } else {
    if (!VideoPlayer._interval) {
      VideoPlayer._interval =
          window.setInterval(function() {
            VideoPlayer._getCurrentTime('');
          },
          100);          
    }          
  }
}
VideoPlayer._secondsToHoursMinutesSecondsMilliseconds = function(secs){
  secs = secs % 86400;
  var time = [0, 0, secs];        
  time[2] = time[2] % 60;        
  time[1] = Math.floor(secs / 60);        
  time[0] = Math.floor(time[1] / 60);         

  if (time[2] < 10) time[2] = '0' + time[2];
  if ((time[2] + '').indexOf('.') === -1) time[2] = time[2] + '.000';        
  time[2] = (time[2] + "").substring(0, 6);
  secs = time[2].split(".");
  if (secs[1]) {
    if ((secs[1] + "").length < 2) secs[1] = '00' + secs[1];
    else if ((secs[1] + "").length < 3) secs[1] = '0' + secs[1];
    time[2] = secs[0] + "." + secs[1];
  }
  if (time[1] < 10) time[1] = '0' + time[1];    
  if (time[0] < 10) time[0] = '0' + time[0];        

  return time.join(':');
}
VideoPlayer._millisecondsToHoursMinutesSecondsMilliseconds = function(millisecs){        
  millisecs = millisecs % (86400 * 1000);
  var time = [0, 0, 0, millisecs];        
  // milliseconds
  time[3] = time[3] % 1000;        
  // seconds
  time[2] = Math.floor(millisecs / 1000);        
  // minutes
  time[1] = Math.floor(time[2] / 60);        
  time[2] = time[2] % 60;
  // hours
  time[0] = Math.floor(time[1] / 60);
  time[1] = time[1] % 60;

  if (time[3] < 10) time[3] = '00' + time[3];
  else if (time[3] < 100) time[3] = '0' + time[3];
  if (time[2] < 10) time[2] = '0' + time[2];                
  if (time[1] < 10) time[1] = '0' + time[1];        
  if (time[0] < 10) time[0] = '0' + time[0];                

  return time[0] + ":" + time[1] + ":" + time[2] + "." + time[3];
}       

/* AppLogic */
var AppLogic;
if (!AppLogic) {
  AppLogic = {};
}
AppLogic._colorsToServicesMap =
    {
      "orange.png" : "Sindice",
      "pink.png" : "Freebase",
      "darkblue.png": "DBpedia",
      "lightblue.png" : "Uberblic",
      "red" : "AlchemyAPI",
      "yellow" : "OpenCalais",
      "lime" : "Zemanta"
    }; 
AppLogic._onGetVideoDataButtonClick = function() {
  AppLogic._resetGui();
  if (VideoPlayer.initialized) {
    VideoPlayer.pause();
  }        
  AppLogic._resetRuntimeVariables();
  var videoId = document.getElementById('youtube-video-id').value;        
  AppLogic._updateWatchOnYouTubeLink(videoId);        
  Http.unsetFragmentKey("t");
  Http.unsetFragmentKey("q");
  Http.setFragmentKey("id", videoId);

  YouTube.getVideoData(
      videoId,
      'YouTube._receiveVideoData'
  );        
}
AppLogic._updateWatchOnYouTubeLink = function(videoId) {      
  document.getElementById('watchOnYouTube').innerHTML =
      '<a href=\'http://www.youtube.com/watch?v=' + videoId +
      '\'>Watch on YouTube</a>';      
  if (AppLogic._debug) {
    AppLogic.consoleReplacement.log("[AppLogic] Updated \"Watch on YouTube\" link");
  }                                                                                                                                                                
}
AppLogic._resetGui = function() {
  document.getElementById("youtube-search-results").innerHTML = '';
  document.getElementById("query").value = '';
  document.getElementById("plaintext-container").innerHTML = '';
  document.getElementById("youtube-caption-container").innerHTML = '';
  document.getElementById("alchemy-container").innerHTML = '';
  document.getElementById("zemanta-container").innerHTML = '';
  document.getElementById("opencalais-container").innerHTML = '';
  document.getElementById("semantic-depiction-container").innerHTML = '';
  document.getElementById("depiction-container").innerHTML = '';        
  if (AppLogic._debug) {
    AppLogic.consoleReplacement.log("[AppLogic] Reset GUI");
  }                                                                                                                                                    
}
AppLogic._resetRuntimeVariables = function() {
  // reset all run-time variables
  VideoPlayer.initialized = false;
  SemWeb._captions = [];
  SemWeb._normalizedCaptions = [];
  SemWeb._factors = {};
  YouTube._tags = [];
  YouTube._videoId = -1;
  YouTube._receivedCaptionList = {};
  YouTube._tagsTurtle = '';
  YouTube._plaintextContainerText = '';
  Goog.Language._detectedLanguage = false;                    
  Converter._sourceRdfXml = '';
  Converter._sourceRdfTurtle = '';
  Converter._outputFormat = "turtle";
  Depictor.concepts = {};
  Depictor._receivedDepictions = [];  
  Depictor._drawnDepictions = [];
  OpenCalais._sameAs = {};
  VideoPlayer._oldHTML = '';
  if (AppLogic._debug) {
    AppLogic.consoleReplacement.log("[AppLogic] Reset runtime variables");
  }                                                                                                                                                                          
}      
AppLogic.init = function() {
  var idRegExp = /(\w+\-)+(\d+)$/;
  SemWeb._scrollOffset =
      document.getElementById("youtube-caption-container").offsetTop + 50;              
  var captionContainer = document.getElementById('youtube-caption-container');  
  var semanticContainer = document.getElementById('semantic-container');                                
  
  function closest(currentNode, classNames) {   
    if (currentNode === null) {
      return;
    }
    var currentNodesClassNames = currentNode.className.split(/\s+/);            
    function matches(currentNodesClassNames) {
      for (var i = 0, className; className = currentNodesClassNames[i]; i++) {
        if (classNames[className]) {
          return true;
        }
      }            
      return false;     
    }
    while(!matches(currentNodesClassNames)) {            
      currentNode = currentNode.parentNode;
      if (!currentNode) {
        return;
      }
      currentNodesClassNames = currentNode.className?
          currentNode.className.split(/\s+/) :
          []; 
    }
    return currentNode;            
  }          
  
  function toggleHighlight(e) {                  
    var currentNode = e.target;
    if ((currentNode === captionContainer) ||
        (currentNode === semanticContainer)) {
      return;
    }
    currentNode = closest(currentNode, {'caption-div': true, 'semantic-caption-div': true});            
    if (!currentNode) {
      return;
    }
    var className = currentNode.className || '';
    className = className.indexOf('semantic-caption-div') === -1?
        'caption-div' :
        'semantic-caption-div';
    var mouseState = e.type;        
    currentNode.className = className + ' ' + mouseState;
    var i = currentNode.id.replace(idRegExp, '$2');                
    var caption;
    if (className === 'caption-div') {
      caption = document.getElementById('semantic-caption-' + i);              
      className = 'semantic-caption-div';
      caption.parentNode.parentNode.scrollTop =
          caption.offsetTop - SemWeb._scrollOffset;                          
    } else if (className === 'semantic-caption-div') {
      caption = document.getElementById('caption-' + i);
      className = 'caption-div';
      caption.parentNode.scrollTop =
          caption.offsetTop - SemWeb._scrollOffset;                          
    }
    caption.className = className + ' ' + mouseState;              
  }            
 
  function seekTo(e) {
    var target = e.target;
    if (target.className === 'seek-to') {
      VideoPlayer.seekToTime(target.getAttribute('value'));
    }
  }
 
  var result1 = window.location.hash.match(/.*id=([\w+\-]);?.*/g);
  var result2 = window.location.hash.match(/.*q=([\w+\-]);?.*/g);
  if ((window.location.hash) &&
      (result1)) {         
    document.getElementById("youtube-video-id").value =
        window.location.hash.replace(/.*id=([\w-]+);?.*/g, "$1");     
    if (VideoPlayer.initialized) {
      VideoPlayer.pause();
    }
    AppLogic._resetRuntimeVariables();
    AppLogic._resetGui();
    var videoId = document.getElementById('youtube-video-id').value;
    AppLogic._updateWatchOnYouTubeLink(videoId);        
    Http.unsetFragmentKey("q");
    Http.setFragmentKey("id", videoId);          
    YouTube.getVideoData(
        videoId,
        'YouTube._receiveVideoData'
    );        
  } else  if ((window.location.hash) &&
              (result2)) {
    var query = window.location.hash.replace(/.*q=(.*);?.*/g, '$1');
    query = decodeURIComponent(query);
    document.getElementById("query").value = query;
    YouTube.search(query, 'YouTube._receiveVideoSearchResult');
  }
  // add event listeners        
  captionContainer.addEventListener('mouseover', toggleHighlight, false); 
  captionContainer.addEventListener('mouseout', toggleHighlight, false);                     
  captionContainer.addEventListener('click', seekTo, false);                     
  semanticContainer.addEventListener('mouseover', toggleHighlight, false); 
  semanticContainer.addEventListener('mouseout', toggleHighlight, false);                                   

  if (AppLogic._debug) {
    AppLogic.consoleReplacement.log("[AppLogic] Init");
  }                                                                                                                                                                        
}
AppLogic._debug = false; //true;
if (typeof console === 'undefined') {
  AppLogic._debug = false;
}
AppLogic._verbose = false;
AppLogic.consoleReplacement = {};
AppLogic.consoleReplacement.log = function(message) {
  if (!AppLogic._verbose) {
    if (message.indexOf('[RDF]') === -1) {
      console.log(message);
    }
  } else {
    console.log(message);
  }
}