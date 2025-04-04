/*
@license

dhtmlxGantt v.3.2.1 Stardard
This software is covered by GPL license. You also can obtain Commercial or Enterprise license to use it in non-GPL project - please contact sales@dhtmlx.com. Usage without proper license is prohibited.

(c) Dinamenta, UAB.
*/
if (typeof(window.dhx4) == "undefined") {

  window.dhx4 = {

    version: "4.1.3",

    skin: null, // allow to be set by user

    skinDetect: function(comp) {
      return {10:"dhx_skyblue",20:"dhx_web",30:"dhx_terrace"}[this.readFromCss(comp+"_skin_detect")]||null;
    },

    // read value from css
    readFromCss: function(className, property) {
      var t = document.createElement("DIV");
      t.className = className;
      if (document.body.firstChild != null) document.body.insertBefore(t, document.body.firstChild); else document.body.appendChild(t);
      var w = t[property||"offsetWidth"];
      t.parentNode.removeChild(t);
      t = null;
      return w;
    },

    // id manager
    lastId: 1,
    newId: function() {
      return this.lastId++;
    },

    // z-index manager
    zim: {
      data: {},
      step: 5,
      first: function() {
        return 100;
      },
      last: function() {
        var t = this.first();
        for (var a in this.data) t = Math.max(t, this.data[a]);
        return t;
      },
      reserve: function(id) {
        this.data[id] = this.last()+this.step;
        return this.data[id];
      },
      clear: function(id) {
        if (this.data[id] != null) {
          this.data[id] = null;
          delete this.data[id];
        }
      }
    },

    // string to boolean
    s2b: function(r) {
      if (typeof(r) == "string") r = r.toLowerCase();
      return (r == true || r == 1 || r == "true" || r == "1" || r == "yes" || r == "y");
    },

    // string to json
    s2j: function(s) {
      var obj = null;
      dhx4.temp = null;
      try { eval("dhx4.temp="+s); } catch(e) { dhx4.temp = null; }
      obj = dhx4.temp;
      dhx4.temp = null;
      return obj;
    },

    // absolute top/left position on screen
    absLeft: function(obj) {
      if (typeof(obj) == "string") obj = document.getElementById(obj);
      return this.getOffset(obj).left;
    },
    absTop: function(obj) {
      if (typeof(obj) == "string") obj = document.getElementById(obj);
      return this.getOffset(obj).top;
    },
    _aOfs: function(elem) {
      var top = 0, left = 0;
      while (elem) {
        top = top + parseInt(elem.offsetTop);
        left = left + parseInt(elem.offsetLeft);
        elem = elem.offsetParent;
      }
      return {top: top, left: left};
    },
    _aOfsRect: function(elem) {
      var box = elem.getBoundingClientRect();
      var body = document.body;
      var docElem = document.documentElement;
      var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
      var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;
      var clientTop = docElem.clientTop || body.clientTop || 0;
      var clientLeft = docElem.clientLeft || body.clientLeft || 0;
      var top  = box.top +  scrollTop - clientTop;
      var left = box.left + scrollLeft - clientLeft;
      return { top: Math.round(top), left: Math.round(left) };
    },
    getOffset: function(elem) {
      if (elem.getBoundingClientRect) {
        return this._aOfsRect(elem);
      } else {
        return this._aOfs(elem);
      }
    },

    // copy obj
    _isObj: function(k) {
      return (k != null && typeof(k) == "object" && typeof(k.length) == "undefined");
    },
    _copyObj: function(r) {
      if (this._isObj(r)) {
        var t = {};
        for (var a in r) {
          if (typeof(r[a]) == "object" && r[a] != null) t[a] = this._copyObj(r[a]); else t[a] = r[a];
        }
      } else {
        var t = [];
        for (var a=0; a<r.length; a++) {
          if (typeof(r[a]) == "object" && r[a] != null) t[a] = this._copyObj(r[a]); else t[a] = r[a];
        }
      }
      return t;
    },

    // screen dim
    screenDim: function() {
      var isIE = (navigator.userAgent.indexOf("MSIE") >= 0);
      var dim = {};
      dim.left = document.body.scrollLeft;
      dim.right = dim.left+(window.innerWidth||document.body.clientWidth);
      dim.top = Math.max((isIE?document.documentElement:document.getElementsByTagName("html")[0]).scrollTop, document.body.scrollTop);
      dim.bottom = dim.top+(isIE?Math.max(document.documentElement.clientHeight||0,document.documentElement.offsetHeight||0):window.innerHeight);
      return dim;
    },

    // input/textarea range selection
    selectTextRange: function(inp, start, end) {

      inp = (typeof(inp)=="string"?document.getElementById(inp):inp);

      var len = inp.value.length;
      start = Math.max(Math.min(start, len), 0);
      end = Math.min(end, len);

      if (inp.setSelectionRange) {
        try {inp.setSelectionRange(start, end);} catch(e){}; // combo in grid under IE requires try/catch
      } else if (inp.createTextRange) {
        var range = inp.createTextRange();
        range.moveStart("character", start);
        range.moveEnd("character", end-len);
        try {range.select();} catch(e){};
      }
    },
    // transition
    transData: null,
    transDetect: function() {

      if (this.transData == null) {

        this.transData = {transProp: false, transEv: null};

        // transition, MozTransition, WebkitTransition, msTransition, OTransition
        var k = {
          "MozTransition": "transitionend",
          "WebkitTransition": "webkitTransitionEnd",
          "OTransition": "oTransitionEnd",
          "msTransition": "transitionend",
          "transition": "transitionend"
        };

        for (var a in k) {
          if (this.transData.transProp == false && document.documentElement.style[a] != null) {
            this.transData.transProp = a;
            this.transData.transEv = k[a];
          }
        }
        k = null;
      }

      return this.transData;

    },

    // xml parser
    _xmlNodeValue: function(node) {
      var value = "";
      for (var q=0; q<node.childNodes.length; q++) {
        value += (node.childNodes[q].nodeValue!=null?node.childNodes[q].nodeValue.toString().replace(/^[\n\r\s]{0,}/,"").replace(/[\n\r\s]{0,}$/,""):"");
      }
      return value;
    }

  };
  // browser
  window.dhx4.isIE = (navigator.userAgent.indexOf("MSIE") >= 0 || navigator.userAgent.indexOf("Trident") >= 0);
  window.dhx4.isIE6 = (window.XMLHttpRequest == null && navigator.userAgent.indexOf("MSIE") >= 0);
  window.dhx4.isIE7 = (navigator.userAgent.indexOf("MSIE 7.0") >= 0 && navigator.userAgent.indexOf("Trident") < 0);
  window.dhx4.isIE8 = (navigator.userAgent.indexOf("MSIE 8.0") >= 0 && navigator.userAgent.indexOf("Trident") >= 0);
  window.dhx4.isOpera = (navigator.userAgent.indexOf("Opera") >= 0);
  window.dhx4.isChrome = (navigator.userAgent.indexOf("Chrome") >= 0);
  window.dhx4.isKHTML = (navigator.userAgent.indexOf("Safari") >= 0 || navigator.userAgent.indexOf("Konqueror") >= 0);
  window.dhx4.isFF = (navigator.userAgent.indexOf("Firefox") >= 0);
  window.dhx4.isIPad = (navigator.userAgent.search(/iPad/gi) >= 0);
};

if (typeof(window.dhx4._eventable) == "undefined") {

  window.dhx4._eventable = function(obj, mode) {

    if (mode == "clear") {

      obj.detachAllEvents();

      obj.dhxevs = null;

      obj.attachEvent = null;
      obj.detachEvent = null;
      obj.checkEvent = null;
      obj.callEvent = null;
      obj.detachAllEvents = null;

      obj = null;

      return;

    }

    obj.dhxevs = { data: {} };

    obj.attachEvent = function(name, func) {
      name = String(name).toLowerCase();
      if (!this.dhxevs.data[name]) this.dhxevs.data[name] = {};
      var eventId = window.dhx4.newId();
      this.dhxevs.data[name][eventId] = func;
      return eventId;
    }

    obj.detachEvent = function(eventId) {
      for (var a in this.dhxevs.data) {
        var k = 0;
        for (var b in this.dhxevs.data[a]) {
          if (b == eventId) {
            this.dhxevs.data[a][b] = null;
            delete this.dhxevs.data[a][b];
          } else {
            k++;
          }
        }
        if (k == 0) {
          this.dhxevs.data[a] = null;
          delete this.dhxevs.data[a];
        }
      }
    }

    obj.checkEvent = function(name) {
      name = String(name).toLowerCase();
      return (this.dhxevs.data[name] != null);
    }

    obj.callEvent = function(name, params) {
      name = String(name).toLowerCase();
      if (this.dhxevs.data[name] == null) return true;
      var r = true;
      for (var a in this.dhxevs.data[name]) {
        r = this.dhxevs.data[name][a].apply(this, params) && r;
      }
      return r;
    }

    obj.detachAllEvents = function() {
      for (var a in this.dhxevs.data) {
        for (var b in this.dhxevs.data[a]) {
          this.dhxevs.data[a][b] = null;
          delete this.dhxevs.data[a][b];
        }
        this.dhxevs.data[a] = null;
        delete this.dhxevs.data[a];
      }
    }

    obj = null;
  };
  dhx4._eventable(dhx4);
};

if (typeof(window.dhtmlx) == "undefined") {
  window.dhtmlx={
    extend:function(a, b){
      for (var key in b)
        if (!a[key])
          a[key]=b[key];
      return a;
    },
    extend_api:function(name,map,ext){
      var t = window[name];
      if (!t) return; //component not defined
      window[name]=function(obj){
        if (obj && typeof obj == "object" && !obj.tagName){
          var that = t.apply(this,(map._init?map._init(obj):arguments));
          //global settings
          for (var a in dhtmlx)
            if (map[a]) this[map[a]](dhtmlx[a]);
          //local settings
          for (var a in obj){
            if (map[a]) this[map[a]](obj[a]);
            else if (a.indexOf("on")===0){
              this.attachEvent(a,obj[a]);
            }
          }
        } else
          var that = t.apply(this,arguments);
        if (map._patch) map._patch(this);
        return that||this;
      };
      window[name].prototype=t.prototype;
      if (ext)
        dhtmlx.extend(window[name].prototype,ext);
    },
    url:function(str){
      if (str.indexOf("?") != -1)
        return "&";
      else
        return "?";
    }
  };
};

 var _isFF = false;
 var _isIE = false;
 var _isOpera = false;
 var _isKHTML = false;
 var _isMacOS = false;
 var _isChrome = false;
 var _FFrv = false;
 var _KHTMLrv = false;
 var _OperaRv = false;

if (navigator.userAgent.indexOf('Macintosh') != -1)
  _isMacOS=true;

if (navigator.userAgent.toLowerCase().indexOf('chrome')>-1)
  _isChrome=true;

if ((navigator.userAgent.indexOf('Safari') != -1)||(navigator.userAgent.indexOf('Konqueror') != -1)){
   _KHTMLrv = parseFloat(navigator.userAgent.substr(navigator.userAgent.indexOf('Safari')+7, 5));

  if (_KHTMLrv > 525){ //mimic FF behavior for Safari 3.1+
    _isFF=true;
     _FFrv = 1.9;
  } else
    _isKHTML=true;
} else if (navigator.userAgent.indexOf('Opera') != -1){
  _isOpera=true;
  _OperaRv=parseFloat(navigator.userAgent.substr(navigator.userAgent.indexOf('Opera')+6, 3));
}

else if (navigator.appName.indexOf("Microsoft") != -1){
  _isIE=true;
  if ((navigator.appVersion.indexOf("MSIE 8.0")!= -1 ||
     navigator.appVersion.indexOf("MSIE 9.0")!= -1 ||
     navigator.appVersion.indexOf("MSIE 10.0")!= -1 ||
     document.documentMode > 7) &&
      document.compatMode != "BackCompat"){
    _isIE=8;
  }
} else if (navigator.appName  == 'Netscape' && navigator.userAgent.indexOf("Trident") != -1){
  //ie11
  _isIE=8;
} else {
  _isFF=true;
   _FFrv = parseFloat(navigator.userAgent.split("rv:")[1])
}

if (typeof(window.dhtmlxEvent) == "undefined") {

  window.dhtmlxEvent = function dhtmlxEvent(el, event, handler){
    if (el.addEventListener)
      el.addEventListener(event, handler, false);

    else if (el.attachEvent)
      el.attachEvent("on"+event, handler);
  }
};

if (dhtmlxEvent.touchDelay == null) {
  dhtmlxEvent.touchDelay = 2000;
};

if (typeof(dhtmlxEvent.initTouch) == "undefined") {
  dhtmlxEvent.initTouch = function(){
    var longtouch;
    var target;
    var tx, ty;

    dhtmlxEvent(document.body, "touchstart", function(ev){
      target = ev.touches[0].target;
      tx = ev.touches[0].clientX;
      ty = ev.touches[0].clientY;
      longtouch = window.setTimeout(touch_event, dhtmlxEvent.touchDelay);
    });
    function touch_event(){
      if (target){
        var ev = document.createEvent("HTMLEvents"); // for chrome and firefox
        ev.initEvent("dblclick", true, true);
        target.dispatchEvent(ev);
        longtouch = target = null;
      }
    };
    dhtmlxEvent(document.body, "touchmove", function(ev){
      if (longtouch){
        if (Math.abs(ev.touches[0].clientX - tx) > 50 || Math.abs(ev.touches[0].clientY - ty) > 50 ){
          window.clearTimeout(longtouch);
          longtouch = target = false;
        }
      }
    });
    dhtmlxEvent(document.body, "touchend", function(ev){
      if (longtouch){
        window.clearTimeout(longtouch);
        longtouch = target = false;
      }
    });

    dhtmlxEvent.initTouch = function(){};
  };
};

if(!window.dhtmlx)
  window.dhtmlx = {};

(function(){
  var _dhx_msg_cfg = null;
  function callback(config, result){
      var usercall = config.callback;
      modality(false);
      config.box.parentNode.removeChild(config.box);
      _dhx_msg_cfg = config.box = null;
      if (usercall)
        usercall(result);
  }
  function modal_key(e){
    if (_dhx_msg_cfg){
      e = e||event;
      var code = e.which||event.keyCode;
      if (dhtmlx.message.keyboard){
        if (code == 13 || code == 32)
          callback(_dhx_msg_cfg, true);
        if (code == 27)
          callback(_dhx_msg_cfg, false);
      }
      if (e.preventDefault)
        e.preventDefault();
      return !(e.cancelBubble = true);
    }
  }
  if (document.attachEvent)
    document.attachEvent("onkeydown", modal_key);
  else
    document.addEventListener("keydown", modal_key, true);

  function modality(mode){
    if(!modality.cover){
      modality.cover = document.createElement("DIV");
      //necessary for IE only
      modality.cover.onkeydown = modal_key;
      modality.cover.className = "dhx_modal_cover";
      document.body.appendChild(modality.cover);
    }
    var height =  document.body.scrollHeight;
    modality.cover.style.display = mode?"inline-block":"none";
  }

  function button(text, result){
    var button_css = "dhtmlx_"+text.toLowerCase().replace(/ /g, "_")+"_button"; // dhtmlx_ok_button, dhtmlx_click_me_button
    return "<div class='dhtmlx_popup_button "+button_css+"' result='"+result+"' ><div>"+text+"</div></div>";
  }

  function info(text){
    if (!t.area){
      t.area = document.createElement("DIV");
      t.area.className = "dhtmlx_message_area";
      t.area.style[t.position]="5px";
      document.body.appendChild(t.area);
    }

    t.hide(text.id);
    var message = document.createElement("DIV");
    message.innerHTML = "<div>"+text.text+"</div>";
    //message.className = "dhtmlx-info dhtmlx-" + text.type;
    message.className = "dhtmlx-message dhtmlx-" + text.type;  // HOSEK
    message.onclick = function(){
      t.hide(text.id);
      text = null;
    };

    if (t.position == "bottom" && t.area.firstChild)
      t.area.insertBefore(message,t.area.firstChild);
    else
      t.area.appendChild(message);

    if (text.expire > 0)
      t.timers[text.id]=window.setTimeout(function(){
        t.hide(text.id);
      }, text.expire);

    t.pull[text.id] = message;
    message = null;

    return text.id;
  }
  function _boxStructure(config, ok, cancel){
    var box = document.createElement("DIV");
    box.className = " dhtmlx_modal_box dhtmlx-"+config.type;
    box.setAttribute("dhxbox", 1);

    var inner = '';

    if (config.width)
      box.style.width = config.width;
    if (config.height)
      box.style.height = config.height;
    if (config.title)
      inner+='<div class="dhtmlx_popup_title">'+config.title+'</div>';
    inner+='<div class="dhtmlx_popup_text"><span>'+(config.content?'':config.text)+'</span></div><div  class="dhtmlx_popup_controls">';
    if (ok)
      inner += button(config.ok || "OK", true);
    if (cancel)
      inner += button(config.cancel || "Cancel", false);
    if (config.buttons){
      for (var i=0; i<config.buttons.length; i++)
        inner += button(config.buttons[i],i);
    }
    inner += '</div>';
    box.innerHTML = inner;

    if (config.content){
      var node = config.content;
      if (typeof node == "string")
        node = document.getElementById(node);
      if (node.style.display == 'none')
        node.style.display = "";
      box.childNodes[config.title?1:0].appendChild(node);
    }

    box.onclick = function(e){
      e = e ||event;
      var source = e.target || e.srcElement;
      if (!source.className) source = source.parentNode;
      if (source.className.split(" ")[0] == "dhtmlx_popup_button"){
        var result = source.getAttribute("result");
        result = (result == "true")||(result == "false"?false:result);
        callback(config, result);
      }
    };
    config.box = box;
    if (ok||cancel)
      _dhx_msg_cfg = config;

    return box;
  }
  function _createBox(config, ok, cancel){
    var box = config.tagName ? config : _boxStructure(config, ok, cancel);

    if (!config.hidden)
      modality(true);
    document.body.appendChild(box);
    var x = Math.abs(Math.floor(((window.innerWidth||document.documentElement.offsetWidth) - box.offsetWidth)/2));
    var y = Math.abs(Math.floor(((window.innerHeight||document.documentElement.offsetHeight) - box.offsetHeight)/2));
    if (config.position == "top")
      box.style.top = "-3px";
    else
      box.style.top = y+'px';
    box.style.left = x+'px';
    //necessary for IE only
    box.onkeydown = modal_key;

    box.focus();
    if (config.hidden)
      dhtmlx.modalbox.hide(box);

    return box;
  }

  function alertPopup(config){
    return _createBox(config, true, false);
  }
  function confirmPopup(config){
    return _createBox(config, true, true);
  }
  function boxPopup(config){
    return _createBox(config);
  }
  function box_params(text, type, callback){
    if (typeof text != "object"){
      if (typeof type == "function"){
        callback = type;
        type = "";
      }
      text = {text:text, type:type, callback:callback };
    }
    return text;
  }
  function params(text, type, expire, id){
    if (typeof text != "object")
      text = {text:text, type:type, expire:expire, id:id};
    text.id = text.id||t.uid();
    text.expire = text.expire||t.expire;
    return text;
  }
  dhtmlx.alert = function(){
    var text = box_params.apply(this, arguments);
    text.type = text.type || "confirm";
    return alertPopup(text);
  };
  dhtmlx.confirm = function(){
    var text = box_params.apply(this, arguments);
    text.type = text.type || "alert";
    return confirmPopup(text);
  };
  dhtmlx.modalbox = function(){
    var text = box_params.apply(this, arguments);
    text.type = text.type || "alert";
    return boxPopup(text);
  };
  dhtmlx.modalbox.hide = function(node){
    while (node && node.getAttribute && !node.getAttribute("dhxbox"))
      node = node.parentNode;
    if (node){
      node.parentNode.removeChild(node);
      modality(false);
    }
  };
  var t = dhtmlx.message = function(text, type, expire, id){
    text = params.apply(this, arguments);
    text.type = text.type||"info";

    var subtype = text.type.split("-")[0];
    switch (subtype){
      case "alert":
        return alertPopup(text);
      case "confirm":
        return confirmPopup(text);
      case "modalbox":
        return boxPopup(text);
      default:
        return info(text);
    }
  };

  t.seed = (new Date()).valueOf();
  t.uid = function(){return t.seed++;};
  t.expire = 4000;
  t.keyboard = true;
  t.position = "top";
  t.pull = {};
  t.timers = {};

  t.hideAll = function(){
    for (var key in t.pull)
      t.hide(key);
  };
  t.hide = function(id){
    var obj = t.pull[id];
    if (obj && obj.parentNode){
      window.setTimeout(function(){
        obj.parentNode.removeChild(obj);
        obj = null;
      },2000);
      obj.className+=" hidden";

      if(t.timers[id])
        window.clearTimeout(t.timers[id]);
      delete t.pull[id];
    }
  };
})();
window.gantt = {
  version:"3.2.1"
};

/*jsl:ignore*/

function dhtmlxDetachEvent(el, event, handler){
    if (el.removeEventListener)
        el.removeEventListener(event, handler, false);

    else if (el.detachEvent)
        el.detachEvent("on"+event, handler);
}

/** Overrides event functionality.
 *  Includes all default methods from dhtmlx.common but adds _silentStart, _silendEnd
 *   @desc:
 *   @type: private
 */
window.dhtmlxEventable = function(obj){
    obj._silent_mode = false;
    obj._silentStart = function() {
        this._silent_mode = true;
    };
    obj._silentEnd = function() {
        this._silent_mode = false;
    };
  obj.attachEvent=function(name, catcher, callObj){
    name='ev_'+name.toLowerCase();
    if (!this[name])
      this[name]=new this._eventCatcher(callObj||this);

    return(name+':'+this[name].addEvent(catcher)); //return ID (event name & event ID)
  };
  obj.callEvent=function(name, arg0){
        if (this._silent_mode) return true;
    name='ev_'+name.toLowerCase();
    if (this[name])
      return this[name].apply(this, arg0);
    return true;
  };
  obj.checkEvent=function(name){
    return (!!this['ev_'+name.toLowerCase()]);
  };
  obj._eventCatcher=function(obj){
    var dhx_catch = [];
    var z = function(){
      var res = true;
      for (var i = 0; i < dhx_catch.length; i++){
        if (dhx_catch[i]){
          var zr = dhx_catch[i].apply(obj, arguments);
          res=res&&zr;
        }
      }
      return res;
    };
    z.addEvent=function(ev){
      if (typeof (ev) != "function")
        ev=eval(ev);
      if (ev)
        return dhx_catch.push(ev)-1;
      return false;
    };
    z.removeEvent=function(id){
      dhx_catch[id]=null;
    };
    return z;
  };
  obj.detachEvent=function(id){
    if (id){
      var list = id.split(':');           //get EventName and ID
      this[list[0]].removeEvent(list[1]); //remove event
    }
  };
  obj.detachAllEvents = function(){
    for (var name in this){
      if (name.indexOf("ev_") === 0)
        delete this[name];
    }
  };
  obj = null;
};

/*jsl:end*/

dhtmlx.copy = function (object) {
  var i, t, result; // iterator, types array, result

  if (object && typeof object === "object") {
    result = {};
    t = [Array, Date, Number, String, Boolean];
    for (i = 0; i < t.length; i++) {
      if (object instanceof t[i])
        result = i ? new t[i](object) : new t[i](); // first one is array
    }
    if(moment.isMoment(object)){
      result = moment(object);
      result._isEndDate = object._isEndDate;
      return result;
    }
    for (i in object) {
      // HOSEK V
      if (i === "model" || i === "widget" || i === "columns" ) {
        continue;
        //result[i]=object[i];
      }
      // HOSEK A
      if (Object.prototype.hasOwnProperty.apply(object, [i])) {
        result[i] = dhtmlx.copy(object[i]);
      }
    }
  }
  return result || object;
};

dhtmlx.mixin = function(target, source, force){
    for (var f in source)
        if ((!target[f] || force)) target[f]=source[f];
    return target;
};

dhtmlx.defined = function(obj) {
    return typeof(obj) != "undefined";
};

dhtmlx.uid = function() {
    if (!this._seed)
        this._seed = gantt.date.now().valueOf();

    this._seed++;
    return this._seed;
};

//creates function with specified "this" pointer
dhtmlx.bind=function(functor, object){
  if(functor.bind)
    return functor.bind(object);
  else
    return function(){ return functor.apply(object,arguments); };
};


//returns position of html element on the page
gantt._get_position = function(elem) {
  var top=0, left=0;
    if (elem.getBoundingClientRect) { //HTML5 method
        var box = elem.getBoundingClientRect();
        var body = document.body;
        var docElem = document.documentElement;
        var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
        var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;
        var clientTop = docElem.clientTop || body.clientTop || 0;
        var clientLeft = docElem.clientLeft || body.clientLeft || 0;
        top  = box.top +  scrollTop - clientTop;
        left = box.left + scrollLeft - clientLeft;
        return { y: Math.round(top), x: Math.round(left), width:elem.offsetWidth, height:elem.offsetHeight };
    } else { //fallback to naive approach
        while(elem) {
            top = top + parseInt(elem.offsetTop,10);
            left = left + parseInt(elem.offsetLeft,10);
            elem = elem.offsetParent;
        }
        return { y: top, x: left, width:elem.offsetWidth, height: elem.offsetHeight};
    }
};

gantt._detectScrollSize = function(){
    var div = document.createElement("div");
    div.style.cssText="visibility:hidden;position:absolute;left:-1000px;width:100px;padding:0px;margin:0px;height:110px;min-height:100px;overflow-y:scroll;";

    document.body.appendChild(div);
    var width = div.offsetWidth-div.clientWidth;
    document.body.removeChild(div);

    return width;
};

if (window.dhtmlx){

  if (!dhtmlx.attaches)
    dhtmlx.attaches = {};

  dhtmlx.attaches.attachGantt=function(start, end, gantt){
    var obj = document.createElement("DIV");
    obj.id = "gantt_"+dhtmlx.uid();
    obj.style.width = "100%";
    obj.style.height = "100%";
    obj.cmp = "grid";
    gantt = gantt || window.gantt;
    document.body.appendChild(obj);
    this.attachObject(obj.id);

    var that = this.vs[this.av];
    that.grid = gantt;

    gantt.init(obj.id, start, end);
    obj.firstChild.style.border = "none";

    that.gridId = obj.id;
    that.gridObj = obj;

    var method_name="_viewRestore";
    return this.vs[this[method_name]()].grid;
  };
}

if (typeof(window.dhtmlXCellObject) != "undefined") {
  dhtmlXCellObject.prototype.attachGantt=function(start, end, gantt){
    var obj = document.createElement("DIV");
    obj.id = "gantt_"+dhtmlx.uid();
    obj.style.width = "100%";
    obj.style.height = "100%";
    obj.cmp = "grid";

    document.body.appendChild(obj);
    this.attachObject(obj.id);
    gantt = gantt || window.gantt;
    gantt.init(obj.id, start, end);
    obj.firstChild.style.border = "none";
    var method_name="_viewRestore";
    obj = null;
    this.callEvent("_onContentAttach",[]);

    return this.dataObj;
  };
}

dhtmlxEventable(gantt);

gantt._click = {};
gantt._dbl_click = {};
gantt._context_menu = {};
gantt._on_click = function(e) {
    e = e || window.event;
    var trg = e.target || e.srcElement;
    var id = gantt.locate(e);

  var res = true;
  if (id !== null){
    res = !gantt.checkEvent("onTaskClick") || gantt.callEvent("onTaskClick", [id, e]);
  }else{
    res = gantt.callEvent("onEmptyClick", [e]);
  }

  if(res){
    var default_action = gantt._find_ev_handler(e, trg, gantt._click, id);
    if(!default_action)
      return;
    if(id && gantt.getTask(id) && gantt.config.select_task){
      if(gantt._selected_task == id){
        gantt.unselectTask();
      } else {
        gantt.selectTask(id);
      }
      if (e.metaKey || e.ctrlKey) return;
      if (gantt.modalAdapter && trg.classList.contains("gantt_task_subject")) {
        gantt.openGanttIssueModal(id);
        e.preventDefault();
      }
      const classList = trg.classList;
      if (classList.contains("gantt_level_toggler")) {
        if (classList.contains("open")) {
          gantt.toggleLevel(id, "open");
          return;
        }
        gantt.toggleLevel(id, "close");
        e.preventDefault();
      }
    }
  }
};
gantt.toggleLevel = function(id, action) {
  if (gantt._has_children(id)) {
    const projects = Object.values(gantt._pull);
    const subprojects = projects.filter(project => project.parent == id);
    subprojects.forEach(project => {
      gantt[action](project.id);
    });
  }
  return;
};

gantt.addTogglersToEntity = function(obj, path, extraClasses = "") {
  const id = parseInt(obj.real_id);
  const isParent = gantt._has_children(obj.id);
  if (obj.$open) {
    const projects = Object.values(gantt._pull);
    const issues = ysy.data.issues.getArray();
    const needOpenSubprojects = !!projects.filter(project => project.parent === obj.id && !project.$open).length;
    let needToOpenSubtasks = false;
    let title = ysy.settings.labels.expander.open;
    let iconClass = "open";
    if (!needOpenSubprojects && !needToOpenSubtasks) {
      title = ysy.settings.labels.expander.close;
      iconClass = "close";
    }
    const togglersHtml =
      `<div class="gantt_level_toggle">
        <a href="#" title="${title}" class="level_toggler">
          <i class="easy-gantt__icon--${iconClass} gantt_level_toggler ${iconClass}"></i>
        </a>
      </div>`;
    const subprojectsHasChildrens = projects.filter(project => project.parent === obj.id && gantt._has_children(project.id))
    const togglers = isParent && subprojectsHasChildrens.length && obj.$open ? togglersHtml : "";
    return `<a class="${extraClasses}" href="${path}${id}" title="${obj.text}" target='_blank'>${obj.text} ${togglers}</a>`;
  }
  return "";
};

gantt._on_contextmenu = function(e){
  e = e || window.event;
  var src = e.target||e.srcElement,
    taskId = gantt.locate(src),
    linkId = gantt.locate(src, gantt.config.link_attribute);

  var res = !gantt.checkEvent("onContextMenu") || gantt.callEvent("onContextMenu", [taskId, linkId, e]);
  if(!res){
    if(e.preventDefault)
      e.preventDefault();
    else
      e.returnValue = false;
  }
  return res;
};
gantt._find_ev_handler = function(e, trg, hash, id){
  var res = true;
  while (trg){
    var css = trg.className || "";
    if (typeof(css) === "string") {
      css = css.split(" ");
      for (var i = 0; i < css.length; i++) {
        if (!css[i]) continue;
        if (hash[css[i]]){
          var handler = hash[css[i]].call(gantt, e, id, trg);
          res = res && !(typeof handler != "undefined" && handler !== true);
        }
      }
    }
    trg=trg.parentNode;
  }
  return res;
};
gantt._on_dblclick = function(e) {
  e = e || window.event;
  var trg = e.target || e.srcElement;
    var id = gantt.locate(e);
  var res = !gantt.checkEvent("onTaskDblClick") || gantt.callEvent("onTaskDblClick", [id, e]);
  if(res){
    var default_action = gantt._find_ev_handler(e, trg, gantt._dbl_click, id);
    if (!default_action)
      return;
    if (!id) return;
    const task = gantt.getTask(id);
    if (task && task.$rendered_type === "task") {
      gantt.openGanttIssueModal(id);
    }
  }
};
gantt.openIssueModal = (id, options) => {
  if (!id) return;
  gantt.modalAdapter && gantt.modalAdapter.open("issue", id, options);
}

gantt.openGanttIssueModal = function (id) {
  const issue = ysy.data.issues.array.find(issue => issue.id === +id);
  if (issue._created) return;
  document.addEventListener("vueModalIssueChanged", gantt.modalIssueChanged, false);
  const task = issuePropsFormat(issue);
  const options = {
    localSave: true,
    injectedIssue: task,
    rights: { project: false, deletable: { start_date: false, due_date: false }, addParentTasks: false, addRelatedTasks: false, addSubtasks: false }
  };
  gantt.openIssueModal(id, options);

  function issuePropsFormat(issue) {
    const task = {
      id: issue.id,
      assigned_to_id: issue.assigned_to_id,
      done_ratio: issue.done_ratio,
      due_date: issue.end_date ? issue.end_date.format("YYYY-MM-DD"): "",
      start_date: issue.start_date ? issue.start_date.format("YYYY-MM-DD") : "",
      estimated_hours: issue.estimated_hours,
      subject: issue.name,
      priority_id: issue.priority_id,
      propject_id: issue.project_id,
      spent_hours: issue.spent_hours,
      status_id: issue.status_id,
      tracker_id: issue.tracker_id,
      easy_sprint_id: issue.easy_sprint_id == null ? null : issue.easy_sprint_id,
      category_id: issue.category_id == null ? null : issue.category_id,
      fixed_version_id: issue.fixed_version_id == null ? null : issue.fixed_version_id
    };
    Object.keys(task).forEach(key => {
      if (task[key] == null) {
        delete task[key];
      }
    });
    return task;
  };
};

gantt.modalIssueChanged = function(event) {
  const { id, buffer } = event.detail;
  if (buffer && buffer.delete) {
    gantt.deleteTask(+id);
    return;
  }
  //Cant pass issue as a parametr so should find it again here
  const issue = ysy.data.issues.array.find(issue => issue.id === +id);
  if (buffer && Object.keys(buffer).length && id) {
    gantt.applyChanges(buffer, issue);
  }
}

gantt.applyChanges = function (buffer, issue) {
  Object.entries(buffer).map(entrie => {
    let [ key, value ] = entrie;
    if (!issue.hasOwnProperty(key)) {
      key = formatIssueKey(key, value, issue);
    }
    if (key.includes("date")) {
      key = formatIssueKey(key, value, issue);
      value = moment(value);
    }
    issue.set(key, value);
  });
  document.removeEventListener("vueModalIssueChanged", gantt.modalIssueChanged);

  function formatIssueKey(key, value, issue) {
    switch (key) {
      case "due_date": {
        return "end_date"
      }
      case "subject": {
        // We should set subject to issue bc
        // gantt will save issue with prop name which doesnt exist in db.
        // Now gantt will save issue name and subject props , ignore name prop and save just subject
        issue.set(key, value);
        return "name"
      }
      default: {
        return key
      }
    }
  };
};

gantt._on_mousemove = function(e){
  if (gantt.checkEvent("onMouseMove")){
      var id = gantt.locate(e);
      gantt._last_move_event = e;
    gantt.callEvent("onMouseMove", [id,e]);
  }
};
function dhtmlxDnD(obj, config) {
    if(config){
        this._settings = config;
    }

    dhtmlxEventable(this);
    dhtmlxEvent(obj, "mousedown", dhtmlx.bind(function(e) {
        config.original_target = {target : e.target || e.srcElement};
        this.dragStart(obj, e);
    }, this));
}
dhtmlxDnD.prototype = {
  dragStart: function(obj, e) {
    this.config = {
      obj: obj,
      marker: null,
      started: false,
      pos: this.getPosition(e),
      sensitivity: 4,
      offset:$(obj).offset()
    };
    // Need to set tooltip Y position just once on click
    // Lagging if all the time recalculates by mouse position;
    gantt.config.dateTooltipY = $(e.target).offset().top;
    if(this._settings)
        dhtmlx.mixin(this.config, this._settings, true);
    e.preventDefault();

    var mousemove = dhtmlx.bind(function(e) { return this.dragMove(obj, e); }, this);
    var scroll = dhtmlx.bind(function(e) { return this.dragScroll(obj, e); }, this);
    var limitation = false;
    var limited_mousemove = dhtmlx.bind(function(e) {

      if(limitation) return;
      limitation = true;
      var res = mousemove(e);
      limitation = false;
      return res;
    }, this);

    var mouseup = dhtmlx.bind(function(e) {
        dhtmlxDetachEvent(document.body, "mousemove", limited_mousemove);
        dhtmlxDetachEvent(document.body, "mouseup", mouseup);
        return this.dragEnd(obj);
    }, this);
    // initialize dnd marker
    if(this.config.marker){
      var marker = this.config.marker = document.createElement("div");
      marker.className = "gantt_drag_marker";
      document.body.appendChild(marker);
    }
    e.pos = this.getPosition(e);
    this.actPos= e.pos;   // HOSEK
    dhtmlxEvent(document.body, "mousemove", limited_mousemove);
    dhtmlxEvent(document.body, "mouseup", mouseup);
    this.callEvent("onDragStart", [obj,e]);
  },
  dragMove: function(obj, e) {
    if (!this.config.started) {
      var pos = this.getPosition(e);
      var diff_x = pos.x - this.config.pos.x;
      var diff_y = pos.y - this.config.pos.y;
      var distance = Math.sqrt(Math.pow(Math.abs(diff_x), 2) + Math.pow(Math.abs(diff_y), 2));

      if (distance > this.config.sensitivity) {
        // real drag starts here,
        // when user moves mouse at first time after onmousedown
        this.config.started = true;
        this.config.ignore = false;
        if (this.callEvent("onBeforeDragStart", [obj, this.config.original_target]) === false) {
          this.config.ignore = true;
          return true;
        }
        this.callEvent("onAfterDragStart", [obj, this.config.original_target]);
      } else
        this.config.ignore = true;
    }
    if (!this.config.ignore) {
      e.pos = this.getPosition(e);
      this.actPos= e.pos;   // HOSEK
      if(this.config.marker){
        this.config.marker.style.left = e.pos.x + "px";
        this.config.marker.style.top = e.pos.y + "px";
      }
      this.callEvent("onDragMove", [obj,e]);
    }
  },

  dragEnd: function(obj) {
    if (this.config.marker) {
      this.destroyMarker();
    }
    if(this.config.started&&!this.config.ignore){
      this.callEvent("onDragEnd", []);
    }
  },
  getDiff: function(e){
    return {x:(this.actPos.x-this.config.pos.x),y:(this.actPos.y-this.config.pos.y)};
  },
  getPosition: function(e) {
    var x = 0, y = 0;
    e = e || window.event;
    if (e.pageX || e.pageY) {
      x = e.pageX;
      y = e.pageY;
    } else if (e.clientX || e.clientY) 	{
      x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
      y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }
    return { x:x, y:y };
  },
  destroyMarker:function(){
    this.config.marker.parentNode.removeChild(this.config.marker);
    this.config.marker = null;
  },
  getRelativePos:function(){
    return {x:(this.actPos.x-this.config.offset.left),y:(this.actPos.y-this.config.offset.top)}
  }
};
window.dhtmlxDnD = dhtmlxDnD;
gantt._init_grid = function () {
  this._click.gantt_close = dhtmlx.bind(function (e, id, trg) {
    this.close(id);
    return false;
  }, this);
  this._click.gantt_open = dhtmlx.bind(function (e, id, trg) {
    this.open(id);
    return false;
  }, this);

  this._click.gantt_row = dhtmlx.bind(function (e, id, trg) {
    if (id !== null) {
      var task = this.getTask(id);
      //if(this.config.scroll_on_click)
      //	this.showDate(task.start_date);
      this.callEvent("onTaskRowClick", [id, trg]);
    }
  }, this);

  this._click.gantt_grid_head_cell = dhtmlx.bind(function (e, id, trg) {
    var column = trg.getAttribute("column_id");

    if (!this.callEvent("onGridHeaderClick", [column, e]))
      return;

    if (column == "add") {
      this._click.gantt_add(e, this.config.root_id);
    } else if (this.config.sort) {
      var sort = (this._sort && this._sort.direction && this._sort.name == column) ? this._sort.direction : "desc";
      // invert sort direction
      sort = (sort == "desc") ? "asc" : "desc";
      this._sort = {
        name: column,
        direction: sort
      };
      this.sort(column, sort == "desc");
    }
  }, this);

  if (!this.config.sort && (this.config.order_branch || this.config.rearrange_branch)) {
    this._init_dnd(this.config.rearrange_branch);
  }

  this._click.gantt_add = dhtmlx.bind(function (e, id, trg) {
    if (this.config.readonly) return;

    var item = { };
    this.createTask(item, id ? id : this.config.root_id);

    return false;
  }, this);

  if(this._init_resize){
    this._init_resize();
  }

};

gantt._render_grid = function () {
  if (this._is_grid_visible()) {
    this._calc_grid_width();
    this._render_grid_header();
  }
};

gantt._calc_grid_width = function () {
  var columns = this.getGridColumns();
  var cols_width = 0;
  var unknown = [];
  var width = [];

  for (var i = 0; i < columns.length; i++) {
    var v = parseInt(columns[i].width, 10);
    if (window.isNaN(v)) {
      v = 50;
      unknown.push(i);
    }
    width[i] = v;
    cols_width += v;
  }

  if (this.config.autofit || unknown.length) {
    var diff = this._get_grid_width() - cols_width;
    // TODO: logic may be improved for proportional changing of width
    var step = diff / (unknown.length > 0 ? unknown.length : (width.length > 0 ? width.length : 1));
    if (unknown.length > 0) {
      // there are several columns with undefined width
      var delta = diff / (unknown.length ? unknown.length : 1);
      for (var i = 0; i < unknown.length; i++) {
        var index = unknown[i];
        width[index] += delta;
      }
    } else {
      // delta must be added for all columns
      var delta = diff / (width.length ? width.length : 1);
      for (var i = 0; i < width.length; i++)
        width[i] += delta;
    }

    for (var i = 0; i < width.length; i++) {
      columns[i].width = width[i];
    }
  }else{
    this.config.grid_width = cols_width;
  }
};

gantt._render_grid_header = function () {
  var columns = this.getGridColumns();
  var cells = [];
  var width = 0,
    labels = this.locale.labels;

  var lineHeigth = this.config.scale_height - 2;

  for (var i = 0; i < columns.length; i++) {
    var last = i == columns.length - 1;
    var col = columns[i];
    if (last && this._get_grid_width() > width + col.width)
      col.width = this._get_grid_width() - width;
    width += col.width;
    var sort = (this._sort && col.name == this._sort.name) ? ("<div class='gantt_sort gantt_" + this._sort.direction + "'></div>") : "";
    var cssClass = ["gantt_grid_head_cell",
      ("gantt_grid_head_" + col.name),
      (last ? "gantt_last_cell" : ""),
      this.templates.grid_header_class(col.name, col)].join(" ");

    var style = "width:" + (col.width - (last ? 1 : 0)) + "px;";
    var label = (col.label || labels["column_" + col.name]);
    label = label || "";
    var cell = "<div class='" + cssClass + "' style='" + style + "' column_id='" + col.name + "'>" + label + sort + "</div>";
    cells.push(cell);
  }
  this.$grid_scale.style.height = (this.config.scale_height - 1) + "px";
  this.$grid_scale.style.lineHeight = lineHeigth + "px";
  this.$grid_scale.style.width = (width - 1) + "px";
  this.$grid_scale.innerHTML = cells.join("");
};

gantt._render_grid_item = function (item) {
  if (!gantt._is_grid_visible())
    return null;
  if(!item.columns){
    return gantt._render_grid_superitem(item);
  }
  var columns = this.getGridColumns();
  var cells = [];
  var width = 0;
  for (var i = 0; i < columns.length; i++) {
    var last = i == columns.length - 1;
    var col = columns[i];
    var cell;

    var value;
    if (col.name == "add") {
      value = "<div class='gantt_add'></div>";
    } else {
      if (col.template)
        value = col.template(item);
      else
        value = item[col.name];

      if (value instanceof Date)
        value = this.templates.date_grid(value);
      value = "<div class='gantt_tree_content'>" + value + "</div>";
    }
    var css = "gantt_cell gantt_tree_cell" +(col.css?" "+col.css:"")+ (last ? " gantt_last_cell" : "");

    var tree = "";
    if (col.tree) {
      for (var j = 0; j < item.$level; j++)
        tree += this.templates.grid_indent(item);

      var has_child = this._has_children(item.id);
      if (has_child) {
        tree += this.templates.grid_open(item);
        tree += this.templates.grid_folder(item);
      } else {
        tree += this.templates.grid_blank(item);
        tree += this.templates.grid_file(item);
      }
    }
    var style = "width:" + (col.width - (last ? 1 : 0)) + "px;";
    if (dhtmlx.defined(col.align))
      style += "text-align:" + col.align + ";";
    cell = "<div class='" + css + "' style='" + style + "'>" + tree + value + "</div>";
    cells.push(cell);
  }
  var css = item.$index % 2 === 0 ? " odd" : "";
  css += (item.$transparent) ? " gantt_transparent" : "";
  if (this.templates.grid_row_class) {
    var css_template = this.templates.grid_row_class.call(this, item.start_date, item.end_date, item);
    if (css_template)
      css += " " + css_template;
  }

  if (this.getState().selected_task == item.id) {
    css += " gantt_selected";
  }
  var el = document.createElement("div");
  el.className = "gantt_row gantt_tree_row" + css;
  el.setAttribute("data-url","/issues/"+item.id+".json");  // HOSEK
  el.style.height = this.config.row_height + "px";
  el.style.lineHeight = (gantt.config.row_height) + "px";
  el.setAttribute(this.config.task_attribute, item.id);
  el.setAttribute('data-level', item.$level);
  el.setAttribute('data-prev-count', item.$prev);
  el.innerHTML = cells.join("");
  return el;
};

gantt.open = function (id) {
  if (this.callEvent("onBeforeTaskOpened", [id]) === false) return;
  gantt._set_item_state(id, true);
  this.callEvent("onTaskOpened", [id]);
};
gantt.close = function (id) {
  gantt._set_item_state(id, false);
  this.callEvent("onTaskClosed", [id]);
};
gantt._set_item_state = function (id, state) {
  if (id && this._pull[id]) {
    this._pull[id].$open = state;
    this.refreshData();
  }
};

gantt._is_grid_visible = function () {
  return (this.config.grid_width && this.config.show_grid);
};
gantt._get_grid_width = function () {
  if (this._is_grid_visible()) {
    if (this._is_chart_visible()) {
      return this.config.grid_width;
    } else {
      return this._x;
    }
  } else {
    return 0;
  }
};
gantt.getTaskIndex = function (id) {
  var branch = this.getChildren(this.getParent(id));
  for (var i = 0; i < branch.length; i++)
    if (branch[i] == id)
      return i;

  return -1;
};
gantt.getGlobalTaskIndex = function (id) {
  var branch = this._order;
  for (var i = 0; i < branch.length; i++)
    if (branch[i] == id)
      return i;

  return -1;
};
gantt.moveTask = function (sid, tindex, parent) {
  ysy.log.debug("moveTask","move_task");
  //target id as 4th parameter
  var id = arguments[3];
  if (id) {
    if (id === sid) return;

    parent = this.getParent(id);
    tindex = this.getTaskIndex(id);
  }
  if(sid == parent){
    return;
  }
  parent = parent || this.config.root_id;
  var source = this.getTask(sid);
  var source_pid = this.getParent(source.id);
  var sbranch = this.getChildren(this.getParent(source.id));

  var tbranch = this.getChildren(parent);
  if (tindex == -1)
    tindex = tbranch.length + 1;
  if (source_pid == parent) {
    var sindex = this.getTaskIndex(sid);
    if (sindex == tindex) return;
  }

  if(this.callEvent("onBeforeTaskMove", [sid, parent, tindex]) === false)
    return;

  this._replace_branch_child(source_pid, sid);
  tbranch = this.getChildren(parent);

  var tid = tbranch[tindex];
  if (!tid) //adding as last element
    tbranch.push(sid);
  else
    tbranch = tbranch.slice(0, tindex).concat([ sid ]).concat(tbranch.slice(tindex));

  this.setParent(source, parent);
  this._branches[parent] = tbranch;

  var childTree = this._getTaskTree(sid);
  for(var i = 0; i < childTree.length; i++){
    var item = this._pull[childTree[i]];
    if(item)
      item.$level = this.calculateTaskLevel(item);
  }

  if(tindex*1 > 0){
    if(id){
      source.$drop_target = (this.getTaskIndex(sid) > this.getTaskIndex(id) ? "next:" : '') + id;
    }else{
      source.$drop_target = "next:" + gantt.getPrevSibling(sid);
    }
  }else if(tbranch[tindex*1 + 1]){
    source.$drop_target = tbranch[tindex*1 + 1];
  }else{
    source.$drop_target = parent;
  }

  if(!this.callEvent("onAfterTaskMove", [sid, parent, tindex]))
    return;
  source.$level = gantt.calculateTaskLevel(source);
  this.refreshData();
};

gantt._init_dnd = function (rearrange) {
  var dnd = new dhtmlxDnD(this.$grid_data, {marker:true,updates_per_second: 60});
  if (dhtmlx.defined(this.config.dnd_sensitivity))
    dnd.config.sensitivity = this.config.dnd_sensitivity;

  dnd.attachEvent("onBeforeDragStart", dhtmlx.bind(function (obj, e) {
    var target = e.target;
    ysy.log.debug("Grid onBeforeDragStart "+target.className,"move_task");
    if(!$(target).hasClass("gantt_drag_handle")){
      return false;
    }
    var el = this._locateHTML(e);
    if (!el) return false;
    if (this.hideQuickInfo) this._hideQuickInfo();

    var id = this.locate(e);

    var task = gantt.getTask(id);

    if(gantt._is_readonly(task))
      return false;
    if(task.type===gantt.config.types.milestone){
      return false;
    }

    dnd.config.initial_open_state = task.$open;
    if (!this.callEvent("onRowDragStart", [id, e.target || e.srcElement, e])) {
      return false;
    }
  }, this));

  dnd.attachEvent("onAfterDragStart", dhtmlx.bind(function (obj, e) {
    var el = this._locateHTML(e);
    ysy.log.debug("Grid onAfterDragStart "+e.target.className,"move_task");
    dnd.config.marker.innerHTML = el.outerHTML;
    dnd.config.id = this.locate(e);
    var task = this.getTask(dnd.config.id);
    dnd.config.index = this.getTaskIndex(dnd.config.id);
    dnd.config.parent = task.parent;
    task.$open = false;
    task.$transparent = true;
    //this.refreshData();
  }, this));

  dnd.lastTaskOfLevel = function (level) {
    var ids = gantt._order,
      pull = gantt._pull,
      last_item = null;
    for (var i = 0, len = ids.length; i < len; i++) {
      if (pull[ids[i]].$level == level) {
        last_item = pull[ids[i]];
      }
    }
    return last_item ? last_item.id : null;
  };
  dnd._getGridPos = dhtmlx.bind( function(e){
    var pos = this._get_position(this.$grid_data);

    // row offset
    var x = pos.x;
    var y = e.pos.y - 10;

    // prevent moving row out of grid_data container
    if (y < pos.y) y = pos.y;
    if (y > pos.y + this.$grid_data.offsetHeight - this.config.row_height) y = pos.y + this.$grid_data.offsetHeight - this.config.row_height;

    pos.x = x;
    pos.y = y;
    return pos;
  }, this);
  dnd.attachEvent("onDragMove", dhtmlx.bind(function (obj, e) {
    ysy.log.debug("Grid onDragMove","move_task");
    var dd = dnd.config;
    var pos = dnd._getGridPos(e);

    // setting position of row
    dd.marker.style.left = pos.x + 10 + "px";
    dd.marker.style.top = pos.y + "px";

    //previous action might cause page scroll appear thus change position of the gantt, need to recalculate
    pos = dnd._getGridPos(e);

    var x = pos.x,
      y = pos.y;

    // highlight row when mouseover
    var $window = $(window);
    var target = document.elementFromPoint(pos.x - $window.scrollLeft() + 1, y - $window.scrollTop()+9);
    var el = this.locate(target);

    var item = this.getTask(dnd.config.id);
    if (!this.isTaskExists(el)) {
      el = dnd.lastTaskOfLevel(item.$level);
      if (el == dnd.config.id) {
        el = null;
      }
    }

    if (this.isTaskExists(el)) {
      var box = gantt._get_position(target);
      var over = this.getTask(el);

      if(rearrange){  // HOSEK
        ysy.log.debug("over="+over.id+" "+over.text,"sort_over");
        if(dnd.config.over!==over){
          dnd.config.over=over;
          $(target).closest(".gantt_grid_data").find(".gantt_drag_hover").removeClass("gantt_drag_hover");
          $(target).closest(".gantt_row").addClass("gantt_drag_hover");
        }
        return true;
      }    // HOSEK

      if (box.y + target.offsetHeight / 2 < y) {
        //hovering over bottom part of item, check can be drop to bottom
        var index = this.getGlobalTaskIndex(over.id);
        var next = this._pull[this._order[index + 1]]; //adds +1 when hovering over placeholder
        if (next) {
          if (next.id != item.id)
            over = next; //there is a valid target
          else
            return;
        } else {
          //we at end of the list, check and drop at the end of list
          next = this._pull[this._order[index]];
          if (next.$level == item.$level && next.id != item.id) {
            this.moveTask(item.id, -1, this.getParent(next.id));

            return;
          }
        }
      }
      //if item is on different level, check the one before it
      var index = this.getGlobalTaskIndex(over.id),
        prev = this._pull[this._order[index-1]];

      var shift = 1;
      while((!prev || prev.id == over.id) && index - shift >= 0){
        prev = this._pull[this._order[index-shift]];
        shift++;
      }

      if (item.id == over.id) return;
      //replacing item under cursor
      if (over.$level == item.$level && item.id != over.id) {
        this.moveTask(item.id, 0, 0, over.id);

      }else if(over.$level == item.$level - 1 && !gantt.getChildren(over.id).length){
        this.moveTask(item.id, 0, over.id);

      } else if(prev && (prev.$level == item.$level) && (item.id != prev.id)){
        this.moveTask(item.id, -1, this.getParent(prev.id));

      }
    }
    return true;
  }, this));

  dnd.attachEvent("onDragEnd", dhtmlx.bind(function () {
    ysy.log.debug("Grid onDragEnd","move_task");
    //if(!dnd.config.started){return;}
    var task = this.getTask(dnd.config.id);
    if(this.callEvent("onBeforeRowDragEnd",[dnd.config.id, dnd.config.parent, dnd.config.index]) === false) {
      this.moveTask(dnd.config.id, dnd.config.index, dnd.config.parent);
      task.$drop_target = null;
    }else{
      if(rearrange){    //  HOSEK
        var over=dnd.config.over;
        var allowed = gantt.allowedParent(task,over);
        while(!allowed){
          if(over.real_id>1000000000000){
            dhtmlx.message(ysy.view.getLabel("errors2","unsaved_parent"),"error");
            over = null;
            break;
          }
          var parentID = over.parent;
          if(parentID === 0){
            over = null;
            break;
          }
          over = gantt.getTask(parentID);
          allowed = gantt.allowedParent(task,over);
        }
        if(over){
          if(this.callEvent("onBeforeTaskMove", [task.id, over.id, 0]) === false)
            return;
          task.$drop_target = null;
          if (over.readonly && over.$rendered_type === "project") {
            this.callEvent("onAfterTaskMove", [task.id, over.id, 0]);
            return;
          }
          gantt.silentMoveTask(task, over.id);
          this.callEvent("onAfterTaskMove", [task.id, over.id, 0]);
          task.widget.update(task);
        }
      }                 //  HOSEK
      this.callEvent("onRowDragEnd", [dnd.config.id, task.$drop_target]);
    }

    task.$transparent = false;
    task.$open = dnd.config.initial_open_state;
    this.refreshData();

  }, this));
};

/* will be overwriten in order to provide hide/show column functionality in some editions */
gantt.getGridColumns = function () {
  return this.config.columns;
};

gantt._has_children = function(id){
  return this.getChildren(id).length > 0;
};

gantt._scale_helpers = {
  getSum : function(sizes, from, to){
    if(to === undefined)
      to = sizes.length - 1;
    if(from === undefined)
      from = 0;

    var summ = 0;
    for(var i=from; i <= to; i++)
      summ += sizes[i];

    return summ;
  },
  setSumWidth : function(sum_width, scale, from, to){
    var parts = scale.width;

    if(to === undefined)
      to = parts.length - 1;
    if(from === undefined)
      from = 0;
    var length = to - from + 1;

    if(from > parts.length - 1 || length <= 0 || to > parts.length - 1)
      return;

    var oldWidth = this.getSum(parts, from, to);

    var diff = sum_width - oldWidth;

    this.adjustSize(diff, parts, from, to);
    this.adjustSize(- diff, parts, to + 1);

    scale.full_width = this.getSum(parts);
  },
  splitSize : function(width, count){
    var arr = [];
    for(var i=0; i < count; i++) arr[i] = 0;

    this.adjustSize(width, arr);
    return arr;

  },
  adjustSize : function(width, parts, from, to){
    if(!from)
      from = 0;
    if(to === undefined)
      to = parts.length - 1;

    var length = to - from + 1;

    var full = this.getSum(parts, from, to);

    var shared = 0;

    for(var i = from; i <= to; i++){
      var share = Math.floor(width*(full ? (parts[i]/full) : (1/length)));

      full -= parts[i];
      width -= share;
      length--;

      parts[i] += share;
      shared += share;
    }
    parts[parts.length - 1] += width;
  },
        // HOSEK V
  sortScales : function(scales){
    scales.sort(function(a, b){
      var durA=moment.duration(a.step,a.unit+"s");
      var durB=moment.duration(b.step,b.unit+"s")
      if(durA < durB){
        return 1;
      }else if(durA > durB){
        return -1;
      }else{
        return 0;
      }
    });
  },
  primaryScale : function(){

    gantt._init_template("date_scale");

    return {
      unit: gantt.config.scale_unit,
      step: gantt.config.step,
      template : gantt.templates.date_scale,
      date : gantt.config.date_scale,
      css: gantt.templates.scale_cell_class
    };
  },

  prepareConfigs : function(scales, min_coll_width, container_width, scale_height){
    var heights = this.splitSize(scale_height, scales.length);
    var full_width = container_width;

    var configs = [];
    for(var i=scales.length-1; i >= 0; i--){
      var main_scale = (i == scales.length - 1);
      var cfg = this.initScaleConfig(scales[i]);
      if(main_scale){
        this.processIgnores(cfg);
      }

      this.initColSizes(cfg, min_coll_width, full_width, heights[i]);
      this.limitVisibleRange(cfg);

      if(main_scale){
        full_width = cfg.full_width;
      }

      configs.unshift(cfg);
    }

    for( var i =0; i < configs.length-1; i++){
      this.alineScaleColumns(configs[configs.length-1], configs[i]);
    }
    for(var i = 0; i < configs.length; i++){
      this.setPosSettings(configs[i]);
    }
    return configs;

  },
  setPosSettings: function(config){
    for(var i = 0, len = config.trace_x.length; i < len; i++){
      config.left.push((config.width[i - 1] || 0) + (config.left[i - 1] || 0));
    }
  },

  _ignore_time_config : function(date){
    if(this.config.skip_off_time){
      return !this.isWorkTime(date);
    }
    return false;
  },
  //defined in an extension
  processIgnores : function(config){
    config.ignore_x = {};
    config.display_count = config.count;
  },
  initColSizes : function(config, min_col_width, full_width, line_height){
    var cont_width = full_width;

    config.height = line_height;

    var column_count = config.display_count === undefined ? config.count : config.display_count;

    if(!column_count)
      column_count = 1;

    config.col_width = Math.floor(cont_width/column_count);

    if(min_col_width){
      if (config.col_width < min_col_width){
        config.col_width = min_col_width;
        cont_width = config.col_width * column_count;
      }
    }
    config.width = [];
    var ignores = config.ignore_x || {};
    for(var i =0; i < config.trace_x.length; i++){
      if(ignores[config.trace_x[i].valueOf()] || (config.display_count == config.count)){
        config.width[i] = 0;
      }else{
        config.width[i] = 1;
      }
    }

    this.adjustSize(cont_width - this.getSum(config.width)/* 1 width per column from the code above */, config.width);
    config.full_width = this.getSum(config.width);
  },
  initScaleConfig : function(config){
    var cfg = dhtmlx.mixin({
      count:0,
      col_width:0,
      full_width:0,
      height:0,
      width:[],
      left:[],
      trace_x:[],
      date_cache:{}
    }, config);

    this.eachColumn(config.unit, config.step, function(date){
      cfg.count++;
      var dateObj=gantt.date.Date(date);
      cfg.trace_x.push(dateObj);
    });

    return cfg;
  },
  iterateScales : function(lower_scale, upper_scale, from, to, callback){
    var upper_dates = upper_scale.trace_x;
    var lower_dates = lower_scale.trace_x;

    var prev = from || 0;
    var end = to || (lower_dates.length - 1);
    var prevUpper = 0;
    for(var up=1; up < upper_dates.length; up++){
      for(var next=prev; next <= end; next++){
        if(+lower_dates[next] == +upper_dates[up]){
          if(callback){
            callback.apply(this, [prevUpper, up, prev, next]);
          }
          prev = next;
          prevUpper = up;
          continue;
        }
      }
    }
  },
  alineScaleColumns : function(lower_scale, upper_scale, from, to){
    this.iterateScales(lower_scale, upper_scale, from, to, function(upper_start, upper_end, lower_start, lower_end){
      var targetWidth = this.getSum(lower_scale.width, lower_start, lower_end - 1);
      var actualWidth = this.getSum(upper_scale.width, upper_start, upper_end - 1);
      if(actualWidth != targetWidth){
        this.setSumWidth(targetWidth, upper_scale, upper_start, upper_end - 1);
      }

    });
  },

  eachColumn : function(unit, step, callback){
    var start = gantt.date.Date(gantt._min_date),
      end = gantt.date.Date(gantt._max_date);
    if(gantt.date[unit + "_start"]){
      start = gantt.date[unit + "_start"](start);
    }

    var curr = moment(start).toDate();
    if(+curr >= +end){
      end = gantt.date.add(curr, step, unit);
    }
    while(+curr < +end){
      callback.call(this, gantt.date.Date(curr));
      var tzOffset = curr.getTimezoneOffset();
      curr = gantt.date.add(curr, step, unit);
      curr = gantt._correct_dst_change(curr, tzOffset, step, unit);
      if(gantt.date[unit + '_start'])
        curr = gantt.date[unit + "_start"](curr);
    }
  },
  limitVisibleRange : function(cfg){
    var dates = cfg.trace_x;

    var left = 0, right = cfg.width.length-1;
    var diff = 0;
    if(+dates[0] < +gantt._min_date && left != right){
      var width = Math.floor(cfg.width[0] * ((dates[1] - gantt._min_date)/ (dates[1] - dates[0])));
      diff += cfg.width[0] - width;
      cfg.width[0] = width;

      dates[0] = moment(gantt._min_date).toDate();
    }

    var last = dates.length - 1;
    var lastDate = dates[last];
    var outDate = gantt.date.add(lastDate, cfg.step, cfg.unit);
    if(+outDate > +gantt._max_date && last > 0){
      var width = cfg.width[last] - Math.floor(cfg.width[last] * ((outDate - gantt._max_date)/(outDate - lastDate)));
      diff += cfg.width[last] - width;
      cfg.width[last] = width;
    }

    if(diff){
      var full = this.getSum(cfg.width);
      var shared = 0;
      for(var i =0; i < cfg.width.length; i++){
        var share = Math.floor(diff*(cfg.width[i]/full));
        cfg.width[i] += share;
        shared += share;
      }
      this.adjustSize(diff - shared, cfg.width);
    }

  }
};
gantt._tasks_dnd = {
  drag : null,
  _events:{
    before_start:{},
    before_finish:{},
    after_finish:{}
  },
  _handlers:{},
  init:function(){
    this.clear_drag_state();
    var drag = gantt.config.drag_mode;
    this.set_actions();

    var evs = {
      "before_start":"onBeforeTaskDrag",
      "before_finish":"onBeforeTaskChanged",
      "after_finish":"onAfterTaskDrag"
    };
    //for now, all drag operations will trigger the same events
    for(var stage in this._events){
      for(var mode in drag){
        this._events[stage][mode] = evs[stage];
      }
    }

    this._handlers[drag.move] = this._handlers[drag.move] || this._move;
    this._handlers[drag.resize] = this._handlers[drag.resize] || this._resize;
    if (!ysy.settings.showTasksSpentTimeRatio) {
      this._handlers[drag.progress] = this._handlers[drag.progress] || this._resize_progress;
    }
  },
  set_actions:function(){
    var data = gantt.$task_data;
    dhtmlxEvent(data, "mousemove", dhtmlx.bind(function(e){
      this.on_mouse_move(e||event);
    }, this));
    dhtmlxEvent(data, "mousedown", dhtmlx.bind(function(e){
      this.on_mouse_down(e||event);
    }, this));
    dhtmlxEvent(data, "mouseup", dhtmlx.bind(function(e){
      this.on_mouse_up(e||event);
    }, this));
  },

  clear_drag_state : function(){
    this.drag = {
      id:null,
      mode:null,
      pos:null,
      start_x:null,
      start_y:null,
      obj:null,
      left:null,
      last_event:null
    };
  },
  _resize : function(ev, shift, drag){
    var cfg = gantt.config;
    var coords_x = this._drag_task_coords(ev, drag);
    this.showDraggedTooltip(ev, drag);
    if(drag.left){
      var old_start = ev.start_date;
      var start_date = moment(gantt.dateFromPos(coords_x.start + shift.x));
      gantt.multiStop(ev, start_date, null, drag.limits);
      ev.start_date = start_date;
      if(!ev.start_date){
        ev.start_date = gantt.date.Date(gantt.getState().min_date);
      }
    }else{
      var old_end = ev.end_date;
      var end_date = moment(gantt.dateFromPos(coords_x.end + shift.x)).subtract(1, "days");
      end_date._isEndDate = true;
      gantt.multiStop(ev, null, end_date, drag.limits);
      ev.end_date = end_date;
      if(!ev.end_date){
        ev.end_date = gantt.date.Date(gantt.getState().max_date);
      }
      ev.end_date._isEndDate = true;  // HOSEK < A
    }
    if (ev.end_date - ev.start_date < cfg.min_duration){
      if(drag.left)
        ev.start_date = gantt.calculateEndDate(ev.end_date, -1);
      else
        ev.end_date = gantt.calculateEndDate(ev.start_date, 1);
    }
    if (drag.left) {
      gantt.moveDependent(ev, null, 'resize_left');
    } else {
      gantt.moveDependent(ev, null, 'resize_right');
    }
    return;  // HOSEK
    gantt._init_task_timing(ev);
  },
  _resize_progress:function(ev, shift, drag){
    var coords_x = this._drag_task_coords(ev, drag);

    var diff = Math.max(0, drag.pos.x - coords_x.start);
    ev.progress = Math.min(1, diff / (coords_x.end - coords_x.start));
    const progress = Math.round(ev.progress * 100);
    this.showDraggedProgressTooltip(progress, drag);
  },
  _move : function(ev, shift, drag){
    // TODO konce tasku
    var coords_x = this._drag_task_coords(ev, drag);
    if (ev.type==="milestone"){
      new_end = moment(gantt.dateFromPos(coords_x.start + shift.x));
      new_end = gantt._working_time_helper.get_closest_worktime({date:new_end, unit:"day", dir: 'any', length:1});
      new_end._isEndDate = true;
      new_start = moment(new_end);
    } else {
      var new_start = gantt._working_time_helper.get_closest_worktime({
        date:moment(gantt.dateFromPos(coords_x.start + shift.x)),
        dir:"future"
      });
      var new_end = gantt._working_time_helper.add_worktime(new_start, ev.duration, "day", true); //< HOSEKP
    }

    gantt.multiStop(ev, new_start, new_end, drag.limits);
    var old_start = ev.start_date;
    if(!new_start){
      ev.start_date = gantt.date.Date(gantt.getState().min_date);
      ev.end_date = gantt.dateFromPos(gantt.posFromDate(ev.start_date) + (coords_x.end - coords_x.start));
    }else if(!new_end){
      ev.end_date = gantt.date.Date(gantt.getState().max_date);
      ev.start_date = gantt.dateFromPos(gantt.posFromDate(ev.end_date) - (coords_x.end - coords_x.start));
    }else{
      ev.start_date = new_start;
      ev.end_date = new_end;
    }
    if (ev.type === "project") {
      ev.maximal_start = null;
      ev.minimal_end = null;

      // When you move the project, move also the milestones
      const children = gantt.getChildren(ev.id);
      children.forEach((childId)=> {
        const entity = gantt._pull[childId];
        if (entity.$rendered_type !== 'milestone') return;
        entity.obj_s_x = entity.obj_s_x || gantt.posFromDate(entity.start_date);
        const new_milestone_start = gantt.dateFromPos(entity.obj_s_x + shift.x);
        entity.start_date = new_milestone_start;
        entity.widget.update(entity);
      });

    } else {
      gantt.moveDependent(ev);
    }
    this.showDraggedTooltip(ev, drag);
  },
  showDraggedTooltip: function(e, drag) {
    const duration = gantt._working_time_helper.get_work_units_between(e.start_date, e.end_date, "all");
    const out = {
      start_date: e.start_date ? e.start_date.format(gantt.config.date_format) : ysy.settings.labels.label_not_available,
      end_date: e.end_date ? e.end_date.format(gantt.config.date_format) : ysy.settings.labels.label_not_available,
      duration: Math.floor(duration["days"])
    };
    const top = gantt.config.dateTooltipY + gantt.config.row_height;
    return ysy.view.tooltip.show("gantt-task-tooltip",
      { clientX: drag.clientX, clientY: drag.clientY, top },
      ysy.view.templates.TaskTooltip, out);
  },
  showDraggedProgressTooltip: function(progress, drag) {
    const out = { progress };
    const top = gantt.config.dateTooltipY + gantt.config.row_height;
    return ysy.view.tooltip.show("gantt-task-tooltip",
      { clientX: drag.clientX, clientY: drag.clientY, top },
      ysy.view.templates.TaskTooltip, out);
  },
  _drag_task_coords : function(t, drag){
    // TODO konce tasku
    var start = drag.obj_s_x = drag.obj_s_x || gantt.posFromDate(t.start_date);
    var end = drag.obj_e_x = drag.obj_e_x || gantt.posFromDate(t.end_date);
    return {
      start : start,
      end : end
    };
  },
  on_mouse_move : function(e){
    if(this.drag.start_drag)
      this._start_dnd(e);

    var drag = this.drag;

    if (drag.mode){
      if(!drag.last_event){
        setTimeout($.proxy(this._update_on_move,this),5);
      }
      drag.last_event=e;
    }
  },
  _update_on_move : function(){
    var drag = this.drag;
    if (drag&&drag.mode){
      var e=drag.last_event;
      if(!e) return;
      drag.last_event = null;
      var pos = gantt._get_mouse_pos(e);
      if (drag.pos) {
        if (drag.pos.x == pos.x
            && drag.pos.y == pos.y) return;
      } else {
        if (Math.abs(drag.start_x - pos.x) < 10
            && Math.abs(drag.start_y - pos.y) < 10) return;
      }

      drag.pos = pos;
      // TODO konce tasku
      var curr_date = gantt.dateFromPos(pos.x);
      if(!curr_date || isNaN( curr_date.getTime() ))
        return;

      var shift = {x:pos.x - drag.start_x,y:pos.y - drag.start_y};
      var ev = gantt.getTask(drag.id);

      if(this._handlers[drag.mode]){
        drag.target = e.target;
        drag.clientX = e.clientX;
        drag.clientY = e.clientY;
        var original = dhtmlx.mixin({}, ev);
        var copy =  dhtmlx.mixin({}, ev);
        this._handlers[drag.mode].apply(this, [copy, shift, drag]);
        dhtmlx.mixin(ev, copy, true);
        gantt.callEvent("onTaskDrag", [ev.id, drag.mode, copy, original, e]);
        ev._changed = drag.mode;

        gantt.refreshTask(drag.id);
      }
    }
  },

  on_mouse_down : function(e, src){
    // on Mac we do not get onmouseup event when clicking right mouse button leaving us in dnd state
    // let's ignore right mouse button then
    if (e.button == 2)
      return false;

    var id =gantt.locate(e);
    var task = null;
    if(gantt.isTaskExists(id)){
      task = gantt.getTask(id);
    }
    if(task==null){   // HOSEK < V
      ysy.log.debug("No task under click","empty_field");
      this.clear_drag_state();
      return;
    }  // HOSEK A
    if (gantt._is_readonly(task) || this.drag.mode) return false;

    this.clear_drag_state();

    src = src||(e.target||e.srcElement);

    var className = gantt._trim(src.className || "");
    if(!className || !this._get_drag_mode(className)){
      if(src.parentNode)
        return this.on_mouse_down(e, src.parentNode);
      else
        return false;
    }

    var drag = this._get_drag_mode(className);
    ysy.log.debug("drag.mode="+(drag?drag.mode:"null"),"empty_field");
    if(!drag){
      if (gantt.checkEvent("onMouseDown") && gantt.callEvent("onMouseDown", [className.split(" ")[0]])) {
        if (src.parentNode)
          return this.on_mouse_down(e,src.parentNode);
      }
    }else{
      if (drag.mode && drag.mode != gantt.config.drag_mode.ignore && gantt.config["drag_" + drag.mode]){
        id =  gantt.locate(src);
        if(id!=null){
          task = dhtmlx.copy(gantt.getTask(id) || {});

          if(gantt._is_readonly(task)){
            this.clear_drag_state();
            return false;
          }

          drag.id = id;
          drag.obj = task;
          drag.limits = gantt.prepareMultiStop(task);
        }
        var pos = gantt._get_mouse_pos(e);
        drag.start_x = pos.x;
        drag.start_y = pos.y;
        this.drag.start_drag = drag;
      }else
        this.clear_drag_state();
    }
    return false;
  },
  _fix_dnd_scale_time:function(task, drag){
    alert("Forbidden function _fix_dnd_scale_time");
    var unit = gantt._tasks.unit,
      step = gantt._tasks.step;
    if(!gantt.config.round_dnd_dates){
      unit = 'minute';
      step = gantt.config.time_step;
    }
    unit="day";  // HOSEK

    function fixStart(task){
      if(!gantt.isWorkTime(task.start_date))
        task.start_date = gantt.calculateEndDate(task.start_date, 0, gantt.config.duration_unit); // HOSEK (originally -1)
    }
    function fixEnd(task){
      if(!gantt.isWorkTime(gantt.date.Date(task.end_date - 1)))
        task.end_date = gantt.calculateEndDate(task.end_date, 1, gantt.config.duration_unit);
    }
    if(drag.mode == gantt.config.drag_mode.resize){
      if(drag.left){
        task.start_date = gantt.roundDate({date:task.start_date, unit:unit, step:step});
        fixStart(task);
      }else{
        task.end_date = gantt.roundDate({date:task.end_date, unit:unit, step:step});
        fixEnd(task);
      }
      task.duration=gantt.calculateDuration(task.start_date,task.end_date);
    }else if(drag.mode == gantt.config.drag_mode.move){
      task.start_date = gantt.roundDate({date:task.start_date, unit:unit, step:step});
      fixStart(task);

      task.end_date = gantt.calculateEndDate(task.start_date, task.duration, gantt.config.duration_unit);
    }
  },
  _fix_working_times:function(task, drag){
    gantt._working_time_helper.round_date(task.start_date);
    if(drag.mode == gantt.config.drag_mode.resize){
      gantt._working_time_helper.round_date(task.end_date, "past");
        task.duration=gantt._working_time_helper.get_work_units_between(task.start_date,task.end_date,"day");
    }
    task.end_date=gantt._working_time_helper.add_worktime(task.start_date,task.duration,"day");
  },
  on_mouse_up : function(e){
    var drag = this.drag;
    if (drag.mode && drag.id) {
      //drop
      var ev = gantt.getTask(drag.id);
      // HOSEK
      this._fireEvent("before_finish", drag.mode, [drag.id, drag.mode, e]);
      gantt.updateAllTask(ev);

      if (gantt._tasks.needRescale) {
        gantt._tasks.needRescale = false;
        gantt.render();
        ysy.log.debug("Scale rescaled", "outer");
      }
      this.clear_drag_state();
      ysy.view.tooltip.hide();
      // reset milestones position when you stop dragging
      if (ev.type === "project") {
        const children = gantt.getChildren(ev.id);
        children.forEach((childId) => {
          const entity = gantt._pull[childId];
          if (entity.$rendered_type !== 'milestone') return;
          entity.obj_s_x = null;
        });
      }
      return;
    }
    this.clear_drag_state();
  },
  _get_drag_mode : function(className){
    var modes = gantt.config.drag_mode;
    var classes = (className || "").split(" ");
    var classname = classes[0];
    var drag = {mode:null, left:null};
    switch (classname) {
      case "gantt_task_line":
      case "gantt_task_content":
        drag.mode = modes.move;
        break;
      case "gantt_task_drag":
        drag.mode = modes.resize;
        if(classes[1] && classes[1].indexOf("left", classes[1].length - "left".length) !== -1){
          drag.left = true;
        }else{
          drag.left = false;
        }
        break;
      case "gantt_task_progress_drag":
        drag.mode = modes.progress;
        break;
      case "gantt_link_control":
      case "gantt_link_point":
        drag.mode = modes.ignore;
        break;
      case "gantt_task_cell":
        drag.mode = "empty";    // HOSEK  < A V
        break;
      default:
        drag = null;
        break;
    }
    return drag;
  },

  _start_dnd : function(e){
    var drag = this.drag = this.drag.start_drag;
    delete drag.start_drag;

    var cfg = gantt.config;
    var id = drag.id;
    if (!cfg["drag_"+drag.mode] || !gantt.callEvent("onBeforeDrag",[id, drag.mode, e]) || !this._fireEvent("before_start", drag.mode, [id, drag.mode, e])){
      this.clear_drag_state();
    }else {
      delete drag.start_drag;
    }
  },
  _fireEvent:function(stage, mode, params){
    dhtmlx.assert(this._events[stage], "Invalid stage:{" + stage + "}");

    var trigger = this._events[stage][mode];

    dhtmlx.assert(trigger, "Unknown after drop mode:{" + mode + "}");
    dhtmlx.assert(params, "Invalid event arguments");


    if(!gantt.checkEvent(trigger))
      return true;

    return gantt.callEvent(trigger, params);
  }
};

gantt.roundTaskDates = function(task){
  alert("Forbidden function roundTaskDates");
  var drag_state = gantt._tasks_dnd.drag;

  if(!drag_state){
    drag_state = {mode:gantt.config.drag_mode.move};
  }
  gantt._tasks_dnd._fix_dnd_scale_time(task, drag_state);
};

gantt._render_link = function(id){
  var link = this.getLink(id);
  var renders = gantt._get_link_renderers();
  //ysy.log.debug("_render_link() id="+id+" rend="+renders.length,"link_render");
  for(var i = 0; i < renders.length; i++)
    renders[i].render_item(link);
};

gantt._get_link_type = function(from_start, to_start){
  var type = null;
  if(from_start && to_start){
    type = gantt.config.links.start_to_start;
  }else if(!from_start && to_start){
    type = gantt.config.links.finish_to_start;
  }else if(!from_start && !to_start){
    type = gantt.config.links.finish_to_finish;
  }else if(from_start && !to_start){
    type = gantt.config.links.start_to_finish;
  }
  return type;
};

gantt.isLinkAllowed = function(from, to, from_start, to_start){
  var link = null;
  if(typeof(from) == "object"){
    link = from;
  }else{
    link = {source:from, target:to, type: this._get_link_type(from_start, to_start)};
  }

  if(!link) return false;
  if(link.target && link.target.toString().startsWith("p")) return false;
  if(!(link.source && link.target && link.type)) return false;
  if(link.source == link.target) return false;

  var res = true;
  //any custom rules
  if(this.checkEvent("onLinkValidation"))
    res = this.callEvent("onLinkValidation", [link]);

  return res;
};

gantt._render_link_element = function(link){
  //ysy.log.debug("render_link_element() link="+link.id,"link_render");
  var dots = this._path_builder.get_points(link);
  var drawer = gantt._drawer;
  var lines = drawer.get_lines(dots);

  var div = document.createElement("div");

  var css = "gantt_task_link";

  if(link.color){
    css += " gantt_link_inline_color";
  }
  var cssTemplate = this.templates.link_class ? this.templates.link_class(link) : "";
  if(cssTemplate){
    css += " " + cssTemplate;
  }

  if(this.config.highlight_critical_path && this.isCriticalLink){
    if(this.isCriticalLink(link))
      css += " gantt_critical_link";
  }

  div.className = css;
  div.setAttribute(gantt.config.link_attribute, link.id);
  for(var i=0; i < lines.length; i++){
    if(i == lines.length - 1){
      lines[i].size -= gantt.config.link_arrow_size;
    }
    var el = drawer.render_line(lines[i], lines[i+1]);
    if(link.color){
      el.firstChild.style.backgroundColor = link.color;
    }
    div.appendChild(el);
  }

  var direction = lines[lines.length - 1].direction;
  var endpoint = gantt._render_link_arrow(dots[dots.length - 1], direction);
  if(link.color){
    endpoint.style.borderColor = link.color;
  }
  div.appendChild(endpoint);
  // HOSEK
    var delaypos = {
      x: (dots[dots.length - 2].x + dots[dots.length - 1].x) / 2 - 5,
      y: dots[dots.length - 2].y - 2
    };
    var delay_element = gantt.render_delay_element(link, delaypos);
    if(delay_element)
      div.appendChild(delay_element);
  // HOSEK
  return div;
};

gantt._render_link_arrow = function(point, direction){
  var div = document.createElement("div");
  var drawer = gantt._drawer;
  var top = point.y;
  var left = point.x;

  var size = gantt.config.link_arrow_size;
  var line_width = gantt.config.row_height;
  var className = "gantt_link_arrow gantt_link_arrow_" + direction;
  switch (direction){
    case drawer.dirs.right:
      top -= (size - line_width)/2;
      left -= size;
      break;
    case drawer.dirs.left:
      top -= (size - line_width)/2;
      break;
    case drawer.dirs.up:
      left -= (size - line_width)/2;
      break;
    case drawer.dirs.down:
      top -= size;
      left -= (size - line_width)/2;
      break;
    default:
      break;
  }
  div.style.cssText = [
    "top:"+top + "px",
    "left:"+left+'px'].join(';');
  div.className = className;

  return div;
};

gantt._drawer = {
  current_pos:null,
  dirs:{"left":'left',"right":'right',"up":'up', "down":'down'},
  path:[],
  clear:function(){
    this.current_pos = null;
    this.path = [];
  },
  point:function(pos){
    this.current_pos = dhtmlx.copy(pos);
  },
  get_lines:function(dots){
    this.clear();
    this.point(dots[0]);
    for(var i=1; i<dots.length ; i++){
      this.line_to(dots[i]);
    }
    return this.get_path();
  },
  line_to:function(pos){
    var next = dhtmlx.copy(pos);
    var prev = this.current_pos;

    var line = this._get_line(prev, next);
    this.path.push(line);
    this.current_pos = next;
  },
  get_path:function(){
    return this.path;
  },
  get_wrapper_sizes :function(v){
    var res,
      wrapper_size = gantt.config.link_wrapper_width,
      line_size = gantt.config.link_line_width,
      y = v.y + Math.floor((gantt.config.row_height - wrapper_size)/2);
    switch (v.direction){
      case this.dirs.left:
        res = {	top : y,
          height : wrapper_size,
          lineHeight : wrapper_size,
          left : v.x - v.size - wrapper_size/2 ,
          width : v.size +wrapper_size};
        break;
      case this.dirs.right:
        res = {	top : y,
          lineHeight : wrapper_size,
          height : wrapper_size,
          left : v.x - wrapper_size/2,
          width : v.size + wrapper_size};
        break;
      case this.dirs.up:
        res = {	top : y - v.size,
          lineHeight: v.size + wrapper_size,
          height : v.size + wrapper_size,
          left : v.x - wrapper_size/2,
          width : wrapper_size};
        break;
      case this.dirs.down:
        res = {	top : y,
          lineHeight: v.size + wrapper_size,
          height : v.size + wrapper_size,
          left : v.x - wrapper_size/2,
          width : wrapper_size};
        break;
      default:
        break;
    }

    return res;
  },
  get_line_sizes : function(v){
    var res,
      line_size = gantt.config.link_line_width,
      wrapper_size = gantt.config.link_wrapper_width,
      size =  v.size + line_size;
    switch (v.direction){
      case this.dirs.left:
      case this.dirs.right:
        res = {
          height : line_size,
          width : size,
          marginTop: (wrapper_size - line_size)/2-1,
          marginLeft: (wrapper_size - line_size)/2
        };
        break;
      case this.dirs.up:
      case this.dirs.down:
        res = {
          height : size,
          width : line_size,
          marginTop: (wrapper_size - line_size)/2-1,
          marginLeft: (wrapper_size - line_size)/2
        };
        break;
      default:
        break;
    }

    return res;
  },
  render_line : function(v){
    var pos = this.get_wrapper_sizes(v);
    var wrapper = document.createElement("div");
    wrapper.style.cssText = [
      "top:" + pos.top + "px",
      "left:" + pos.left + "px",
      "height:" + pos.height + "px",
      "width:" + pos.width + "px"
    ].join(';');
    wrapper.className = "gantt_line_wrapper";

    var innerPos = this.get_line_sizes(v);
    var inner = document.createElement("div");
    inner.style.cssText = [
      "height:" + innerPos.height + "px",
      "width:" + innerPos.width + "px",
      "margin-top:" + innerPos.marginTop + "px",
      "margin-left:" + innerPos.marginLeft + "px"
    ].join(";");

    inner.className = "gantt_link_line_" + v.direction;
    wrapper.appendChild(inner);

    return wrapper;
  },
  _get_line:function(from, to){
    var direction = this.get_direction(from, to);
    var vect = {
      x : from.x,
      y : from.y,
      direction : this.get_direction(from, to)
    };
    if(direction == this.dirs.left || direction == this.dirs.right){
      vect.size =  Math.abs(from.x - to.x);
    }else{
      vect.size =  Math.abs(from.y - to.y);
    }
    return vect;
  },
  get_direction:function(from, to){
    var direction = 0;
    if(to.x < from.x){
      direction = this.dirs.left;
    }else if (to.x > from.x){
      direction = this.dirs.right;
    }else if (to.y > from.y){
      direction = this.dirs.down;
    }else {
      direction = this.dirs.up;
    }
    return direction;
  }

};
gantt._y_from_ind = function(index){
  return (index)*gantt.config.row_height;
};
gantt._path_builder = {

  path:[],
  clear:function(){
    this.path = [];
  },
  current:function(){
    return this.path[this.path.length - 1];
  },
  point:function(next){
    if(!next)
      return this.current();

    this.path.push(dhtmlx.copy(next));
    return next;
  },
  point_to:function(direction, diff, point){
    if(!point)
      point = dhtmlx.copy(this.point());
    else
      point = {x:point.x, y:point.y};
    var dir = gantt._drawer.dirs;
    switch (direction){
      case (dir.left):
        point.x -= diff;
        break;
      case (dir.right):
        point.x += diff;
        break;
      case (dir.up):
        point.y -= diff;
        break;
      case (dir.down):
        point.y += diff;
        break;
      default:
        break;
    }
    return this.point(point);
  },
  get_points:function(link){
    var pt = this.get_endpoint(link);
    var xy = gantt.config;

    var dy = pt.e_y - pt.y;
    var dx = pt.e_x - pt.x;

    var dir = gantt._drawer.dirs;

    this.clear();
    this.point({x: pt.x, y : pt.y});

    var shiftX = ((link.id % 3) / 3 + 1.5) * xy.link_arrow_size;//just random size for first line

    var forward = (pt.e_x > pt.x);
    if(link.type == gantt.config.links.start_to_start){
      this.point_to(dir.left, shiftX);
      if(forward){
        this.point_to(dir.down, dy);
        this.point_to(dir.right,  dx);
      }else{
        this.point_to(dir.right, dx);
        this.point_to(dir.down, dy);
      }
      this.point_to(dir.right, shiftX);

    }else if(link.type == gantt.config.links.finish_to_start){
      forward = (pt.e_x > (pt.x + 2*shiftX));
      this.point_to(dir.right, shiftX);
      if(forward){
        dx -= shiftX;
        this.point_to(dir.down, dy);
        this.point_to(dir.right, dx);
      }else{
        dx -= 2*shiftX;
        var sign = dy > 0 ? 1 : -1;

        this.point_to(dir.down, sign * (xy.row_height/2));
        this.point_to(dir.right, dx);
        this.point_to(dir.down, sign * ( Math.abs(dy) - (xy.row_height/2)));
        this.point_to(dir.right, shiftX);
      }

    }else if(link.type == gantt.config.links.finish_to_finish){
      this.point_to(dir.right, shiftX);
      if(forward){
        this.point_to(dir.right, dx);
        this.point_to(dir.down, dy);
      }else{
        this.point_to(dir.down, dy);
        this.point_to(dir.right, dx);
      }
      this.point_to(dir.left, shiftX);
    }else if(link.type == gantt.config.links.start_to_finish){

      forward = (pt.e_x > (pt.x - 2*shiftX));
      this.point_to(dir.left, shiftX);

      if(!forward){
        dx += shiftX;
        this.point_to(dir.down, dy);
        this.point_to(dir.right,  dx);
      }else{
        dx += 2*shiftX;
        var sign = dy > 0 ? 1 : -1;
        this.point_to(dir.down, sign * (xy.row_height/2));
        this.point_to(dir.right, dx);
        this.point_to(dir.down, sign * ( Math.abs(dy) - (xy.row_height/2)));
        this.point_to(dir.left, shiftX);
      }

    }

    return this.path;
  },
  get_endpoint : function(link){
    var types = gantt.config.links;
    var from_start = false, to_start = false;

    if(link.type == types.start_to_start){
      from_start = to_start = true;
    }else if(link.type == types.finish_to_finish){
      from_start = to_start = false;
    }else if(link.type == types.finish_to_start){
      from_start = false;
      to_start = true;
    }else if(link.type == types.start_to_finish){
      from_start = true;
      to_start = false;
    }else{
      dhtmlx.assert(false, "Invalid link type");
    }

    var from = gantt._get_task_visible_pos(gantt._pull[link.source], from_start);
    var to = gantt._get_task_visible_pos(gantt._pull[link.target], to_start);

    return {
      x :  from.x,
      e_x : to.x,
      y : from.y ,
      e_y : to.y
    };
  }
};

gantt._init_links_dnd = function() {
  var dnd = new dhtmlxDnD(this.$task_bars, { marker:true,sensitivity : 0, updates_per_second : 60 }),
    start_marker = "task_left",
    end_marker = "task_right",
    link_edge_marker = "gantt_link_point",
    link_landing_hover_area = "gantt_link_control";

  dnd.attachEvent("onBeforeDragStart", dhtmlx.bind(function(obj,e) {
    var target = (e.target||e.srcElement);
    resetDndState();
    if(gantt.getState().drag_id)
      return false;

    if(gantt._locate_css(target, link_edge_marker)){
      if(gantt._locate_css(target, start_marker))
        gantt._link_source_task_start = true;

      var sid = gantt._link_source_task = this.locate(e);

      var t = gantt.getTask(sid);
      if(gantt._is_readonly(t)){
        resetDndState();
        return false;
      }

      var shift = 0;
      if(gantt._get_safe_type(t.type) == gantt.config.types.milestone){
        shift = (gantt._get_visible_milestone_width() - gantt._get_milestone_width())/2;
      }

      this._dir_start = getLinePos(t, !!gantt._link_source_task_start, shift);
      return true;
    }else{
      return false;
    }
  }, this));

  dnd.attachEvent("onAfterDragStart", dhtmlx.bind(function(obj,e) {
    updateMarkedHtml(dnd.config.marker);
  }, this));

  function getLinePos(task, to_start, shift){
    var pos = gantt._get_task_pos(task, !!to_start);
    pos.y += gantt._get_task_height()/2;

    shift = shift || 0;
    pos.x += (to_start ? -1 : 1)*shift;
    return pos;
  }

  dnd.attachEvent("onDragMove", dhtmlx.bind(function(obj,e) {
    var dd = dnd.config;
    var pos = dnd.getPosition(e);
    var landing = false;// = gantt._is_link_drop_area(e);

    var prevTarget = gantt._link_target_task;
    var prevLanding = gantt._link_landing;
    var prevToStart = gantt._link_target_task_start;
    var to_start = true;
    if(gantt._locate_css(e,"gantt_task_line")){
      var targ = gantt.locate(e);
    }else{
      targ = null;
    }
    ysy.log.debug("landing=" + landing + " target=" + targ, "link_drag");
    if (targ){
      //refreshTask
      to_start = !gantt._locate_css(e, end_marker);
      var link = getDndState();
      var landing = gantt.isLinkAllowed(link.from, link.to, link.from_start, link.to_start);
    }

    gantt._link_target_task = targ;
    gantt._link_landing = landing;
    gantt._link_target_task_start = to_start;

    if(landing){
      var t = gantt.getTask(targ);

      var node = gantt._locate_css(e, link_landing_hover_area);
      var shift = 0;
      if(node){
        shift = Math.floor(node.offsetWidth  / 2);
      }

      this._dir_end = getLinePos(t, !!gantt._link_target_task_start,shift);
    }else{
      this._dir_end = gantt._get_mouse_pos(e);
    }

    var targetChanged = !(prevLanding == landing && prevTarget == targ && prevToStart == to_start);
    if(targetChanged){
      if(prevTarget)
        gantt.refreshTask(prevTarget, false);
      if(targ)
        gantt.refreshTask(targ, false);
    }

    if(targetChanged){
      updateMarkedHtml(dd.marker);
    }

    showDirectingLine(this._dir_start.x, this._dir_start.y, this._dir_end.x, this._dir_end.y);

    return true;
  }, this));

  dnd.attachEvent("onDragEnd", dhtmlx.bind(function() {
    var drag = getDndState();

    if(drag.from && drag.to && drag.from != drag.to){
      var type = gantt._get_link_type(drag.from_start, drag.to_start);

      var link = {source : drag.from, target: drag.to, type:type};
      if(link.type && gantt.isLinkAllowed(link))
        gantt.addLink(link);
    }

    resetDndState();

    if(drag.from)
      gantt.refreshTask(drag.from, false);
    if(drag.to)
      gantt.refreshTask(drag.to, false);
    removeDirectionLine();
  }, this));

  function updateMarkedHtml(marker){
    var link = getDndState();

    var css = ["gantt_link_tooltip"];
    var allowed = gantt.isLinkAllowed(link.from, link.to, link.from_start, link.to_start);
    if(link.from && link.to){
      if (allowed){
        css.push("gantt_allowed_link");
      } else {
        css.push("gantt_invalid_link");
      }
    }

    var className = gantt.templates.drag_link_class(link.from, link.from_start, link.to, link.to_start);
    if(className)
      css.push(className);

    var html = "<div class='"+className+ "'>" +
        gantt.templates.drag_link(link.from, link.from_start, link.to, link.to_start) +
      "</div>";
    marker.innerHTML = html;
  }

  function advanceMarker(marker, pos){
    marker.style.left = pos.x + 5 + "px";
    marker.style.top = pos.y + 5 + "px";
  }
  function getDndState(){
    return { from : gantt._link_source_task,
        to : gantt._link_target_task,
        from_start : gantt._link_source_task_start,
        to_start : gantt._link_target_task_start};
  }
  function resetDndState(){
    gantt._link_source_task =
      gantt._link_source_task_start =
        gantt._link_target_task = null;
    gantt._link_target_task_start = true;
  }
  function showDirectingLine(s_x, s_y, e_x, e_y){
    var div = getDirectionLine();

    var link = getDndState();

    var css = ["gantt_link_direction"];
    if(gantt.templates.link_direction_class){
      css.push(gantt.templates.link_direction_class(link.from, link.from_start, link.to, link.to_start));
    }

    var dist =Math.sqrt( (Math.pow(e_x - s_x, 2)) + (Math.pow(e_y - s_y, 2)) );
    dist = Math.max(0, dist - 3);
    if(!dist)
      return;

    div.className = css.join(" ");
    var tan = (e_y - s_y)/(e_x - s_x),
      angle = Math.atan(tan);

    if(coordinateCircleQuarter(s_x, e_x, s_y, e_y) == 2){
      angle += Math.PI;
    }else if(coordinateCircleQuarter(s_x, e_x, s_y, e_y) == 3){
      angle -= Math.PI;
    }

    var sin = Math.sin(angle),
      cos = Math.cos(angle),
      top = Math.round(s_y),
      left = Math.round(s_x);

    var style = [
      "-webkit-transform: rotate("+angle+"rad)",
      "-moz-transform: rotate("+angle+"rad)",
      "-ms-transform: rotate("+angle+"rad)",
      "-o-transform: rotate("+angle+"rad)",
      "transform: rotate("+angle+"rad)",
      "width:" + Math.round(dist) + "px"
    ];

    if(window.navigator.userAgent.indexOf("MSIE 8.0") != -1){
      //ms-filter breaks styles in ie9, so add it only for 8th
      style.push("-ms-filter: \"" + ieTransform(sin, cos) + "\"");

      var shiftLeft = Math.abs(Math.round(s_x - e_x)),
        shiftTop = Math.abs(Math.round(e_y - s_y));
      //fix rotation axis
      switch(coordinateCircleQuarter(s_x, e_x, s_y, e_y)){
        case 1:
          top -= shiftTop;
          break;
        case 2:
          left -= shiftLeft;
          top -= shiftTop;
          break;
        case 3:
          left -= shiftLeft;
          break;
        default:
          break;
      }
    }

    style.push("top:" +  top + "px");
    style.push("left:" +  left + "px");

    div.style.cssText = style.join(";");
  }

  function ieTransform(sin, cos){
    return "progid:DXImageTransform.Microsoft.Matrix("+
      "M11 = "+cos+","+
      "M12 = -"+sin+","+
      "M21 = "+sin+","+
      "M22 = "+cos+","+
      "SizingMethod = 'auto expand'"+
    ")";
  }
  function coordinateCircleQuarter(sX, eX, sY, eY){
    if(eX >= sX){
      if(eY <= sY){
        return 1;
      }else{
        return 4;
      }
    }else{
      if(eY <= sY){
        return 2;
      }else{
        return 3;
      }
    }
  }
  function getDirectionLine(){
    if(!dnd._direction){
      dnd._direction = document.createElement("div");
      gantt.$task_links.appendChild(dnd._direction);
    }
    return dnd._direction;
  }
  function removeDirectionLine(){
    if(dnd._direction){
      if (dnd._direction.parentNode)	//the event line can be detached because of data refresh
        dnd._direction.parentNode.removeChild(dnd._direction);

      dnd._direction = null;
    }
  }

  gantt._is_link_drop_area = function(e){
    return !!gantt._locate_css(e, link_landing_hover_area);
  };
};
gantt._get_link_state = function(){
  return {
    link_landing_area : this._link_landing,
    link_target_id : this._link_target_task,
    link_target_start : this._link_target_task_start,
    link_source_id : this._link_source_task,
    link_source_start : this._link_source_task_start
  };
};

gantt._init_tasks = function(){
  //store temporary configs
  this._tasks = {
    col_width:this.config.columnWidth,
    width: [], // width of each column
    full_width: 0, // width of all columns
    trace_x:[],
    rendered:{}
  };

  this._click.gantt_task_link = dhtmlx.bind(function(e, trg){
    var id = this.locate(e, gantt.config.link_attribute);
    if(id){
      this.callEvent("onLinkClick", [id, e]);
    }
  }, this);

  this._click.gantt_scale_cell = dhtmlx.bind(function(e, trg){
    var pos = gantt._get_mouse_pos(e);
    var date = gantt.dateFromPos(pos.x);
    var coll = Math.floor(gantt._day_index_by_date(date));

    var coll_date = gantt._tasks.trace_x[coll];

    gantt.callEvent("onScaleClick", [e, coll_date]);
  }, this);

  this._tasks_dnd.init();
  this._init_links_dnd();

  this._link_layers.clear();

  var links_layer = this.addLinkLayer({
    renderer: this._render_link_element,
    container: this.$task_links,
    filter: gantt._create_filter(['_filter_link', '_is_chart_visible'])
  });
  gantt._link_layers.process();
  this._linkRenderer = this._link_layers.getRenderer(links_layer);

  this._task_layers.clear();
  var bar_layer = this.addTaskLayer({
    renderer: this._render_task_element,
    container: this.$task_bars,
    filter: gantt._create_filter(['_filter_task', '_is_chart_visible'])
  });

  var grid_layer = this.addTaskLayer({
    renderer: this._render_grid_item,
    container: this.$grid_data,
    filter: gantt._create_filter(['_filter_task', '_is_grid_visible'])
  });

  var background_layer = this.addTaskLayer(ysy.view.getGanttBackground());
  gantt._task_layers.process();
  this._taskRenderer = this._task_layers.getRenderer(bar_layer);
  this._gridRenderer = this._task_layers.getRenderer(grid_layer);
  this._backgroundRenderer = this._task_layers.getRenderer(background_layer);

};

gantt._create_filter = function(filter_methods){
  if(!(filter_methods instanceof Array)){
    filter_methods = Array.prototype.slice.call(arguments, 0);
  }

  return function(obj){
    var res = true;
    for(var i = 0, len = filter_methods.length; i < len; i++){
      var filter_method = filter_methods[i];
      if(gantt[filter_method]){
        res = res && (gantt[filter_method].apply(gantt, [obj.id, obj]) !== false);
      }
    }

    return res;
  };
};

gantt._is_chart_visible = function(){
  return !!this.config.show_chart;
};

gantt._filter_task = function(id, task){
  var min = null, max = null;
  if(this.config.start_date && this.config.end_date){
    min = this.config.start_date.valueOf();
    max = this.config.end_date.valueOf();

    if(+task.start_date > max || +task.end_date < +min)
      return false;
  }
  return true;
};
gantt._filter_link = function(id, link){
  if(!this.config.show_links){
    return false;
  }
  // TODO enable rendering task even out of chart
  if(!(gantt.isTaskVisible(link.source) && gantt.isTaskVisible(link.target)))
    return false;

  return this.callEvent("onBeforeLinkDisplay", [id, link]);
};
gantt._is_std_background = function(){
  return !this.config.static_background;
};

gantt.getTaskNode = function(id){
  return this._taskRenderer.rendered[id];
};
gantt.getLinkNode = function(id){
  return this._linkRenderer.rendered[id];
};

gantt._get_tasks_data = function(){
  var rows = [];
  var prev = null;
  let currentItem = [0];
  for(var i=0; i < this._order.length; i++){
    var item = this._pull[this._order[i]];
    item.$index = i;
    if(!currentItem[item.$level]) currentItem[item.$level] = 0;
    if(prev){
      if(item.$level > prev.$level){
        currentItem[item.$level]++;
        item.$prev = 0;
      }
      else if(item.$level == prev.$level){
        currentItem[item.$level]++;
        item.$prev = 0;
      }else if(item.$level < prev.$level){
        for(var e=0; e < (prev.$level - item.$level); e++){
          currentItem[item.$level] += currentItem[item.$level + 1 + e];
          currentItem[item.$level + 1 + e] = 0;
        }
        item.$prev = currentItem[item.$level];
      }
    }
    prev = item;
    this.resetProjectDates(item);
    rows.push(item);
  }
  return rows;
};
gantt._get_links_data = function(){
  var links = [];
  for(var i in this._lpull)
    links.push(this._lpull[i]);

  return links;
};
gantt._render_data = function(){
  this.callEvent("onBeforeDataRender", []);

  this._sync_order();
  this._update_layout_sizes();

  if(this.config.static_background)
    this._render_bg_canvas();

  var data = this._get_tasks_data();

  var renderers = this._get_task_renderers();
  for(var i=0; i < renderers.length; i++){
    renderers[i].render_items(data);
  }

  var links = gantt._get_links_data();
  renderers = this._get_link_renderers();
  for(var i=0; i < renderers.length; i++)
    renderers[i].render_items(links);

  this.callEvent("onDataRender", []);
};

gantt._update_layout_sizes = function(){
  var cfg = this._tasks;

  cfg.bar_height = this._get_task_height();

  //task bars layer
  this.$task_data.style.height = Math.max(this.$task.offsetHeight - this.config.scale_height, 0) + 'px';
  this.$task_bg.style.height = "";
  this.$task_bg.style.backgroundImage = "";

  //timeline area layers
  var data_els = this.$task_data.childNodes;
  for(var i= 0, len = data_els.length; i < len; i++){
    var el = data_els[i];
    if(this._is_layer(el) && el.style)
      el.style.width = cfg.full_width + "px";
  }

  //grid area
  if(this._is_grid_visible()){
    var columns = this.getGridColumns();
    var width = 0;
    for (var i = 0; i < columns.length; i++)
      width += columns[i].width;
    this.$grid_data.style.width = Math.max(width-1, 0) + "px";
  }
};

gantt._scale_range_unit = function(){
  var unit = this.config.scale_unit;
  if(this.config.scale_offset_minimal){
    var scales = this._get_scales();
    unit = scales[scales.length - 1].unit;
  }
  return unit;
};

gantt._init_tasks_range = function(){
  var unit = this._scale_range_unit();

  //reset project timing
  this._sync_order();    // HOSEK
  this._get_tasks_data();

  var range = this.getSubtaskDates();
  this._min_date = range.start_date || moment();
  this._max_date = range.end_date || moment();

  if(this.config.start_date && +this.config.start_date < +this._min_date){
    this._min_date = this.date[unit + "_start"]( this.date.Date(this.config.start_date));
  }
  if(this.config.end_date && +this.config.end_date > +this._max_date){
    this._max_date = this.date[unit + "_start"]( this.date.Date(this.config.end_date));
  }
  if(!(this._max_date && this._max_date)){
    this._min_date = gantt.date.Date();
    this._max_date = gantt.date.Date(this._min_date);
  }
  var coef=1; // HOSEK
  if(unit==="day"){coef=3;}
  this._min_date = this.date[unit + "_start"](this._min_date);
  this._min_date = this.date.add(this._min_date,-coef,unit);  // HOSEK

  this._max_date = this.date[unit + "_start"](this._max_date);
  this._max_date = this.date.add(this._max_date,3*coef,unit);  // HOSEK
};

gantt._prepare_scale_html = function(config){
  var cells = [];
  var date = null, content = null, css = null;

  if(config.template || config.date){
    content = config.template || this.date.date_to_str(config.date);
  }


  css = config.css || function(){};
  if(!config.css && this.config.inherit_scale_class){
    css = gantt.templates.scale_cell_class;
  }

  for (var i = 0; i < config.count; i++) {
    date = gantt.date.Date(config.trace_x[i]);
    var value = content.call(this, date),
      width = config.width[i],
      style = "",
      template = "",
      cssclass = "";

    if(width){
      style = "width:"+(width)+"px;";
      cssclass = "gantt_scale_cell" + (i == config.count-1 ? " gantt_last_cell" : "");

      template = css.call(this, date);
      if(template) cssclass += " " + template;
      var cell = "<div class='" + cssclass + "' style='" + style + "'>" + value + "</div>";
      cells.push(cell);
    }else{
      //do not render ignored cells
    }

  }
  return cells.join("");
};
gantt._get_scales = function(){
  var helpers = this._scale_helpers;
  var scales = [helpers.primaryScale()].concat(this.config.subscales);

  helpers.sortScales(scales);
  return scales;
};

gantt._render_tasks_scales = function() {
  this._init_tasks_range();
  this._scroll_resize();
  this._set_sizes();

  var scales_html = "",
    outer_width = 0,
    data_width = 0,
    scale_height = 0;

  if(this._is_chart_visible()){
    var helpers = this._scale_helpers;
    var scales = this._get_scales();
    scale_height = (this.config.scale_height-1);
    var resize = this._get_resize_options();
    var avail_width = resize.x ? Math.max(this.config.autosize_min_width, 0) : this.$task.offsetWidth;

    var cfgs = helpers.prepareConfigs(scales,this.config.min_column_width, avail_width, scale_height);
    var cfg = this._tasks = cfgs[cfgs.length - 1];

    var html = [];

    var css = this.templates.scale_row_class;
    for(var i=0; i < cfgs.length; i++){
      var cssClass = "gantt_scale_line";
      var tplClass = css(cfgs[i]);
      if(tplClass){
        cssClass += " " + tplClass;
      }

      html.push("<div class=\""+cssClass+"\" style=\"height:"+(cfgs[i].height)+"px;line-height:"+(cfgs[i].height)+"px\">" + this._prepare_scale_html(cfgs[i]) + "</div>");
    }

    scales_html = html.join("");
    outer_width = cfg.full_width + this.$scroll_ver.offsetWidth + "px";
    data_width = cfg.full_width + "px";
    scale_height += "px";
  }

  if(this._is_chart_visible()){
    this.$task.style.display = "";
  }else{
    this.$task.style.display = "none";
  }

  this.$task_scale.style.height = scale_height;

  this.$task_data.style.width =
  this.$task_scale.style.width = outer_width;

  this.$task_scale.innerHTML = scales_html;

};

gantt._render_bg_line = function(item){
  var cfg = gantt._tasks;
  var count = cfg.count;
  var row = document.createElement("div");
  if(gantt.config.show_task_cells){
    for (var j = 0; j < count; j++) {
      var width = cfg.width[j],
        cssclass = "";

      if(width > 0){//do not render skipped columns
        var cell = document.createElement("div");
        cell.style.width = (width)+"px";

        cssclass = "gantt_task_cell" + (j == count-1 ? " gantt_last_cell" : "");
        cssTemplate = this.templates.task_cell_class(item, cfg.trace_x[j]);
        if(cssTemplate)
          cssclass += " " + cssTemplate;
        cell.className = cssclass;

        row.appendChild(cell);
      }
    }
  }
  var odd = item.$index%2 !== 0;
  var cssTemplate = gantt.templates.task_row_class(item.start_date, item.end_date, item);
  var css = "gantt_task_row" + (odd ? " odd" : "") + (cssTemplate ? ' '+cssTemplate : '');

  if(this.getState().selected_task == item.id){
    css += " gantt_selected";
  }

  row.className = css;
  row.style.height = (gantt.config.row_height)+"px";
  row.setAttribute(this.config.task_attribute, item.id);
  return row;
};

//defined in an extension
gantt._render_bg_canvas = function(){};


gantt._adjust_scales = function(){
  if(this.config.fit_tasks){
    var old_min = +this._min_date,
      old_max = +this._max_date;
    this._init_tasks_range();
    if(+this._min_date != old_min || +this._max_date != old_max){
      this.render();

      this.callEvent("onScaleAdjusted", []);
      return true;
    }
  }
  return false;
};

//refresh task and related links
gantt.refreshTask = function(taskId, refresh_links){
  gantt._update_parents(gantt.getParent(taskId));
  this.refresher.refreshTask(taskId);
};
gantt._refreshTask = function(taskId){
  var i;
  var renders = this._get_task_renderers();

  var task = this.getTask(taskId);
  if(!task){
    // nothing
  }else
  if(+this._min_date < +task.start_date && +this._max_date > +task.end_date){
    for(i =0; i < renders.length; i++)
      renders[i].render_item(task);

    for(i=0; i < task.$source.length; i++){
      gantt.refreshLink(task.$source[i]);
    }
    for(i=0; i < task.$target.length; i++){
      gantt.refreshLink(task.$target[i]);
    }
  }else{
    this.render();   //  HOSEK
  }
};
gantt.refreshLink = function(linkId){
  this.refresher.refreshLink(linkId);
};
gantt._refreshLink = function(linkId){

  if(this.isLinkExists(linkId)){
    this._render_link(linkId);
  }else{
    var renders = this._get_link_renderers();
    for(var i =0; i < renders.length; i++)
      renders[i].remove_item(linkId);
  }
};

gantt._combine_item_class = function(basic, template, itemId){
  var css = [basic];
  if(template)
    css.push(template);

  var state = gantt.getState();

  var task = this.getTask(itemId);

  if(task.type){css.push("gantt_"+task.type+"-type");}

  if(this._is_flex_task(task))
    css.push("gantt_dependent_task");

  if(this.config.select_task && itemId == state.selected_task)
    css.push("gantt_selected");

  if(itemId == state.drag_id){
    css.push("gantt_drag_" + state.drag_mode);
    if(state.touch_drag){
      css.push("gantt_touch_" + state.drag_mode);
    }
  }
  var links = gantt._get_link_state();
  if(links.link_source_id == itemId)
    css.push("gantt_link_source");

  if(links.link_target_id == itemId)
    css.push("gantt_link_target");

  if(this.config.highlight_critical_path && this.isCriticalTask){
    if(this.isCriticalTask(task))
      css.push("gantt_critical_task");
  }

  if(links.link_landing_area &&
    (links.link_target_id && links.link_source_id) &&
    (links.link_target_id != links.link_source_id)){

    var from_id = links.link_source_id;
    var from_start = links.link_source_start;
    var to_start = links.link_target_start;

    var allowDrag = gantt.isLinkAllowed(from_id, itemId, from_start, to_start);

    var dragClass = "";
    if(allowDrag){
      if(to_start)
        dragClass = "link_start_allow";
      else
        dragClass = "link_finish_allow";
    }else{
      if(to_start)
        dragClass = "link_start_deny";
      else
        dragClass = "link_finish_deny";
    }
    css.push(dragClass);
  }
  return css.join(" ");
};

gantt._render_pair = function(parent, css, task, content){
  var state = gantt.getState();

  if (+task.start_date >= +state.min_date)
    parent.appendChild(content(css + " task_left"));

  if(+task.end_date <= +state.max_date) {
    parent.appendChild(content(css + " task_right"));
  }
};

gantt._get_task_height = function(){
  // height of the bar item
  var height = this.config.task_height;
  if(height == "full")
    height = this.config.row_height - 5;
  //item height cannot be bigger than row height
  height = Math.min(height, this.config.row_height);
  return Math.max(height, 0);
};

gantt._get_milestone_width = function(){
  return this._get_task_height();
};
gantt._get_visible_milestone_width = function(){
  var origWidth = gantt._get_task_height();//m-s have square shape
  return Math.sqrt(2*origWidth*origWidth);
};

// TODO: remove reduntant methods for task positioning
gantt.getTaskPosition = function(task, start_date, end_date){
  var x = this.posFromDate(start_date || task.start_date);
  var x2 = this.posFromDate(end_date || task.end_date);
  x2 = Math.max(x, x2);
  var y = this.getTaskTop(task.id);
  var height = this.config.task_height;
  return {
    left:x,
    top:y,
    height : height,
    width: Math.max((x2 - x), 0)
  };
};

gantt._get_task_width = function(task, start, end ){
  return Math.round(this._get_task_pos(task, false).x - this._get_task_pos(task, true).x);
};

gantt._is_readonly = function(item){
  if(item && item[this.config.editable_property]){
    return false;
  }else{
    return (item && item[this.config.readonly_property]) || this.config.readonly || this.config["readonly_"+gantt._get_safe_type(item.type)];
  }
};
gantt._task_default_render = function(task){
  var pos = this._get_task_pos(task);

  var cfg = this.config;
  var height = this._get_task_height();
  var type = this._get_safe_type(task.type);
  var controls = cfg["controls_"+type] || {};

  var padd = Math.floor((this.config.row_height - height)/2);
  if(type == cfg.types.milestone && cfg.link_line_width > 1){
    //little adjust milestone position, so horisontal corners would match link arrow when thickness of link line is more than 1px
    padd += 1;
  }

  var div = document.createElement("div");
  var width = gantt._get_task_width(task);

  div.setAttribute(this.config.task_attribute, task.id);

  if(cfg.show_progress && (controls.show_progress || controls.progress)){
    var progress = this._render_task_progress(task,div, width);

    const appSettings = ysy.settings.appSettings;
    const showTasksSpentTimeRatio = ysy.settings.showTasksSpentTimeRatio;
    const isLeaf = !gantt._branches[task.id];

    const nonEditableDoneRatio = (
      this._is_readonly(task) ||
      !controls.progress ||
      showTasksSpentTimeRatio ||
      appSettings.useStatusForIssueDoneRatio ||
      (appSettings.issueDoneRatioDerived && !isLeaf)
    )

    if(!nonEditableDoneRatio){
      this._render_task_progress_drag(div,progress);
    }
  }

  //use separate div to display content above progress bar
  var content = gantt._render_task_content(task, width);
  if(task.textColor){
    content.style.color = task.textColor;
  }
  div.appendChild(content);

  var css = this._combine_item_class("gantt_task_line",
    this.templates.task_class(task.start_date, task.end_date, task),
    task.id);
  if(task.color || task.progressColor || task.textColor){
    css += " gantt_task_inline_color";
  }
  div.className = css;

  var styles = [
    "left:" + pos.x + "px",
    "top:" + (padd + pos.y) + 'px',
    "height:" + height + 'px',
    "line-height:" + height + 'px',
    "width:" + width + 'px'
  ];
  if(task.color){
    styles.push("background-color:" + task.color);
  }
  if(task.textColor){
    styles.push("color:" + task.textColor);
  }

  div.style.cssText = styles.join(";");
  var side = this._render_leftside_content(task);
  if(side) div.appendChild(side);

  side = this._render_rightside_content(task);
  if(side) div.appendChild(side);

  if(!this._is_readonly(task)){
    if(cfg.drag_resize && !this._is_flex_task(task) && controls.resize){
      gantt._render_pair(div, "gantt_task_drag", task, function(css){
        var el = document.createElement("div");
        el.className = css;
        return el;
      });
    }
    if(cfg.drag_links && this.config.show_links && controls.links){
      gantt._render_pair(div, "gantt_link_control", task, function(css){
        var outer = document.createElement("div");
        outer.className = css;
        outer.style.cssText = [
          "height:" + height + 'px',
          "line-height:" + height + 'px'
        ].join(";");
        var inner = document.createElement("div");
        inner.className = "gantt_link_point";
        outer.appendChild(inner);
        return outer;
      });
    }
  }
  return div;
};

gantt._render_task_element = function(task){
  var painters = this.config.type_renderers;
  var renderer = painters[this._get_safe_type(task.type)],
    defaultRenderer = this._task_default_render;
  if(!renderer){
    renderer = defaultRenderer;
  }
  return renderer.call(this, task, dhtmlx.bind(defaultRenderer, this));
};

gantt._render_side_content = function(task, template, cssClass){
  if(!template) return null;

  var text = template(task.start_date, task.end_date, task);
  if(!text) return null;
  var content = document.createElement("div");
  content.className = "gantt_side_content " + cssClass;
  content.innerHTML = text;
  return content;
};

gantt._render_leftside_content = function(task){
  var css = "gantt_left " + gantt._get_link_crossing_css(true, task);
  return gantt._render_side_content(task, this.templates.leftside_text, css);
};
gantt._render_rightside_content = function(task){
  var css = "gantt_right " + gantt._get_link_crossing_css(false, task);
  return gantt._render_side_content(task, this.templates.rightside_text, css);
};

gantt._get_conditions = function(leftside){
  if(leftside){
    return {
      $source : [
        gantt.config.links.start_to_start
      ],
      $target : [
        gantt.config.links.start_to_start,
        gantt.config.links.finish_to_start
      ]
    };
  }else{
    return {
      $source : [
        gantt.config.links.finish_to_start,
        gantt.config.links.finish_to_finish
      ],
      $target : [
        gantt.config.links.finish_to_finish
      ]
    };
  }
};

gantt._get_link_crossing_css = function(left, task){
  var cond = gantt._get_conditions(left);

  for(var i in cond){
    var links = task[i];
    for(var ln =0; ln < links.length; ln++){
      var link = gantt.getLink(links[ln]);

      for(var tp =0; tp < cond[i].length; tp++){
        if(link.type == cond[i][tp]){
          return "gantt_link_crossing";
        }
      }
    }
  }
  return "";
};

gantt._render_task_content = function(task, width){
  var content = document.createElement("div");
  if(this._get_safe_type(task.type) != this.config.types.milestone)
    content.innerHTML = this.templates.task_text(task.start_date, task.end_date, task);
  content.className = "gantt_task_content";
  return content;
};
gantt._render_task_progress = function(task, element, maxWidth){
  var done = task.progress*1 || 0;

  maxWidth = Math.max(maxWidth - 2, 0);//2px for borders
  var pr = document.createElement("div");
  var width = Math.round(maxWidth*done);

  width = Math.min(maxWidth, width);
  if(task.progressColor){
    pr.style.backgroundColor = task.progressColor;
    pr.style.opacity = 1;
  }
  pr.style.width = width + 'px';
  pr.className = "gantt_task_progress";
  pr.innerHTML = this.templates.progress_text(task.start_date, task.end_date, task);
  element.appendChild(pr);
  return width;
};
gantt._render_task_progress_drag = function(element,width){
  var drag = document.createElement("div");
  drag.style.left = width + 'px';
  drag.className = "gantt_task_progress_drag";
  //pr.appendChild(drag);
  element.appendChild(drag);
}
gantt._get_line = function(step) {
  var steps = {
    "second": 1,
    "minute": 60,
    "hour": 60*60,
    "day": 60*60*24,
    "week": 60*60*24*7,
    "month": 60*60*24*30,
    "year": 60*60*24*365
  };
  return steps[step] || 0;
};

gantt.dateFromPos = function(x){
  return gantt.dateFromPos2(x);
  var scale = this._tasks;
  if(x < 0 || x > scale.full_width || !scale.full_width){
    return null;
  }

  var ind = this._findBinary(this._tasks.left, x);
  var summ = this._tasks.left[ind];
  var col_width = scale.width[ind] || scale.col_width;
  var part = 0;
  if(col_width)
    part = (x - summ)/col_width;

  var unit = 0;
  if(part){
    unit =  gantt._get_coll_duration(scale, scale.trace_x[ind]);
  }
  var date = gantt.date.Date(scale.trace_x[ind].valueOf() + Math.round(part*unit));
  return date;
};

gantt.posFromDate = function(date){
  var ind = gantt._day_index_by_date(date);
  dhtmlx.assert(ind >= 0, "Invalid day index");

  var wholeCells = Math.floor(ind);
  var partCell = ind % 1;

  var pos = gantt._tasks.left[Math.min(wholeCells, gantt._tasks.width.length - 1)];
  if(wholeCells == gantt._tasks.width.length)
    pos += gantt._tasks.width[gantt._tasks.width.length - 1];

  if(partCell){
    if(wholeCells < gantt._tasks.width.length){
      pos += gantt._tasks.width[wholeCells]*(partCell % 1);
    }else{
      pos += 1;
    }

  }
  return pos;
};
gantt.posFromDateCached = function(date){
  if (typeof date !== "string") {
    var momentDate = date;
    date = date.toISOString();
  }
  var pos = gantt._tasks.date_cache[date];
  if(!pos){
    pos = gantt.posFromDate(momentDate || date);
    gantt._tasks.date_cache[date] = pos;
  }
  return pos;
};

gantt._day_index_by_date = function(date){
  var tdate=gantt.date.Date(date);// HOSEK
  if(date._isEndDate){tdate=moment(tdate).add(1,"days");}
  var pos = tdate.valueOf();
  var days = gantt._tasks.trace_x,
    ignores = gantt._tasks.ignore_x || {};

  if(pos <= this._min_date)
    return 0;

  if(pos >= this._max_date)
    return days.length;

  var day_ind = gantt._findBinary(days, pos);
  var day = +gantt._tasks.trace_x[day_ind];
  while(ignores[day]){
    day = gantt._tasks.trace_x[++day_ind];
  }

  if(!day) return 0;

  return day_ind + ((tdate - days[day_ind]) / gantt._get_coll_duration(gantt._tasks, days[day_ind]));


};
gantt._findBinary = function(array, target) {
  // modified binary search, target value not exactly match array elements, looking for closest one

  var low = 0, high = array.length - 1, i, item, prev;
  while (low <= high) {

    i = Math.floor((low + high) / 2);
    item = +array[i];
    prev = +array[i - 1];
    if (item < target){
      low = i + 1; continue;
    }
    if (item > target){
      if(!(!isNaN(prev) && prev < target)) {
        high = i - 1; continue;
      }else{
        // if target is between 'i' and 'i-1' return 'i - 1'
        return i - 1;
      }

    }

    return i;
  }
  return array.length - 1;
};
gantt._get_coll_duration = function(scale, date){
  return gantt.date.add(date, scale.step, scale.unit) -  date;
};

gantt._get_x_pos = function(task, to_start){
  to_start = to_start !== false;
  var x = gantt.posFromDate(to_start ? task.start_date : task.end_date);
};

gantt.getTaskTop = function(task_id){
  return this._y_from_ind(this._get_visible_order(task_id));
};

gantt._get_task_coord = function(task, to_start, x_correction){
  to_start = to_start !== false;
  x_correction = x_correction || 0;
  var isMilestone = (this._get_safe_type(task.type) == this.config.types.milestone);

  var date = null;

  if(to_start && !isMilestone){
    date = (task.start_date || this._default_task_date(task));
  }else{
    date = (task.end_date || this.calculateEndDate(this._default_task_date(task)));
  }
  var x = this.posFromDate(date),
    y = this.getTaskTop(task.id);

  if(isMilestone){
    if(to_start){
      x -= x_correction;
    }else{
      x += x_correction;
    }
  }
  return {x:x, y:y};
};
gantt._get_task_pos = function(task, to_start){
  to_start = to_start !== false;
  var mstoneCorrection = gantt._get_milestone_width()/2;
  return this._get_task_coord(task, to_start, mstoneCorrection);
};

gantt._get_task_visible_pos = function(task, to_start){
  to_start = to_start !== false;
  var mstoneCorrection = gantt._get_visible_milestone_width()/2;
  return this._get_task_coord(task, to_start, mstoneCorrection);
};

gantt._correct_shift=function(start, back){
  return start-=((gantt.date.Date(gantt._min_date)).getTimezoneOffset()-(gantt.date.Date(start)).getTimezoneOffset())*60000*(back?-1:1);
};

gantt._get_mouse_pos = function(ev){
  if (ev.pageX || ev.pageY) {
    var pos = {x: ev.pageX, y: ev.pageY};
  } else {
    var d = _isIE ? document.documentElement : document.body;
    pos = {
      x:ev.clientX + d.scrollLeft - d.clientLeft,
      y:ev.clientY + d.scrollTop - d.clientTop
    };
  }

  var box = gantt._get_position(gantt.$task_data);
  pos.x = pos.x - box.x + gantt.$task_data.scrollLeft;
  pos.y = pos.y - box.y + gantt.$task_data.scrollTop;
  return pos;
};

gantt._is_layer = function(dom_element){
  return (dom_element && dom_element.hasAttribute && dom_element.hasAttribute(this.config.layer_attribute));
};
//helper for rendering bars and links
gantt._task_renderer = function(layer){
  //hash of dom elements is needed to redraw single bar/link
  if(typeof layer !== "object"){
    var id=layer;
  }else{
    var id = layer.id;
    var render_one = layer.renderer;
    var node = layer.container;
    var filter = layer.filter;
  }
  if(!this._task_area_pulls)
    this._task_area_pulls = {};

  if(!this._task_area_renderers)
    this._task_area_renderers = {};

  if(this._task_area_renderers[id])
    return this._task_area_renderers[id];

  if(!render_one)
    dhtmlx.assert(false, "Invalid renderer call");

  if(node)
    node.setAttribute(this.config.layer_attribute, true);

  this._task_area_renderers[id] = $.extend({
    render_item : function(item, container){
      var pull = gantt._task_area_pulls[id];
      container = container || node;

      if(filter){
        if(!filter(item)){
          ysy.log.debug("_task_area_renderers() filtered id="+item.id,"link_render");
          this.remove_item(item.id);
          return;
        }
      }
      var dom = render_one.call(gantt, item, pull[item.id]);
      if(!dom) return;
      if(pull[item.id]){
        this.replace_item(item.id, dom);
      }else{
        pull[item.id] = dom;
        container.appendChild(dom);
      }
    },
    clear : function(container){
      this.rendered = gantt._task_area_pulls[id] = {};
      container = container || node;
      if(container)
        container.innerHTML = "";
    },
    render_items : function(items, container){
      container = container || node;
      this.clear(container);
      var buffer = document.createDocumentFragment();
      for(var i= 0, vis = items.length; i < vis; i++){
        this.render_item(items[i], buffer);
      }
      container.appendChild(buffer);
    },
    replace_item: function(item_id, newNode){
      var item = this.rendered[item_id];
      if(item && item.parentNode){
        item.parentNode.replaceChild(newNode, item);
      }
      this.rendered[item_id] = newNode;
    },
    remove_item:function(item_id){
      var item = this.rendered[item_id];
      if(item && item.parentNode){
        item.parentNode.removeChild(item);
      }
      delete this.rendered[item_id];
    },
    change_id: function(oldid, newid) {
        this.rendered[newid] = this.rendered[oldid];
        delete this.rendered[oldid];
    },
    rendered : this._task_area_pulls[id] || {},
    node: node,
    unload : function(){
      this.clear();
      delete gantt._task_area_renderers[id];
      delete gantt._task_area_pulls[id];
    }
  },layer);

  return this._task_area_renderers[id];
};

gantt._clear_renderers = function(){
  for(var i in this._task_area_renderers){
    this._task_renderer(i).unload();
  }
};

gantt.attachEvent("onGanttReady", function(){
  gantt._task_layers.add();
  gantt._link_layers.add();
});

gantt._layers = {
  prepareConfig: function(config){
    if(typeof config == "function"){
      config = {renderer: config};
    }

    var id = config.id = dhtmlx.uid();

    if(!config.container)
      config.container = document.createElement("div");

    return config;
  },
  create: function(get_container, rel_root){
    return {
      tempCollection:[],
      renderers:{},
      container: get_container,
      getRenderers: function(){
        var res = [];
        for (var i in this.renderers){
          res.push(this.renderers[i]);
        }
        return res;
      },
      getRenderer: function(id){
        return this.renderers[id];
      },
      add: function(layer){
        if(layer)
          this.tempCollection.push(layer);
      },
      // TODO put process to all layer creators
      process: function(){
        if(!this.container()) return;
        var container = this.container();
        var pending = this.tempCollection;
        for(var i =0; i < pending.length; i++){
          var layer = pending[i];
          var node = layer.container,
              id = layer.id,
              topmost = layer.topmost;
          if(!node.parentNode){
            //insert on top or below the tasks
            if(topmost){
              container.appendChild(node);
            }else{
              var rel = rel_root ? rel_root() : container.firstChild;
              if(rel)
                container.insertBefore(node, rel);
              else
                container.appendChild(node);
            }
          }
          this.renderers[id] = gantt._task_renderer(layer);
          this.tempCollection.splice(i,1);
          i--;
        }
      },
      remove: function(id){
        this.renderers[id].unload();
        delete this.renderers[id];
      },
      clear: function(){
        for(var i in this.renderers){
          this.renderers[i].unload();
        }
        this.renderers = {};
      }
    };
  }
};

gantt._create_filter = function(filter_methods){
  if(!(filter_methods instanceof Array)){
    filter_methods = Array.prototype.slice.call(arguments, 0);
  }

  return function(obj){
    var res = true;
    for(var i = 0, len = filter_methods.length; i < len; i++){
      var filter_method = filter_methods[i];
      if(gantt[filter_method]){
        res = res && (gantt[filter_method].call(gantt, obj.id, obj) !== false);
      }
    }

    return res;
  };
};

gantt._add_generic_layer = function(layersManager, filters){
  return function(config){
    if(config.filter === undefined){
      config.filter = gantt._create_filter(filters);
    }
    config = gantt._layers.prepareConfig(config);
    layersManager.add(config);
    return config.id;
  };
};

gantt._task_layers = gantt._layers.create(function(){return gantt.$task_data; }, function(){return gantt.$task_links;});

gantt._link_layers = gantt._layers.create(function(){return gantt.$task_data; });

gantt.addTaskLayer = gantt._add_generic_layer(gantt._task_layers, ['_filter_task', '_is_chart_visible']);

gantt.removeTaskLayer = function(id){
  gantt._task_layers.remove(id);
};

gantt.addLinkLayer = gantt._add_generic_layer(gantt._link_layers, ['_filter_link', '_is_chart_visible']);
gantt.removeLinkLayer = function(id){
  gantt._link_layers.remove(id);
};

gantt._get_task_renderers = function(){
  return this._task_layers.getRenderers();
};
gantt._get_link_renderers = function(){
  return this._link_layers.getRenderers();
};

gantt._pull = {};
gantt._branches = {};
gantt._order = [];
gantt._lpull = {};

gantt.load = function(url, type, callback){
  this._load_url = url;
  dhtmlx.assert(arguments.length, "Invalid load arguments");
  this.callEvent("onLoadStart", []);
  var tp = 'json', cl = null;
  if(arguments.length >= 3){
    tp = type;
    cl = callback;
  }else{
    if(typeof arguments[1] == "string")
      tp = arguments[1];
    else if(typeof arguments[1] == "function")
      cl = arguments[1];
  }

  this._load_type = tp;

  dhx4.ajax.get(url, dhtmlx.bind(function(l) {
    this.on_load(l, tp);
    this.callEvent("onLoadEnd", []);
    if(typeof cl == "function")
      cl.call(this);
  }, this));
};
gantt.parse = function(data, type) {
  this.on_load({xmlDoc: {responseText: data}}, type);
};

gantt.serialize = function(type){
  type = type || "json";
  return this[type].serialize();
};

gantt.on_load = function(resp, type){
  this.callEvent("onBeforeParse", []);
  if(!type)
    type = "json";
  dhtmlx.assert(this[type], "Invalid data type:'" + type + "'");

  var raw = resp.xmlDoc.responseText;

  var data = this[type].parse(raw, resp);
  this._process_loading(data);
};

gantt._process_loading = function(data){
  if(data.collections)
    this._load_collections(data.collections);

  var tasks = data.data;
  var task;
  for (var i = 0; i < tasks.length; i++) {
    task = tasks[i];
    this._init_task(task);
    if (!this.callEvent("onTaskLoading", [task])) continue;
    this._pull[task.id] = task;
  }

  for (var i in this._pull){
    task = this._pull[i];
    this.setParent(task, this.getParent(task) || this.config.root_id);
  }

    // calculating $level for each item
  for (var i in this._pull){
    task = this._pull[i];
    this._add_branch(task, true);
    task.$level = this.calculateTaskLevel(task);
  }
  this._sync_order();
  this._init_links(data.links || (data.collections ? data.collections.links : []));
  this.callEvent("onParse", []);
  this.render();
  if(this.config.initial_scroll){
    var id = (this._order[0] || this.config.root_id);
    if(id)
      this.showTask(id);
  }
};

gantt._init_links = function(links){
  if (links)
    for(var i=0; i < links.length; i++){
      if(links[i]){
          var link = this._init_link(links[i]);
          this._lpull[link.id] = link;
      }
    }
    this._sync_links();
};

gantt._load_collections = function(collections){
  var collections_loaded = false;
  for (var key in collections) {
    if (collections.hasOwnProperty(key)) {
      collections_loaded = true;
      var collection = collections[key];
      var arr = this.serverList[key];
      if (!arr) continue;
      arr.splice(0, arr.length); //clear old options
      for (var j = 0; j < collection.length; j++) {
        var option = collection[j];
        var obj =  dhtmlx.copy(option);
        obj.key = obj.value;// resulting option object

        for (var option_key in option) {
          if (option.hasOwnProperty(option_key)) {
            if (option_key == "value" || option_key == "label")
              continue;
            obj[option_key] = option[option_key]; // obj['value'] = option['value']
          }
        }
        arr.push(obj);
      }
    }
  }
  if (collections_loaded)
    this.callEvent("onOptionsLoad", []);
};

gantt._sync_order = function(silent) {
  this._order = [];
  this._sync_order_item({parent:this.config.root_id, $open:true, $ignore:true, id:this.config.root_id});
  //hide bottom row
  //this._order.push("empty");

  if(!silent){
    this._scroll_resize();
    this._set_sizes();
  }
};
gantt.attachEvent("onBeforeTaskDisplay", function(id, task){
  return !task.$ignore;
});
gantt._sync_order_item = function(item) {
  if(!item){
    ysy.log.debug("error: no item");
  }
  if (!item.id
      || this._filter_task(item.id, item)
      && this.callEvent("onBeforeTaskDisplay", [item.id, item])) {
    if (item.id) { //do not trigger event for virtual root
      this._order.push(item.id);
    }
    if (item.$open) {
      var children = this.getChildren(item.id);
      if (children)
        for (var i = 0; i < children.length; i++)
          this._sync_order_item(this._pull[children[i]]);
    }
  }
};

gantt._get_visible_order = function(id){
  dhtmlx.assert(id, "Invalid argument");
  var ord = this._order;
  for(var i= 0, count = ord.length; i < count; i++)
    if(ord[i] == id) return i;

  return -1;
};

gantt.eachTask = function(code, parent, master){
  parent = parent || this.config.root_id;
  master = master || this;
  var branch = this.getChildren(parent);
  var parentObj = parent ? this.getTask(parent) : null;

  if (branch)
    for (var i=0; i<branch.length; i++){
      var item = this._pull[branch[i]];
      if (parentObj && parentObj.hasOwnProperty('$rendered_type') && item.$rendered_type === 'milestone' && parentObj.$rendered_type === 'project') continue;
      code.call(master, item);
      if (this.hasChild(item.id))
        this.eachTask(code, item.id, master);
    }
};

gantt.json = {
  parse : function(data){
    dhtmlx.assert(data, "Invalid data");

    if (typeof data == "string") {
      if(window.JSON)
        data = JSON.parse(data);
      else{
        gantt._temp = eval("(" + data + ")");
        data = gantt._temp || {};
        gantt._temp = null;
      }
    }

    if (data.dhx_security)
      dhtmlx.security_key = data.dhx_security;
    return data;
  },
  _copyLink:function(obj){
    var copy = {};
    for (var key in obj)
      copy[key] = obj[key];
    return copy;
  },
  _copyObject:function(obj){
    var copy = {};
    for (var key in obj){
      if (key.charAt(0) == "$")
        continue;
      copy[key] = obj[key];

      if(copy[key] instanceof Date){
        copy[key] = gantt.templates.xml_format(copy[key]);
      }
    }
    return copy;
  },
  serialize:function(){
    var tasks = [];
    var links = [];

    gantt.eachTask(function(obj){
      gantt.resetProjectDates(obj);
      tasks.push(this._copyObject(obj));
    }, gantt.config.root_id, this);
    for (var key in gantt._lpull)
      links.push(this._copyLink(gantt._lpull[key]));

    return {
      data : tasks,
      links: links
    };
  }
};

gantt.xml = {
  _xmlNodeToJSON:function(node, attrs_only){
    var t = {};
    for (var i = 0; i < node.attributes.length; i++)
      t[node.attributes[i].name] = node.attributes[i].value;

    if (!attrs_only){
      for (var i = 0; i < node.childNodes.length; i++) {
        var child = node.childNodes[i];
        if (child.nodeType == 1)
          t[child.tagName] = child.firstChild ? child.firstChild.nodeValue : "";
      }

      if (!t.text) t.text = node.firstChild ? node.firstChild.nodeValue : "";
    }

    return t;
  },
  _getCollections:function(loader){
    var collection = {};
    var opts =   dhx4.ajax.xpath("//coll_options", loader);
    for (var i = 0; i < opts.length; i++) {
      var bind = opts[i].getAttribute("for");
      var arr = collection[bind] = [];
      var itms =  dhx4.ajax.xpath(".//item", opts[i]);
      for (var j = 0; j < itms.length; j++) {
        var itm = itms[j];
        var attrs = itm.attributes;
        var obj = { key: itms[j].getAttribute("value"), label: itms[j].getAttribute("label")};
        for (var k = 0; k < attrs.length; k++) {
          var attr = attrs[k];
          if (attr.nodeName == "value" || attr.nodeName == "label")
            continue;
          obj[attr.nodeName] = attr.nodeValue;
        }
        arr.push(obj);
      }
    }
    return collection;
  },
  _getXML:function(text, loader, toptag){
    toptag = toptag || "data";
    if (!loader.getXMLTopNode){
      loader = dhx4.ajax.parse(loader);
    }

    var xml = dhx4.ajax.xmltop(toptag, loader.xmlDoc);
    if (xml.tagName != toptag) throw "Invalid XML data";

    var skey = xml.getAttribute("dhx_security");
    if (skey)
      dhtmlx.security_key = skey;

    return xml;
  },
  parse:function(text, loader){
    loader = this._getXML(text, loader);
    var data = { };

    var evs = data.data = [];
    var xml = dhx4.ajax.xpath("//task", loader);

    for (var i = 0; i < xml.length; i++)
      evs[i] = this._xmlNodeToJSON(xml[i]);

    data.collections = this._getCollections(loader);
    return data;
  },
  _copyLink:function(obj){
    return "<item id='"+obj.id+"' source='"+obj.source+"' target='"+obj.target+"' type='"+obj.type+"' />";
  },
  _copyObject:function(obj){
    return "<task id='"+obj.id+"' parent='"+(obj.parent||"")+"' start_date='"+obj.start_date+"' duration='"+obj.duration+"' open='"+(!!obj.open)+"' progress='"+obj.progress+"' end_date='"+obj.end_date+"'><![CDATA["+obj.text+"]]></task>";
  },
  serialize:function(){
    var tasks = [];
    var links = [];

    var json = gantt.json.serialize();
    for(var i= 0, len = json.data.length; i < len; i++){
      tasks.push(this._copyObject(json.data[i]));
    }
    for(var i= 0, len = json.links.length; i < len; i++){
      links.push(this._copyLink(json.links[i]));
    }
    return "<data>"+tasks.join("")+"<coll_options for='links'>"+links.join("")+"</coll_options></data>";
  }
};

gantt.oldxml = {
  parse:function(text, loader){
    loader = gantt.xml._getXML(text, loader, "projects");
    var data = { collections:{ links:[] } };

    var evs = data.data = [];
    var xml = dhx4.ajax.xpath("//task", loader);

    for (var i = 0; i < xml.length; i++){
      evs[i] = gantt.xml._xmlNodeToJSON(xml[i]);
      var parent = xml[i].parentNode;

      if (parent.tagName == "project")
        evs[i].parent = "project-"+parent.getAttribute("id");
      else
        evs[i].parent = parent.parentNode.getAttribute("id");
    }

    xml = dhx4.ajax.xpath("//project", loader);
    for (var i = 0; i < xml.length; i++){
      var ev = gantt.xml._xmlNodeToJSON(xml[i], true);
      ev.id ="project-"+ev.id;
      evs.push(ev);
    }

    for (var i=0; i<evs.length; i++){
      var ev = evs[i];
      ev.start_date = ev.startdate || ev.est;
      ev.end_date = ev.enddate;
      ev.text = ev.name;
      ev.duration = ev.duration / 8;
      ev.open = 1;
      if (!ev.duration && !ev.end_date) ev.duration = 1;
      if (ev.predecessortasks)
        data.collections.links.push({ target:ev.id, source:ev.predecessortasks, type:gantt.config.links.finish_to_start });
    }

    return data;
  },
  serialize:function(){
    dhtmlx.message("Serialization to 'old XML' is not implemented");
  }
};

gantt.serverList = function(name, array) {
  if (array) {
    this.serverList[name] = array.slice(0);
  }else if(!this.serverList[name]){
    this.serverList[name] = [];
  }
  return this.serverList[name];
};

gantt.getTask = function(id) {
  dhtmlx.assert(id, "Invalid argument for gantt.getTask");
  dhtmlx.assert(this._pull[id], "Task not found id=" + id);
  return this._pull[id];
};
gantt.getTaskByTime = function(from, to){
  var p = this._pull,
    res = [],
    pos = 0,
    taken = 0;

  if(!(from || to)){
        for (var t in p) res.push(p[t]);
  }else{
    from = +from || -Infinity;
    to = +to || Infinity;
    for (var t in p){
      var task = p[t];
      if (+task.start_date < to && +task.end_date > from)
        res.push(task);
    }
  }

  return res;
};

gantt.isTaskExists = function(id) {
  return dhtmlx.defined(this._pull[id]);
};

gantt.isTaskVisible = function(id){
  if(!this._pull[id])
    return false;

  if(!(+this._pull[id].start_date < +this._max_date && +this._pull[id].end_date > +this._min_date))
    return false;

  for(var i= 0, count = this._order.length; i < count; i++)
    if(this._order[i] == id) return true;
  return false;
};

gantt.updateTask = function (id, item) {
  if (!dhtmlx.defined(item))
    item = this.getTask(id);
  if (this.callEvent("onBeforeTaskUpdate", [id, item]) === false)
    return false;

  this._pull[item.id] = item;
  if (!this._is_parent_sync(item)) {
    this._resync_parent(item);
  }
  item.widget.update(item);
  this.refreshTask(item.id);
  this.callEvent("onAfterTaskUpdate", [id, item]);
  this._sync_order();
  this._adjust_scales();
};
gantt._add_branch = function(task, silent){
  var pid = this.getParent(task);
  if (!this.hasChild(pid))
    this._branches[pid] = [];
  var branch = this.getChildren(pid);
  var added_already = false;
  for(var i = 0, length = branch.length; i < length; i++){
    if(branch[i] == task.id){
      added_already = true;
      break;
    }
  }
  if(!added_already)
    branch.push(task.id);

  this._sync_parent(task);
  if(!silent){
    this._sync_order(silent);
  }
};

gantt._move_branch = function(task, old_parent, new_parent){
  this.setParent(task, new_parent);
  this._sync_parent(task);
  this._replace_branch_child(old_parent, task.id);
  if(this.isTaskExists(new_parent) || new_parent == this.config.root_id){

    this._add_branch(task);
  }else{
    delete this._branches[task.id];
  }
  task.$level =  this.calculateTaskLevel(task);
  //this._sync_order();    // HOSEK
};
gantt._resync_parent = function(task){
  this._move_branch(task, task.$rendered_parent, this.getParent(task));
};
gantt._sync_parent = function(task){
  task.$rendered_parent = this.getParent(task);
};
gantt._is_parent_sync = function(task){
  return (task.$rendered_parent == this.getParent(task));
};

gantt._replace_branch_child = function(node, old_id, new_id){
  var branch;
  ysy.log.debug("_replace_branch_child","sort");

  branch = this.getChildren(node);
  if (branch){
    var newbranch = [];
    for (var i=0; i<branch.length; i++){
      if (branch[i] != old_id)
        newbranch.push(branch[i]);
      else if (new_id)
        newbranch.push(new_id);
    }
    ysy.log.debug("new Branch="+JSON.stringify(newbranch),"sort");
    this._branches[node] = newbranch;
  }
};

gantt.addTask = function(item, parent) {
  if (!dhtmlx.defined(parent)) parent = this.getParent(item) || 0;
  if (!this.isTaskExists(parent)) parent = 0;
  this.setParent(item, parent);
  item = this._init_task(item);

  if (this.callEvent("onBeforeTaskAdd", [item.id, item])===false) return false;

  this._pull[item.id] = item;

  this._add_branch(item);

  this.refreshData();
  this._adjust_scales();
  this.callEvent("onAfterTaskAdd", [item.id, item]);
  return item.id;
};

gantt.addTaskFaster = function (item, parent) {
  ysy.log.debug("addTaskNoDraw()","add_task");
  if (!dhtmlx.defined(parent)) parent = this.getParent(item) || 0;
  if (!this.isTaskExists(parent)) parent = 0;
  this.setParent(item, parent);
  item = this._init_task(item);

  this._pull[item.id] = item;

  this._add_branch(item,true);

  this.refreshData();
  if(+this._min_date > +item.start_date || +this._max_date < +item.end_date){
    this.render();
  }

  return item.id;
};

gantt._default_task_date = function(item, parent_id){
  var parent = (parent_id && parent_id != this.config.root_id) ? this.getTask(parent_id) : false,
    startDate = '';
  if(parent){
    startDate = parent.start_date;
  }else{
    var first = this._order[0];
    startDate = first ? this.getTask(first).start_date : (this.config.start_date || this.getState().min_date);
  }
  return gantt.date.Date(startDate);
};

gantt._set_default_task_timing = function(task){
  task.start_date = task.start_date || gantt._default_task_date(task, this.getParent(task));
  task.duration = task.duration || this.config.duration_step;
  task.end_date = task.end_date || this.calculateEndDate(task.start_date, task.duration);
};

gantt.deleteTask = function(id) {
  return this._deleteTask(id);
};

//TODO: do something with overcomplicated dataprocessor logic
gantt._getChildLinks = function(id){
  var item = this.getTask(id);
  if(!item){
    return [];
  }

  var links = item.$source.concat(item.$target);

  var branches = this.getChildren(item.id);
  for (var i = 0; i < branches.length; i++) {
    links = links.concat(this._getChildLinks(branches[i]));
  }

  var res = {};
  for(var i=0; i < links.length; i++){
    res[links[i]] = true;
  }
  links = [];
  for(var i in res){
    links.push(i);
  }

  return links;
};
gantt._getTaskTree = function(id){
  var item = this.getTask(id);
  if(!item){
    return [];
  }

  var items = [];
  var branches = this.getChildren(item.id);
  for (var i = 0; i < branches.length; i++) {
    items.push(branches[i]);
    items = items.concat(this._getTaskTree(branches[i]));
  }
  return items;
};
gantt._deleteRelatedLinks = function(links, silent){
  var use_dp = (this._dp && !silent);
  var prev_mode = '';
  var send_changes = use_dp ? this._dp.updateMode != 'off' : false;
  if (use_dp){
    prev_mode = this._dp.updateMode;
    this._dp.setUpdateMode("off");
  }
  for(var i =0; i < links.length; i++){
    if (use_dp) {
      this._dp.setGanttMode("links");
      this._dp.setUpdated(links[i],true,"deleted");
    }
    this._deleteLink(links[i], true);
  }

  if(use_dp){
    this._dp.setUpdateMode(prev_mode);
    if(send_changes)
      this._dp.sendAllData();
  }
};
gantt._deleteRelatedTasks = function(id, silent){
  var use_dp = (this._dp && !silent);
  var prev_mode = '';

  if (use_dp) {
    prev_mode = this._dp.updateMode;
    this._dp.setGanttMode("tasks");
    this._dp.setUpdateMode("off");
  }
  var tree = this._getTaskTree(id);
  for (var i = 0; i < tree.length; i++) {
    // add deleted subrow into dataprocessor update list manually
    // because silent mode is on
    var t_id = tree[i];
    this._unset_task(t_id);
    if(use_dp){
      this._dp.setUpdated(t_id,true,"deleted");
    }
  }
  if(use_dp){

    this._dp.setUpdateMode(prev_mode);
  }
};
gantt._unset_task = function(id){
  var item = this.getTask(id);
  this._update_flags(id, null);
  delete this._pull[id];
  this._move_branch(item, this.getParent(item), null);
};
gantt._deleteTask = function(id, silent) {
  var item = this.getTask(id);
  if (!silent && this.callEvent("onBeforeTaskDelete", [id, item])===false) return false;

  var links = gantt._getChildLinks(id);
  this._deleteRelatedTasks(id, silent);
  this._deleteRelatedLinks(links, silent);
  this._unset_task(id);
  if (!silent) {
    this.callEvent("onAfterTaskDelete", [id, item]);
    this.refreshData();
  }
  return true;
};

gantt.clearAll = function() {
  this._clear_data();
  this.callEvent("onClear", []);
  this.refreshData();
};
gantt._clear_data = function(){
  this._pull = {};
  this._branches = {};
  this._order = [];
  this._order_full = [];
  this._lpull = {};
  this._update_flags();
  this.userdata = {};
};

gantt._update_flags = function(oldid, newid){
  // TODO: need a proper way to update all possible flags
  if(oldid === undefined){
    this._lightbox_id = this._selected_task = null;
    if (this._tasks_dnd.drag){
      this._tasks_dnd.drag.id = null;
    }
  }else{
    if (this._lightbox_id == oldid)
      this._lightbox_id = newid;
    if (this._selected_task == oldid){
      this._selected_task = newid;
    }
    if (this._tasks_dnd.drag && this._tasks_dnd.drag.id == oldid){
      this._tasks_dnd.drag.id = newid;
    }
  }
};

gantt._get_duration_unit = function(){
  return (gantt._get_line(this.config.duration_unit)*1000) || this.config.duration_unit;
};

gantt._get_safe_type = function(type){
  return type || "task";
};
gantt._get_type_name = function(type_value){
  for(var i in this.config.types){
    if(this.config.types[i] == type_value){
      return i;
    }
  }
  return "task";
};
gantt.getWorkHours = function(date){
  return this._working_time_helper.get_working_hours(date);
};

gantt.setWorkTime = function(config){
  this._working_time_helper.set_time(config);
};

gantt.isWorkTime = function(date, unit){
  var helper = this._working_time_helper;
  return helper.is_working_unit(date, unit || this.config.duration_unit);
};

gantt.correctTaskWorkTime = function(task){
    alert("Forbidden function correctTaskWorkTime");
  if(gantt.config.work_time && gantt.config.correct_work_time){
    if(!gantt.isWorkTime(task.start_date)){
      task.start_date = gantt.getClosestWorkTime({date:task.start_date, dir:'future'});
      task.end_date = gantt.calculateEndDate(task.start_date, task.duration);
    }else if(!gantt.isWorkTime(new Date(+task.end_date - 1))){
      task.end_date = gantt.calculateEndDate(task.start_date, task.duration);
    }
  }
};

gantt.getClosestWorkTime = function(config){
  var helper = this._working_time_helper;
  if(config instanceof Date){
    config = {
      date:config
    };
  }
  config.dir = config.dir || 'any';
  config.unit = config.unit || this.config.duration_unit;
  return helper.get_closest_worktime(config);
};

gantt.calculateDuration = function(start_date, end_date){
  var helper = this._working_time_helper;
  return helper.get_work_units_between(start_date, end_date, this.config.duration_unit, this.config.duration_step);
};
gantt._hasDuration = function(start_date, end_date){
  var helper = this._working_time_helper;
  return helper.is_work_units_between(start_date, end_date, this.config.duration_unit, this.config.duration_step);
};

gantt.calculateEndDate = function(start, duration, unit){
  var helper = this._working_time_helper;
  return helper.add_worktime(start, duration, unit || this.config.duration_unit);
};

gantt._init_task = function(task){
  if (!dhtmlx.defined(task.id))
     task.id = dhtmlx.uid();

  if(task.start_date)
    task.start_date = gantt.date.parseDate(task.start_date, "xml_date");
  if(task.end_date)
    task.end_date = gantt.date.parseDate(task.end_date, "xml_date");

  if(task.start_date){
    if(!task.end_date && task.duration){
      task.end_date = this.calculateEndDate(task.start_date, task.duration);
    }
  }

  gantt._init_task_timing(task);

  task.$source = [];
  task.$target = [];
  if(task.parent === undefined){
    this.setParent(task, this.config.root_id);
  }
  task.$open = dhtmlx.defined(task.open) ? task.open : this.config.open_tree_initially;
  task.$level = this.calculateTaskLevel(task);
  return task;
};

gantt._init_task_timing = function(task){
  var task_type = this._get_safe_type(task.type);

  if(task.$rendered_type === undefined){
    task.$rendered_type = task_type;
  }else if(task.$rendered_type != task_type){
    delete task.$no_end;
    delete task.$no_start;
    task.$rendered_type = task_type;
  }

  if((task.$no_end === undefined || task.$no_start === undefined) && task_type != this.config.types.milestone){
    if(task_type == this.config.types.project){
      //project duration is always defined by children duration
      task.$no_end = task.$no_start = true;
      this._set_default_task_timing(task);
    }else{
      //tasks can have fixed duration, children duration(as projects), or one date fixed, and other defined by nested items
      task.$no_end = !(task.end_date || task.duration);
      task.$no_start = !task.start_date;
    }
  }

  if (task.start_date && task.end_date){
    task.duration = Math.max(this.calculateDuration(task.start_date, task.end_date),1);   // HOSEK - because of weekend issues
  }
  task.duration = task.duration || 0;
};
gantt._is_flex_task = function(task){
  return !!(task.$no_end || task.$no_start);
};

// downward calculation of project duration
gantt.resetProjectDates = function(task){
  if(task.$no_end || task.$no_start){
    var dates = this.getSubtaskDates(task.id);
    if (task.minimal_end && task.minimal_end > dates.end_date) {
      dates.end_date = moment(task.minimal_end);
      dates.end_date._isEndDate = true;
    }
    if (task.maximal_start && task.maximal_start < dates.start_date) {
      dates.start_date = moment(task.maximal_start);
    }
    ysy.log.debug("resetProjectDates to start="+dates.start_date+" end="+dates.end_date,"parent");
    this._assign_project_dates(task, dates.start_date, dates.end_date);
  }
};

gantt.getSubtaskDates = function(task_id){
  var min = null,
    max = null,
    root = task_id !== undefined ? task_id : gantt.config.root_id;
  this.eachTask(function(child){

    if(child.start_date){
      if(!min || min > child.start_date.valueOf()){
        min=child.start_date.valueOf();
      }
    }
    if(child.end_date){
      if(!max || max < child.end_date.valueOf()){
        max=child.end_date.valueOf();
      }
    }

  }, root);
  if((!min || !max) && task_id){
    var task = gantt.getTask(task_id);
    min = min || task.start_date;
    max = max || task.end_date;
  }
  var start_date = moment(min);
  var end_date = moment(max);
  end_date._isEndDate=true;
  return {
    start_date:start_date.isValid()?start_date:null,
    end_date:end_date.isValid()?end_date:null
  };
  return {
    start_date: min ? gantt.date.Date(min) : null,
    end_date: max ? gantt.date.Date(max): null
  };
};

gantt._assign_project_dates = function(task, from, to){
  if(task.$no_start){
    if(from && from != Infinity){
      task.start_date = gantt.date.Date(from);
    }else{
      task.start_date = this._default_task_date(task, this.getParent(task));
    }
  }

  if(task.$no_end){
    if(to && to != -Infinity){
      task.end_date = gantt.date.Date(to);
    }else{
      task.end_date = this.calculateEndDate(task.start_date, this.config.duration_step);
    }
  }
  if(task.$no_start || task.$no_end){
    this._init_task_timing(task);
  }
};

// upward calculation of project duration
gantt._update_parents = function(taskId, silent){
  ysy.log.debug("_update_parents on ID="+taskId,"parent");
  if(!taskId) return;

  var task = this.getTask(taskId);
  var pid = this.getParent(task);

  while(!(task.$no_end || task.$no_start) && pid && this.isTaskExists(pid)){
    task = this.getTask(pid);
    pid = this.getParent(task);
  }

  if(task.$no_start || task.$no_end){
    gantt.resetProjectDates(task);

    if(!silent)
      this.refreshTask(task.id, true);
  }

  if(pid && this.isTaskExists(pid)){
    this._update_parents(pid, silent);
  }
};
gantt.isChildOf = function(child_id, parent_id){
  if(!this.isTaskExists(child_id))
    return false;
  if(parent_id === this.config.root_id)
    return this.isTaskExists(child_id);

  var task = this.getTask(child_id);
  var pid = this.getParent(child_id);

  while(task && this.isTaskExists(pid)){
    task = this.getTask(pid);

    if(task && task.id == parent_id)
      return true;
    pid = this.getParent(task);
  }
  return false;
};

gantt.roundDate = function(config){
  alert("Forbidden function roundDate");
  if(config instanceof Date){
    config = {
      date: config,
      unit: gantt._tasks.unit,
      step: gantt._tasks.step
    };
  }
  var date = config.date,
      steps = config.step,
      unit = config.unit;
      var rounding=this._get_line(unit)*1000;
      var tzOffset = date.getTimezoneOffset();  // HOSEK
  return moment(Math.round((+date) / rounding) * rounding).add(tzOffset,"m").toDate();
};

gantt.attachEvent("onBeforeTaskUpdate", function(id, task){
  gantt._init_task_timing(task);
  return true;
});
gantt.attachEvent("onBeforeTaskAdd", function(id, task){
  gantt._init_task_timing(task);
  return true;
});

gantt.calculateTaskLevel = function (item) {
    var level = 0;
    while (this.getParent(item)) {
        if (!this.isTaskExists(this.getParent(item))) break;
        item = this.getTask(this.getParent(item));
        level++;
    }
    return level;
};

gantt.sort = function(field, desc, parent, silent) {
    var render = !silent;//4th argument to cancel redraw after sorting

    if (!this.isTaskExists(parent)) {
        parent = this.config.root_id;
    }

    if (!field) field = "order";
    var criteria = (typeof(field) == "string") ? (function(a, b) {
    if(a[field] == b[field]){
      return 0;
    }

        var result = a[field] > b[field];
        if (desc) result = !result;
        return result ? 1 : -1;
    }) : field;

    var els = this.getChildren(parent);
    if (els){
        var temp = [];
        for (var i = els.length - 1; i >= 0; i--)
            temp[i] = this._pull[els[i]];

        temp.sort(criteria);

        for (var i = 0; i < temp.length; i++) {
            els[i] = temp[i].id;
            this.sort(field, desc, els[i], true);
        }
    }

    if (render) {
    this.render();
    }
};

gantt.getNext = function(id) {
    for (var i = 0; i < this._order.length-1; i++) {
        if (this._order[i] == id)
            return this._order[i+1];
    }
    return null;
};
gantt.getPrev = function(id) {
    for (var i = 1; i < this._order.length; i++) {
        if (this._order[i] == id)
            return this._order[i-1];
    }
    return null;
};

gantt._get_parent_id = function(task){
  var parent = this.config.root_id;
  if(task){
    parent = task.parent;
  }
  return parent;
};

gantt.getParent = function(id){
  var task = null;
  if(id.id){
    task = id;
  }else if(this.isTaskExists(id)){
    task = gantt.getTask(id);
  }

  return this._get_parent_id(task);
};

gantt.setParent = function(task, new_pid){
  task.parent = new_pid;
};

gantt.getSiblings = function(id){
  if(!this.isTaskExists(id)){
    return [];
  }
  var parent = this.getParent(id);
  return this.getChildren(parent);
};
gantt.getNextSibling = function(id){
  var siblings = this.getSiblings(id);
  for(var i= 0, len = siblings.length; i < len; i++){
    if(siblings[i] == id)
      return siblings[i+1] || null;
  }
  return null;
};
gantt.getPrevSibling = function(id){
  var siblings = this.getSiblings(id);
  for(var i= 0, len = siblings.length; i < len; i++){
    if(siblings[i] == id)
      return siblings[i-1] || null;
  }
  return null;
};

gantt._init_link = function(link) {
    if (!dhtmlx.defined(link.id))
        link.id = dhtmlx.uid();
    return link;
};

gantt._sync_links = function() {
    for (var id in this._pull) {
        this._pull[id].$source = [];
        this._pull[id].$target = [];
    }
    for (var id in this._lpull) {
        var link = this._lpull[id];
        if(this._pull[link.source])
            this._pull[link.source].$source.push(id);
        if(this._pull[link.target])
            this._pull[link.target].$target.push(id);
    }
};

gantt.getLink = function(id) {
    dhtmlx.assert(this._lpull[id], "Link doesn't exist");
    return this._lpull[id];
};

gantt.getLinks = function(){
  var links = [];
  for (var key in gantt._lpull)
    links.push(gantt._lpull[key]);
  return links;
};

gantt.isLinkExists = function(id) {
    return dhtmlx.defined(this._lpull[id]);
};

gantt.addLink = function(link) {
    link = this._init_link(link);

    if (this.callEvent("onBeforeLinkAdd", [link.id, link])===false) return false;

    this._lpull[link.id] = link;
    this._sync_links();
    //this._render_link(link.id);
    this.refreshLink(link.id);
    this.callEvent("onAfterLinkAdd", [link.id, link]);
    return link.id;
};

gantt.updateLink = function (id, data) {
  if (!dhtmlx.defined(data))
    data = this.getLink(id);

  if (this.callEvent("onBeforeLinkUpdate", [id, data]) === false)
    return false;

  this._lpull[id] = data;
  data.widget.update(data);
  this._sync_links();
  //this._render_link(id);
  this.refreshLink(id);
  this.callEvent("onAfterLinkUpdate", [id, data]);
  return true;
};

gantt.deleteLink = function(id) {
    return this._deleteLink(id);
};

gantt._deleteLink = function(id, silent) {
    var link = this.getLink(id);
    if (!silent && this.callEvent("onBeforeLinkDelete", [id, link])===false) return false;

    delete this._lpull[id];
    this._sync_links();
    this.refreshLink(id);
    if (!silent) this.callEvent("onAfterLinkDelete", [id, link]);
    return true;
};

gantt.getChildren = function(id) {
    return dhtmlx.defined(this._branches[id]) ? this._branches[id] : [];
};
gantt.hasChild = function(id) {
    return (dhtmlx.defined(this._branches[id]) && this._branches[id].length);
};

gantt.refreshData = function(){
  this.refresher.renderData();
};

gantt._configure = function(col, data, force){
  for (var key in data)
    if (typeof col[key] == "undefined" || force)
      col[key] = data[key];
};
gantt._init_skin = function(){
  gantt._get_skin(false);
  gantt._init_skin = function(){};
};
gantt._get_skin = function(force){
  if (!gantt.skin || force){
    var links = document.getElementsByTagName("link");
    for (var i = 0; i < links.length; i++) {
      var res = links[i].href.match("dhtmlxgantt_([a-z]+).css");
      if (res){
        gantt.skin = res[1];
        break;
      }
    }
  }

  if (!gantt.skin) gantt.skin = "terrace";
  var skinset = gantt.skins[gantt.skin];

  //apply skin related settings
  this._configure(gantt.config, skinset.config, force);

  var config = gantt.getGridColumns();
  if (config[1] && typeof config[1].width == "undefined")
    config[1].width = skinset._second_column_width;
  if (config[2] && typeof config[2].width == "undefined")
    config[2].width = skinset._third_column_width;

  if (skinset._lightbox_template)
    gantt._lightbox_template = skinset._lightbox_template;
};
gantt.resetSkin = function(){
  this.skin = "";
  this._get_skin(true);
};
gantt.skins = {};

gantt._init_dnd_events = function(){
    dhtmlxEvent(document.body, "mousemove", gantt._move_while_dnd);
    dhtmlxEvent(document.body, "mouseup", gantt._finish_dnd);
    gantt._init_dnd_events = function(){};
};
gantt._move_while_dnd = function(e){
    if (gantt._dnd_start_lb){
        if (!document.gantt_unselectable){
            document.body.className += " gantt_unselectable";
            document.gantt_unselectable = true;
        }
        var lb = gantt.getLightbox();
        var now = (e&&e.target)?[e.pageX, e.pageY]:[event.clientX, event.clientY];
        lb.style.top = gantt._lb_start[1]+now[1]-gantt._dnd_start_lb[1]+"px";
        lb.style.left = gantt._lb_start[0]+now[0]-gantt._dnd_start_lb[0]+"px";
    }
};
gantt._ready_to_dnd = function(e){
    var lb = gantt.getLightbox();
    gantt._lb_start = [parseInt(lb.style.left,10), parseInt(lb.style.top,10)];
    gantt._dnd_start_lb = (e&&e.target)?[e.pageX, e.pageY]:[event.clientX, event.clientY];
};
gantt._finish_dnd = function(){
    if (gantt._lb_start){
        gantt._lb_start = gantt._dnd_start_lb = false;
        document.body.className = document.body.className.replace(" gantt_unselectable","");
        document.gantt_unselectable = false;
    }
};

gantt._focus = function(node, select){
    if (node && node.focus){
        if (gantt.config.touch){
            //do not focus editor, to prevent auto-zoom
        } else {
            try {
                if (select && node.select) node.select();
                node.focus();
            }catch(e){ }
        }
    }
};

/**
  * 	@desc: constructor, data processor object
  *	@param: serverProcessorURL - url used for update
  *	@type: public
  */
function dataProcessor(serverProcessorURL){
    this.serverProcessor = serverProcessorURL;
    this.action_param="!nativeeditor_status";

  this.object = null;
  this.updatedRows = []; //ids of updated rows

  this.autoUpdate = true;
  this.updateMode = "cell";
  this._tMode="GET";
  this._headers = null;
  this._payload = null;
  this.post_delim = "_";

    this._waitMode=0;
    this._in_progress={};//?
    this._invalid={};
    this.mandatoryFields=[];
    this.messages=[];

    this.styles={
      updated:"font-weight:bold;",
      inserted:"font-weight:bold;",
      deleted:"text-decoration : line-through;",
      invalid:"background-color:FFE0E0;",
      invalid_cell:"border-bottom:2px solid red;",
      error:"color:red;",
      clear:"font-weight:normal;text-decoration:none;"
    };

    this.enableUTFencoding(true);
    dhx4._eventable(this);

    return this;
    }

dataProcessor.prototype={
  setTransactionMode:function(mode,total){
    if (typeof mode == "object"){
      this._tMode = mode.mode || this._tMode;
      this._headers = this._headers || mode.headers;
      this._payload = this._payload || mode.payload;
    } else {
          this._tMode=mode;
      this._tSend=total;
    }

    if (this._tMode == "REST"){
      this._tSend = false;
      this._endnm = true;
    }
    },
    escape:function(data){
      if (this._utf)
        return encodeURIComponent(data);
      else
          return escape(data);
  },
    /**
  * 	@desc: allows to set escaping mode
  *	@param: true - utf based escaping, simple - use current page encoding
  *	@type: public
  */
  enableUTFencoding:function(mode){
        this._utf=dhx4.s2b(mode);
    },
    /**
  * 	@desc: allows to define, which column may trigger update
  *	@param: val - array or list of true/false values
  *	@type: public
  */
  setDataColumns:function(val){
    this._columns=(typeof val == "string")?val.split(","):val;
    },
    /**
  * 	@desc: get state of updating
  *	@returns:   true - all in sync with server, false - some items not updated yet.
  *	@type: public
  */
  getSyncState:function(){
    return !this.updatedRows.length;
  },
  /**
  * 	@desc: enable/disable named field for data syncing, will use column ids for grid
  *	@param:   mode - true/false
  *	@type: public
  */
  enableDataNames:function(mode){
    this._endnm=dhx4.s2b(mode);
  },
  /**
  * 	@desc: enable/disable mode , when only changed fields and row id send to the server side, instead of all fields in default mode
  *	@param:   mode - true/false
  *	@type: public
  */
  enablePartialDataSend:function(mode){
    this._changed=dhx4.s2b(mode);
  },
  /**
  * 	@desc: set if rows should be send to server automaticaly
  *	@param: mode - "row" - based on row selection changed, "cell" - based on cell editing finished, "off" - manual data sending
  *	@type: public
  */
  setUpdateMode:function(mode,dnd){
    this.autoUpdate = (mode=="cell");
    this.updateMode = mode;
    this.dnd=dnd;
  },
  ignore:function(code,master){
    this._silent_mode=true;
    code.call(master||window);
    this._silent_mode=false;
  },
  /**
  * 	@desc: mark row as updated/normal. check mandatory fields,initiate autoupdate (if turned on)
  *	@param: rowId - id of row to set update-status for
  *	@param: state - true for "updated", false for "not updated"
  *	@param: mode - update mode name
  *	@type: public
  */
  setUpdated:function(rowId,state,mode){
    if (this._silent_mode) return;
    var ind=this.findRow(rowId);

    mode=mode||"updated";
    var existing = this.obj.getUserData(rowId,this.action_param);
    if (existing && mode == "updated") mode=existing;
    if (state){
      this.set_invalid(rowId,false); //clear previous error flag
      this.updatedRows[ind]=rowId;
      this.obj.setUserData(rowId,this.action_param,mode);
      if (this._in_progress[rowId])
        this._in_progress[rowId]="wait";
    } else{
      if (!this.is_invalid(rowId)){
        this.updatedRows.splice(ind,1);
        this.obj.setUserData(rowId,this.action_param,"");
      }
    }

    //clear changed flag
    if (!state)
      this._clearUpdateFlag(rowId);

    this.markRow(rowId,state,mode);
    if (state && this.autoUpdate) this.sendData(rowId);
  },
  _clearUpdateFlag:function(id){},
  markRow:function(id,state,mode){
    var str="";
    var invalid=this.is_invalid(id);
    if (invalid){
          str=this.styles[invalid];
          state=true;
      }
    if (this.callEvent("onRowMark",[id,state,mode,invalid])){
      //default logic
      str=this.styles[state?mode:"clear"]+str;

          this.obj[this._methods[0]](id,str);

      if (invalid && invalid.details){
        str+=this.styles[invalid+"_cell"];
        for (var i=0; i < invalid.details.length; i++)
          if (invalid.details[i])
                this.obj[this._methods[1]](id,i,str);
      }
    }
  },
  getState:function(id){
    return this.obj.getUserData(id,this.action_param);
  },
  is_invalid:function(id){
    return this._invalid[id];
  },
  set_invalid:function(id,mode,details){
    if (details) mode={value:mode, details:details, toString:function(){ return this.value.toString(); }};
    this._invalid[id]=mode;
  },
  /**
  * 	@desc: check mandatory fields and varify values of cells, initiate update (if specified)
  *	@param: rowId - id of row to set update-status for
  *	@type: public
  */
  checkBeforeUpdate:function(rowId){
    return true;
  },
  /**
  * 	@desc: send row(s) values to server
  *	@param: rowId - id of row which data to send. If not specified, then all "updated" rows will be send
  *	@type: public
  */
  sendData:function(rowId){
    if (this._waitMode && (this.obj.mytype=="tree" || this.obj._h2)) return;
    if (this.obj.editStop) this.obj.editStop();


    if(typeof rowId == "undefined" || this._tSend) return this.sendAllData();
    if (this._in_progress[rowId]) return false;

    this.messages=[];
    if (!this.checkBeforeUpdate(rowId) && this.callEvent("onValidationError",[rowId,this.messages])) return false;
    this._beforeSendData(this._getRowData(rowId),rowId);
    },
    _beforeSendData:function(data,rowId){
      if (!this.callEvent("onBeforeUpdate",[rowId,this.getState(rowId),data])) return false;
    this._sendData(data,rowId);
    },
    serialize:function(data, id){
      if (typeof data == "string")
        return data;
      if (typeof id != "undefined")
        return this.serialize_one(data,"");
      else{
        var stack = [];
        var keys = [];
        for (var key in data)
          if (data.hasOwnProperty(key)){
            stack.push(this.serialize_one(data[key],key+this.post_delim));
            keys.push(key);
        }
        stack.push("ids="+this.escape(keys.join(",")));
        if (dhtmlx.security_key)
        stack.push("dhx_security="+dhtmlx.security_key);
        return stack.join("&");
      }
    },
    serialize_one:function(data, pref){
      if (typeof data == "string")
        return data;
      var stack = [];
      for (var key in data)
        if (data.hasOwnProperty(key)){
          if ((key == "id" || key == this.action_param) && this._tMode == "REST") continue;
          stack.push(this.escape((pref||"")+key)+"="+this.escape(data[key]));
        }
    return stack.join("&");
    },
    _sendData:function(a1,rowId){
      if (!a1) return; //nothing to send
    if (!this.callEvent("onBeforeDataSending",rowId?[rowId,this.getState(rowId),a1]:[null, null, a1])) return false;

      if (rowId)
      this._in_progress[rowId]=(new Date()).valueOf();

    var that = this;
    var back = function(xml){
      var ids = [];
      if (rowId)
        ids.push(rowId);
      else if (a1)
        for (var key in a1)
          ids.push(key);

      return that.afterUpdate(that,xml,ids);
    };

    var a3 = this.serverProcessor+(this._user?(dhtmlx.url(this.serverProcessor)+["dhx_user="+this._user,"dhx_version="+this.obj.getUserData(0,"version")].join("&")):"");

    if (this._tMode=="GET")
          dhx4.ajax.get(a3+((a3.indexOf("?")!=-1)?"&":"?")+this.serialize(a1,rowId), back);
    else if (this._tMode == "POST")
          dhx4.ajax.post(a3,this.serialize(a1,rowId), back);
        else if (this._tMode == "REST"){
          var state = this.getState(rowId);
          var url = a3.replace(/(\&|\?)editing\=true/,"");
          var data = "";
          var method = "post";

          if (state == "inserted"){
            data = this.serialize(a1, rowId);
          } else if (state == "deleted"){
            method = "DELETE";
            url = url + (url.slice(-1) == "/" ? "" : "/") + rowId;
          } else {
            method = "PUT";
            data = this.serialize(a1, rowId);
            url = url + (url.slice(-1) == "/" ? "" : "/") + rowId;
          }

          if (this._payload)
            for (var key in this._payload)
              url = url + dhtmlx.url(url) + this.escape(key) + "=" + this.escape(this._payload[key]);

          dhx4.ajax.query({
            url:url,
            method:method,
            headers:this._headers,
            data:data,
            callback:back
          });
        }

    this._waitMode++;
    },
  sendAllData:function(){
    if (!this.updatedRows.length) return;

    this.messages=[]; var valid=true;
    for (var i=0; i<this.updatedRows.length; i++)
      valid&=this.checkBeforeUpdate(this.updatedRows[i]);
    if (!valid && !this.callEvent("onValidationError",["",this.messages])) return false;

    if (this._tSend)
      this._sendData(this._getAllData());
    else
      for (var i=0; i<this.updatedRows.length; i++)
        if (!this._in_progress[this.updatedRows[i]]){
          if (this.is_invalid(this.updatedRows[i])) continue;
          this._beforeSendData(this._getRowData(this.updatedRows[i]),this.updatedRows[i]);
          if (this._waitMode && (this.obj.mytype=="tree" || this.obj._h2)) return; //block send all for tree
        }
  },

  _getAllData:function(rowId){
    var out={};
    var has_one = false;
    for(var i=0;i<this.updatedRows.length;i++){
      var id=this.updatedRows[i];
      if (this._in_progress[id] || this.is_invalid(id)) continue;
      if (!this.callEvent("onBeforeUpdate",[id,this.getState(id), this._getRowData(id)])) continue;
      out[id]=this._getRowData(id,id+this.post_delim);
      has_one = true;
      this._in_progress[id]=(new Date()).valueOf();
    }
    return has_one?out:null;
  },


  /**
  * 	@desc: specify column which value should be varified before sending to server
  *	@param: ind - column index (0 based)
  *	@param: verifFunction - function (object) which should verify cell value (if not specified, then value will be compared to empty string). Two arguments will be passed into it: value and column name
  *	@type: public
  */
  setVerificator:function(ind,verifFunction){
    this.mandatoryFields[ind] = verifFunction||(function(value){return (value!=="");});
  },
  /**
  * 	@desc: remove column from list of those which should be verified
  *	@param: ind - column Index (0 based)
  *	@type: public
  */
  clearVerificator:function(ind){
    this.mandatoryFields[ind] = false;
  },

  findRow:function(pattern){
    var i=0;
      for(i=0;i<this.updatedRows.length;i++)
        if(pattern==this.updatedRows[i]) break;
      return i;
    },

  /**
  * 	@desc: define custom actions
  *	@param: name - name of action, same as value of action attribute
  *	@param: handler - custom function, which receives a XMl response content for action
  *	@type: private
  */
  defineAction:function(name,handler){
        if (!this._uActions) this._uActions=[];
            this._uActions[name]=handler;
  },

  /**
*     @desc: used in combination with setOnBeforeUpdateHandler to create custom client-server transport system
*     @param: sid - id of item before update
*     @param: tid - id of item after up0ate
*     @param: action - action name
*     @type: public
*     @topic: 0
*/
  afterUpdateCallback:function(sid, tid, action, btag) {
    var marker = sid;
    var correct=(action!="error" && action!="invalid");
    if (!correct) this.set_invalid(sid,action);
    if ((this._uActions)&&(this._uActions[action])&&(!this._uActions[action](btag)))
      return (delete this._in_progress[marker]);

    if (this._in_progress[marker]!="wait")
        this.setUpdated(sid, false);

      var soid = sid;

      switch (action) {
      case "inserted":
      case "insert":
          if (tid != sid) {
              this.obj[this._methods[2]](sid, tid);
              sid = tid;
          }
          break;
      case "delete":
      case "deleted":
        this.obj.setUserData(sid, this.action_param, "true_deleted");
          this.obj[this._methods[3]](sid);
          delete this._in_progress[marker];
          return this.callEvent("onAfterUpdate", [sid, action, tid, btag]);
          break;
      }

      if (this._in_progress[marker]!="wait"){
        if (correct) this.obj.setUserData(sid, this.action_param,'');
        delete this._in_progress[marker];
      } else {
        delete this._in_progress[marker];
        this.setUpdated(tid,true,this.obj.getUserData(sid,this.action_param));
    }

      this.callEvent("onAfterUpdate", [soid, action, tid, btag]);
  },

  /**
  * 	@desc: response from server
  *	@param: xml - XMLLoader object with response XML
  *	@type: private
  */
  afterUpdate:function(that,xml,id){
    //try to use json first
    if (window.JSON){
      try{
        var tag = JSON.parse(xml.xmlDoc.responseText);
        var action = tag.action || this.getState(id) || "updated";
        var sid = tag.sid || id[0];
        var tid = tag.tid || id[0];
        that.afterUpdateCallback(sid, tid, action, tag);
        that.finalizeUpdate();
        return;
      } catch(e){
      }
    }
    //xml response
    var top = dhx4.ajax.xmltop("data", xml.xmlDoc); //fix incorrect content type in IE
    if (!top) return this.cleanUpdate(id);
    var atag=dhx4.ajax.xpath("//data/action", top);
    if (!atag.length) return this.cleanUpdate(id);

    for (var i=0; i<atag.length; i++){
          var btag=atag[i];
      var action = btag.getAttribute("type");
      var sid = btag.getAttribute("sid");
      var tid = btag.getAttribute("tid");

      that.afterUpdateCallback(sid,tid,action,btag);
    }
    that.finalizeUpdate();
  },
  cleanUpdate:function(id){
    if (id)
      for (var i = 0; i < id.length; i++)
        delete this._in_progress[id[i]];
  },
  finalizeUpdate:function(){
    if (this._waitMode) this._waitMode--;

    if ((this.obj.mytype=="tree" || this.obj._h2) && this.updatedRows.length)
      this.sendData();
    this.callEvent("onAfterUpdateFinish",[]);
    if (!this.updatedRows.length)
      this.callEvent("onFullSync",[]);
  },

  /**
  * 	@desc: initializes data-processor
  *	@param: anObj - dhtmlxGrid object to attach this data-processor to
  *	@type: public
  */
  init:function(anObj){
    this.obj = anObj;
    if (this.obj._dp_init)
      this.obj._dp_init(this);
  },

  setOnAfterUpdate:function(ev){
    this.attachEvent("onAfterUpdate",ev);
  },
  enableDebug:function(mode){
  },
  setOnBeforeUpdateHandler:function(func){
    this.attachEvent("onBeforeDataSending",func);
  },

  /* starts autoupdate mode
    @param interval
      time interval for sending update requests
  */
  setAutoUpdate: function(interval, user) {
    interval = interval || 2000;

    this._user = user || (new Date()).valueOf();
    this._need_update = false;
    this._loader = null;
    this._update_busy = false;

    this.attachEvent("onAfterUpdate",function(sid,action,tid,xml_node){
      this.afterAutoUpdate(sid, action, tid, xml_node);
    });
    this.attachEvent("onFullSync",function(){
      this.fullSync();
    });

    var self = this;
    window.setInterval(function(){
      self.loadUpdate();
    }, interval);
  },

  /* process updating request answer
    if status == collision version is depricated
    set flag for autoupdating immidiatly
  */
  afterAutoUpdate: function(sid, action, tid, xml_node) {
    if (action == 'collision') {
      this._need_update = true;
      return false;
    } else {
      return true;
    }
  },

  /* callback function for onFillSync event
    call update function if it's need
  */
  fullSync: function() {
    if (this._need_update == true) {
      this._need_update = false;
      this.loadUpdate();
    }
    return true;
  },

  /* sends query to the server and call callback function
  */
  getUpdates: function(url,callback){
    if (this._update_busy)
      return false;
    else
      this._update_busy = true;

    this._loader = this._loader || new dtmlXMLLoaderObject(true);

    this._loader.async=true;
    this._loader.waitCall=callback;
    this._loader.loadXML(url);
  },

  /* returns xml node value
    @param node
      xml node
  */
  _v: function(node) {
    if (node.firstChild) return node.firstChild.nodeValue;
    return "";
  },

  /* returns values array of xml nodes array
    @param arr
      array of xml nodes
  */
  _a: function(arr) {
    var res = [];
    for (var i=0; i < arr.length; i++) {
      res[i]=this._v(arr[i]);
    };
    return res;
  },

  /* loads updates and processes them
  */
  loadUpdate: function(){
    var self = this;
    var version = this.obj.getUserData(0,"version");
    var url = this.serverProcessor+dhtmlx.url(this.serverProcessor)+["dhx_user="+this._user,"dhx_version="+version].join("&");
    url = url.replace("editing=true&","");
    this.getUpdates(url, function(){
      var vers = self._loader.doXPath("//userdata");
      self.obj.setUserData(0,"version",self._v(vers[0]));

      var upds = self._loader.doXPath("//update");
      if (upds.length){
        self._silent_mode = true;

        for (var i=0; i<upds.length; i++) {
          var status = upds[i].getAttribute('status');
          var id = upds[i].getAttribute('id');
          var parent = upds[i].getAttribute('parent');
          switch (status) {
            case 'inserted':
              self.callEvent("insertCallback",[upds[i], id, parent]);
              break;
            case 'updated':
              self.callEvent("updateCallback",[upds[i], id, parent]);
              break;
            case 'deleted':
              self.callEvent("deleteCallback",[upds[i], id, parent]);
              break;
          }
        }

        self._silent_mode = false;
      }

      self._update_busy = false;
      self = null;
    });
  }

};

/*
  asserts will be removed in final code, so you can place them anythere
  without caring about performance impacts
*/
dhtmlx.assert = function(check, message){
    //jshint -W087
  if (!check){
    dhtmlx.message({ type:"error", text:message, expire:-1 });
  }
};

//initial initialization
gantt.init = function(node, from, to){
  this.callEvent("onBeforeGanttReady", []);
  if(from && to){
    this.config.start_date = this._min_date = gantt.date.Date(from);
    this.config.end_date = this._max_date = gantt.date.Date(to);
  }
  this._init_skin();

    if (!this.config.scroll_size)
        this.config.scroll_size = this._detectScrollSize();

  dhtmlxEvent(window, "resize", this._on_resize);

  //can be called only once
  this.init = function(node){
    if (this.$container && this.$container.parentNode){
      this.$container.parentNode.removeChild(this.$container);
      this.$container = null;
    }
    this._reinit(node);
  };

  this._reinit(node);
};

gantt._reinit = function(node){
    this._init_html_area(node);
    this._set_sizes();

  this._clear_renderers();
  this._update_flags();
    this._init_touch_events();
    this._init_templates();
    this._init_grid();
    this._init_tasks();

    this._set_scroll_events();

    dhtmlxEvent(this.$container, "click", this._on_click);
    dhtmlxEvent(this.$container, "dblclick", this._on_dblclick);
    dhtmlxEvent(this.$container, "mousemove", this._on_mousemove);
    dhtmlxEvent(this.$container, "contextmenu", this._on_contextmenu);

  this.callEvent("onGanttReady", []);

  this.render();
};

//renders initial html markup
gantt._init_html_area = function(node){
  ysy.log.debug("html_inited","render");
  if (typeof node == "string")
    this._obj = document.getElementById(node);
  else
    this._obj = node;
  dhtmlx.assert(this._obj, "Invalid html container: "+node);
    var html = "<div class='gantt_container'><div class='gantt_grid'></div><div class='gantt_task'></div><div class='gantt_grid_column_resize_wrap' data-column_id='grid_width'>\
        </div>";
    html += "<div class='gantt_ver_scroll'><div></div></div><div class='gantt_hor_scroll'><div></div></div></div>";
  this._obj.innerHTML = html;
  //store links for further reference
    this.$container = this._obj.firstChild;
    var childs = this.$container.childNodes;
  this.$grid = childs[0];
  this.$task = childs[1];
  this.$grid_resize = childs[2];
    this.$scroll_ver = childs[3];
    this.$scroll_hor = childs[4];

    this.$grid.innerHTML = "<div class='gantt_grid_scale'></div><div class='gantt_grid_data'></div>";
    this.$grid_scale = this.$grid.childNodes[0];
    this.$grid_data = this.$grid.childNodes[1];

  this.$task.innerHTML = "<div class='gantt_task_scale'></div><div class='gantt_data_area'><div class='gantt_task_bg'></div><div class='gantt_marker_area'></div><div class='gantt_links_area'></div><div class='gantt_bars_area'></div></div>";
  this.$task_scale = this.$task.childNodes[0];

  this.$task_data = this.$task.childNodes[1];

  this.$task_bg = this.$task_data.childNodes[0];
  this.$marker_area = this.$task_data.childNodes[1];
  this.$task_links = this.$task_data.childNodes[2];
  this.$task_bars = this.$task_data.childNodes[3];
};

gantt.$click={
    buttons:{
        "edit":function(id){
            gantt.showLightbox(id);
        },
        "delete":function(id){
            var question = gantt.locale.labels.confirm_deleting;
            var title = gantt.locale.labels.confirm_deleting_title;

            gantt._dhtmlx_confirm(question, title, function(){
        var task = gantt.getTask(id);
        if(task.$new){
          gantt._deleteTask(id, true);
          gantt.refreshData();
        }else{
          gantt.deleteTask(id);
        }
                gantt.hideLightbox();
            });
        }
    }
};

gantt._calculate_content_height = function(){
  var scale_height = this.config.scale_height,
    rows_height = this._order.length*this.config.row_height,
    hor_scroll_height = this._scroll_hor ? this.config.scroll_size + 1 : 0;

  if(!(this._is_grid_visible() || this._is_chart_visible())){
    return 0;
  }else{
    return scale_height + rows_height + 2 + hor_scroll_height;
  }
};
gantt._calculate_content_width = function(){
  var grid_width = this._get_grid_width(),
    chart_width = this._tasks ? this._tasks.full_width : 0,
    ver_scroll_width = this._scroll_ver ? this.config.scroll_size + 1 : 0;

  if(!this._is_chart_visible()){
    chart_width = 0;
  }
  if(!this._is_grid_visible()){
    grid_width = 0;
  }
  return grid_width + chart_width + 1;
};

gantt._get_resize_options = function(){
  var res = {x:false, y:false};
  if(this.config.autosize == "xy"){
    res.x = res.y = true;
  }else if(this.config.autosize == "y" || this.config.autosize === true){
    res.y = true;
  }else if(this.config.autosize == "x"){
    res.x = true;
  }
  return res;
};

gantt._clean_el_size = function(value){
  return ((value || "").toString().replace("px", "") * 1 || 0);
};
gantt._get_box_styles = function(){
  var computed = null;
  if(window.getComputedStyle){
    computed = window.getComputedStyle(this._obj, null);
  }else{
    //IE with elem.currentStyle does not calculate sizes from %, so will use the default approach
    computed = {
      "width":this._obj.clientWidth,
      "height":this._obj.clientHeight
    };
  }
  var properties = [
    "width",
    "height",

    "paddingTop",
    "paddingBottom",
    "paddingLeft",
    "paddingRight",

    "borderLeftWidth",
    "borderRightWidth",
    "borderTopWidth",
    "borderBottomWidth"
  ];
  var styles = {
    boxSizing:(computed.boxSizing == "border-box")
  };

  if(computed.MozBoxSizing){
    styles.boxSizing = (computed.MozBoxSizing == "border-box");
  }
  for(var i =0; i < properties.length; i++){
    styles[properties[i]] = computed[properties[i]] ? this._clean_el_size(computed[properties[i]]) : 0;
  }

  var box = {
    horPaddings : (styles.paddingLeft + styles.paddingRight + styles.borderLeftWidth + styles.borderRightWidth),
    vertPaddings : (styles.paddingTop + styles.paddingBottom + styles.borderTopWidth + styles.borderBottomWidth),
    borderBox: styles.boxSizing,
    innerWidth : styles.width,
    innerHeight : styles.height,
    outerWidth : styles.width,
    outerHeight : styles.height
  };

  if(box.borderBox){
    box.innerWidth -= box.horPaddings;
    box.innerHeight -= box.vertPaddings;
  }else{
    box.outerWidth += box.horPaddings;
    box.outerHeight += box.vertPaddings;
  }

  return box;
};
gantt._do_autosize = function(){
  ysy.log.debug("_do_autosize()","print");
  var resize = this._get_resize_options();
  var boxSizes = this._get_box_styles();
  if(resize.y){
    var reqHeight = this._calculate_content_height();
    if(boxSizes.borderBox){
      reqHeight += boxSizes.vertPaddings;
    }

    this._obj.style.height = reqHeight + 'px';
  }
  if(resize.x){
    var reqWidth = this._calculate_content_width();
    if(boxSizes.borderBox){
      reqWidth += boxSizes.horPaddings;
    }
    this._obj.style.width = reqWidth + 'px';
  }
};
//set sizes to top level html element
gantt._set_sizes = function(){
  ysy.log.debug("_set_sizes()","print");
  // TODO printable
  this._do_autosize();

  var boxSizes = this._get_box_styles();
  this._y = boxSizes.innerHeight;

    if (this._y < 20) return;

  //same height
  this.$grid.style.height = this.$task.style.height = Math.max(this._y - this.$scroll_hor.offsetHeight - 2, 0) +"px";

  var dataHeight = Math.max((this._y - (this.config.scale_height||0) - this.$scroll_hor.offsetHeight - 2), 0);
    this.$grid_data.style.height = this.$task_data.style.height =  dataHeight + "px";

  //share width
  var gridWidth = Math.max(this._get_grid_width()-1, 0);
  this.$grid.style.width =  gridWidth +"px";
  this.$grid.style.display = gridWidth === 0 ? 'none' : '';

  boxSizes = this._get_box_styles();
  this._x = boxSizes.innerWidth;

  if (this._x < 20) return;

    this.$grid_data.style.width = Math.max(this._get_grid_width()-1, 0) +"px";
  this.$task.style.width = Math.max(this._x - this._get_grid_width() - 2, 0) +"px";
};
gantt._unset_sizes = function(){
  ysy.log.debug("_unset_sizes()","print");
  // TODO printable

  this.$grid.style.height = this.$task.style.height = "";

  //var dataHeight = Math.max((this._y - (this.config.scale_height||0) - this.$scroll_hor.offsetHeight - 2), 0);
    this.$grid_data.style.height = this.$task_data.style.height =  "";

  //share width
  var gridWidth = Math.max(this._get_grid_width()-1, 0);
  this.$grid.style.width =  gridWidth +"px";
  this.$grid.style.display = gridWidth === 0 ? 'none' : '';

  var boxSizes = this._get_box_styles();
  this._x = boxSizes.innerWidth;

  if (this._x < 20) return;

    this.$grid_data.style.width = Math.max(this._get_grid_width()-1, 0) +"px";
  this.$task.style.width = "";
  this.$scroll_hor.style.display = "none";
  this.$scroll_ver.style.display = "none";
};

gantt.getScrollState = function(){
  if(this.$task && this.$task_data)
    return { x:this.$task.scrollLeft, y:this.$task_data.scrollTop };
  else
    return null;
};

gantt._save_scroll_state = function (x, y) {
  // according to Chrome profiler
  // getting-setting scrollLeft for restoring scroll position after render takes surprisingly big amount of time
  // 2x-3x times more than setting innerHTML (if using gantt.config.static_background)
  // Will store scroll position in memory instead of getting actual values from DOM
  var pos = {};
  this._cached_scroll_pos = this._cached_scroll_pos || {x:0,y:0};
  if (x !== undefined) {
    pos.x = x;
  }
  if (y !== undefined) {
    pos.y = y;
  }
  dhtmlx.mixin(this._cached_scroll_pos, pos, true);

};
gantt._restore_scroll_state = function(){
  return this._cached_scroll_pos || null;
};
gantt.scrollTo = function(left, top){
  if (left*1 == left){
    var modLeft = Math.min(left, this.$task.scrollWidth - this.$task.offsetWidth);
    this.$task.scrollLeft = modLeft;
    this._save_scroll_state(modLeft, undefined);
  }
  if(top*1 == top){
    // this.$task_data.scrollTop = top;
    // this.$grid_data.scrollTop = top;
    this._save_scroll_state(undefined, top);
  }
  ysy.log.debug("ScrollTo [" + left + " (" + modLeft + ")," + top + "]", "scroll");
  this.callEvent("onScrollTo", [modLeft, top]);
};

gantt.showDate = function(date){
  var date_x = Math.round(this.posFromDate(date));
  var scroll_to = Math.max(date_x - this.config.task_scroll_offset, 0);
  this.scrollTo(scroll_to);
};
gantt.showTask = function(id) {
  var el = this.getTaskNode(id);
  if(!el)
    return;

  var left = Math.max(el.offsetLeft - this.config.task_scroll_offset, 0);
  var top = el.offsetTop - (this.$task_data.offsetHeight - this.config.row_height)/2;
  this.scrollTo(left, top);
};

//called after window resize
gantt._on_resize = gantt.setSizes = function(){
    gantt._set_sizes();
    gantt._scroll_resize();
};

//renders self
gantt.render = function() {
  this.refresher.renderAll();
  return;
}
gantt._render = function(){
  ysy.log.debug("render is triggered","render");
  this.callEvent("onBeforeGanttRender", []);

  var pos = dhtmlx.copy(this._restore_scroll_state());
  var visible_date = null;
  if(pos){
    visible_date = gantt.dateFromPos(pos.x + this.config.task_scroll_offset);
  }

  this._render_grid();	//grid.js
  this._render_tasks_scales();	//tasks.js
  this._scroll_resize();
  this._on_resize();
  this._render_data();

  // if(gantt._selected_task){   //  TODO vyladit a povolit
  //   if(gantt.isTaskExists(gantt._selected_task)){
  //     gantt.showTask(gantt._selected_task);
  //   }
  // }else
  if(this.config.preserve_scroll && pos){

    var new_pos =gantt._restore_scroll_state();
    var new_date = gantt.dateFromPos(new_pos.x + this.config.task_scroll_offset);
    if(!(+visible_date == +new_date && new_pos.y == pos.y)){
      ysy.log.debug("pos.x="+pos.x+" new_pos="+new_pos.x,"scroll");
      this.showDate(new_date);
      gantt.scrollTo(undefined, pos.y);
    }
  }else{
    this.showDate(moment());
  }

  this.callEvent("onGanttRender", []);
  gantt._skip_render = false;
};

gantt._set_scroll_events = function(){
    dhtmlxEvent(this.$scroll_hor, "scroll", function() {
      //in safari we can catch previous onscroll after setting new value from mouse-wheel event
      //set delay to prevent value drifiting
      if (gantt.date.now() - ( gantt._wheel_time || 0 ) < 100) return true;
        if (gantt._touch_scroll_active) return;
        var left = gantt.$scroll_hor.scrollLeft;
        gantt.scrollTo(left);
    });
    dhtmlxEvent(this.$scroll_ver, "scroll", function() {
        if (gantt._touch_scroll_active) return;
        var top = gantt.$scroll_ver.scrollTop;
        gantt.$grid_data.scrollTop = top;
        gantt.scrollTo(null, top);
    });
    dhtmlxEvent(this.$task, "scroll", function() {
        var left = gantt.$task.scrollLeft,
      barLeft = gantt.$scroll_hor.scrollLeft;
    if(barLeft != left)
          gantt.$scroll_hor.scrollLeft = left;
    });
    dhtmlxEvent(this.$task_data, "scroll", function() {
        var top = gantt.$task_data.scrollTop,
      barTop = gantt.$scroll_ver.scrollTop;
    if(barTop != top)
          gantt.$scroll_ver.scrollTop = top;
    });

    var ff = _isFF && !window._KHTMLrv;
  function onMouseWheel(e){
    var res = gantt._get_resize_options();
    gantt._wheel_time = gantt.date.Date();

        var wx = ff ? (e.deltaX*-20) : e.wheelDeltaX*2;
        var wy = ff ? (e.deltaY*-40) : e.wheelDelta;

    if (wx && Math.abs(wx) > Math.abs(wy)){
      if(res.x) return true;//no horisontal scroll, must not block scrolling

      var dir  = wx/-40;
      var left = gantt.$task.scrollLeft+dir*30;
      gantt.scrollTo(left, null);
      gantt.$scroll_hor.scrollTop = top;
    } else {
      if(res.y) return true;//no vertical scroll, must not block scrolling

      var dir  = wy/-40;
      if (typeof wy == "undefined")
        dir = e.detail;

      var top = gantt.$scroll_ver.scrollTop+dir*30;
      if(!gantt.config.prevent_default_scroll && gantt._cached_scroll_pos && gantt._cached_scroll_pos.y == top) return true;

      gantt.scrollTo(null, top);
      gantt.$scroll_ver.scrollTop = top;
    }

    if (e.preventDefault)
      e.preventDefault();
    e.cancelBubble=true;
    return false;
  }

    if (ff)
        dhtmlxEvent(gantt.$container, "wheel", onMouseWheel);
    else
        dhtmlxEvent(gantt.$container, "mousewheel", onMouseWheel);

};


gantt._scroll_resize = function() {
    if (this._x < 20 || this._y < 20) return;

    var grid_width = this._get_grid_width();

    var task_width = Math.max(this._x - grid_width, 0);
    var task_height = Math.max(this._y - this.config.scale_height, 0);

  var scroll_size = this.config.scroll_size + 1;//1px for inner content

    var task_data_width = Math.max(this.$task_data.offsetWidth - scroll_size, 0);
    var task_data_height = this.config.row_height*this._order.length;

  var resize = this._get_resize_options();
  var scroll_hor = this._scroll_hor = resize.x ? false : (task_data_width > task_width);
    var scroll_ver = this._scroll_ver = resize.y ? false : (task_data_height > task_height);

    this.$scroll_hor.style.display = scroll_hor ? "block" : "none";
    this.$scroll_hor.style.height = (scroll_hor ? scroll_size : 0) + "px";
    this.$scroll_hor.style.width = Math.max((this._x - (scroll_ver ? scroll_size : 2)), 0) + "px";
    this.$scroll_hor.firstChild.style.width = (task_data_width + grid_width + scroll_size + 2) + "px";

    this.$scroll_ver.style.display = scroll_ver ? "block" : "none";
    this.$scroll_ver.style.width = (scroll_ver ? scroll_size : 0) + "px";
    this.$scroll_ver.style.height = Math.max((this._y - (scroll_hor ? scroll_size : 0) - this.config.scale_height), 0) + "px";
    this.$scroll_ver.style.top = this.config.scale_height + "px";
    this.$scroll_ver.firstChild.style.height = (this.config.scale_height + task_data_height) + "px";
};

gantt.locate = function(e) {
    var trg = gantt._get_target_node(e);

    //ignore empty cells
  var className = trg.className || "";
  if(!className.indexOf){
    //'className' exist but not a string - IE svg element in DOM
    className = '';
  }
    if ((className || "").indexOf("gantt_task_cell") >= 0) return null;

    var attribute = arguments[1] || this.config.task_attribute;

    while (trg){
        if (trg.getAttribute){	//text nodes has not getAttribute
            var test = trg.getAttribute(attribute);
            if (test) return test;
        }
        trg=trg.parentNode;
    }
    return null;
};
gantt._get_target_node = function(e){
  var trg;
  if (e.tagName)
    trg = e;
  else {
    e=e||window.event;
    trg=e.target||e.srcElement;
  }
  return trg;
};
gantt._trim = function(str){
  var func = String.prototype.trim || function(){ return this.replace(/^\s+|\s+$/g, ""); };
  return func.apply(str);
};

gantt._locate_css = function(e, classname, strict){
  if(strict === undefined)
    strict = true;

  var trg = gantt._get_target_node(e);
  var css = '';
  var test = false;
  while (trg){
    css = trg.className;
    if(css && !css.indexOf){
      //'className' exist but not a string - IE svg element in DOM
      css = '';
    }

    if(css){
      var ind = css.indexOf(classname);
      if (ind >= 0){
        if (!strict)
          return trg;

        //check that we have exact match
        var left = (ind === 0) || (!gantt._trim(css.charAt(ind - 1)));
        var right = ((ind + classname.length >= css.length)) || (!gantt._trim(css.charAt(ind + classname.length)));

        if (left && right)
          return trg;
      }
    }

    trg=trg.parentNode;
  }
  return null;
};
gantt._locateHTML = function(e, attribute) {
  var trg = gantt._get_target_node(e);
    attribute = attribute || this.config.task_attribute;

    while (trg){
        if (trg.getAttribute){	//text nodes has not getAttribute
            var test = trg.getAttribute(attribute);
            if (test) return trg;
        }
        trg=trg.parentNode;
    }
    return null;
};

gantt.getTaskRowNode = function(id) {
    var els = this.$grid_data.childNodes;
    var attribute = this.config.task_attribute;
    for (var i = 0; i < els.length; i++) {
        if (els[i].getAttribute) {
            var value = els[i].getAttribute(attribute);
            if (value == id) return els[i];
        }
    }
    return null;
};

gantt.getState = function(){
  return {
    drag_id : this._tasks_dnd.drag.id,
    drag_mode : this._tasks_dnd.drag.mode,
    drag_from_start : this._tasks_dnd.drag.left,
    selected_task : this._selected_task,
    min_date : gantt.date.Date(this._min_date),
    max_date : gantt.date.Date(this._max_date),
    lightbox : this._lightbox_id,
    touch_drag : this._touch_drag
  };
};

gantt._checkTimeout = function(host, updPerSecond){
  if(!updPerSecond)
    return true;
  var timeout = 1000/updPerSecond;
  if(timeout < 1) return true;

  if(host._on_timeout)
    return false;

  setTimeout(function(){
    delete host._on_timeout;
  }, timeout);

  host._on_timeout = true;
  return true;
};

gantt.selectTask = function(id){
  if(!this.config.select_task)
    return false;
  if (id){

    if(this._selected_task == id)
      return this._selected_task;

    if(!this.callEvent("onBeforeTaskSelected", [id])){
      return false;
    }

    this.unselectTask(true);
    this._selected_task = id;

    this.refreshTask(id);
    if(this.config.scroll_on_click){
      var task=gantt.getTask(id);
      this.showDate(task.start_date);
    }
    this.callEvent("onTaskSelected", [id]);
  }
  return this._selected_task;
};
gantt.unselectTask = function(ignore){
  var id = this._selected_task;
  if(!id)
    return;
  this._selected_task = null;
  this.refreshTask(id);
  this.callEvent("onTaskUnselected", [id,ignore]);
};
gantt.getSelectedId = function() {
    return dhtmlx.defined(this._selected_task) ? this._selected_task : null;
};

gantt.changeLightboxType = function(type){
  if(this.getLightboxType() == type)
    return true;
  gantt._silent_redraw_lightbox(type);
};

gantt._is_render_active = function(){
  return !this._skip_render;
};

gantt._correct_dst_change = function(date, prevOffset, step, unit){
  var time_unit = gantt._get_line(unit) * step;
  if(time_unit > 60*60 && time_unit < 60*60*24){
    //correct dst change only if current unit is more than one hour and less than day (days have own checking), e.g. 12h
    var offsetChanged = date.getTimezoneOffset() - prevOffset;
    if(offsetChanged){
      date = gantt.date.add(date, offsetChanged, "minute");
    }
  }
  return date;
};

gantt.batchUpdate = function (callback) {
  var call_dp = (this._dp && this._dp.updateMode != "off");
  var dp_mode;
  if (call_dp){
    dp_mode = this._dp.updateMode;
    this._dp.setUpdateMode("off");
  }

  this._skip_render = true;

  try{
    callback();
  }catch(e){

  }

  this._skip_render = false;
  this.render();
  if (call_dp) {
    this._dp.setUpdateMode(dp_mode);
    this._dp.sendData();
  }
};

if(!gantt.config) gantt.config = {};
if(!gantt.config) gantt.config = {};
if(!gantt.templates) gantt.templates = {};

(function(){

dhtmlx.mixin(gantt.config,
  {links : {
    "finish_to_start":"0",
    "start_to_start":"1",
    "finish_to_finish":"2",
    "start_to_finish":"3"
  },
  types : {
    'task':'task',
    'project':'project',
    'milestone':'milestone'
  },
  duration_unit : "day",
  work_time:false,
  correct_work_time:false,
  skip_off_time:false,

  autosize:false,
  autosize_min_width: 0,

  show_links : true,
  show_task_cells : true,
  // replace backgroung of the task area with a canvas img
  static_background: false,
  branch_loading: false,
  show_loading: false,
  show_chart : true,
  show_grid : true,
  min_duration : 60*60*1000,
  xml_date : "%d-%m-%Y %H:%i",
  api_date : "%d-%m-%Y %H:%i",
  start_on_monday: true,
  server_utc : false,
  show_progress:true,
  fit_tasks : false,
  select_task:true,
  scroll_on_click: true,
  preserve_scroll: true,
  readonly:false,

  /*grid */
  date_grid: "%Y-%m-%d",

  drag_links : true,
  drag_progress:true,
  drag_resize:true,
  drag_move:true,
  drag_mode:{
    "resize":"resize",
    "progress":"progress",
    "move":"move",
    "ignore":"ignore",
    "empty":"empty"   // HOSEK
  },
  round_dnd_dates:true,
  link_wrapper_width:20,
  root_id:0,

    autofit: false, // grid column automatic fit grid_width config
  columns: [
    {name:"text", tree:true, width:'*', resize:true },
    {name:"start_date", align: "center", resize:true },
    {name:"duration", align: "center" },
    {name:"add", width:'44' }
  ],

  /*scale*/
  step: 1,
  scale_unit: "day",
  scale_offset_minimal:true,
  subscales : [

  ],

  inherit_scale_class:false,

    time_step: 60,
    duration_step: 1,
  date_scale: "%d %M",
    task_date: "%d %F %Y",
    time_picker: "%H:%i",
    task_attribute: "task_id",
    link_attribute: "link_id",
    layer_attribute: "data-layer",
    buttons_left: [
        "gantt_save_btn",
        "gantt_cancel_btn"
    ],
  _migrate_buttons: {
    "dhx_save_btn":"gantt_save_btn",
    "dhx_cancel_btn":"gantt_cancel_btn",
    "dhx_delete_btn":"gantt_delete_btn"
  },
    buttons_right: [
        "gantt_delete_btn"
    ],
    lightbox: {
        sections: [
            {name: "description", height: 70, map_to: "text", type: "textarea", focus: true},
            {name: "time", type: "duration", map_to: "auto"}
    ],
    project_sections: [
      {name: "description", height: 70, map_to: "text", type: "textarea", focus: true},
      {name: "type", type: "typeselect", map_to: "type"},
      {name: "time", type: "duration", readonly:true, map_to: "auto"}
    ],
    milestone_sections: [
      {name: "description", height: 70, map_to: "text", type: "textarea", focus: true},
      {name: "type", type: "typeselect", map_to: "type"},
      {name: "time", type: "duration", single_date:true, map_to: "auto"}
    ]
    },
    drag_lightbox: true,
    sort: false,
    details_on_create: true,
  details_on_dblclick:true,
  initial_scroll : true,
  task_scroll_offset : 100,

  task_height: "full",//number px of 'full' for row height
  min_column_width:70,

  // min width for grid column (when resizing)
  min_grid_column_width:70,
  // name of the attribute with column index for resize element
  grid_resizer_column_attribute: "column_index",
  // name of the attribute with column index for resize element
  grid_resizer_attribute: "grid_resizer",

  // grid width can be increased after the column has been resized
  keep_grid_width:false,

  // grid width can be adjusted
  grid_resize:false,

  //
  readonly_property: "readonly",
  editable_property: "editable",
  type_renderers:{},

  open_tree_initially: false,
  optimize_render: 'auto',
  prevent_default_scroll: false

});
gantt.keys={
    edit_save:13,
    edit_cancel:27
};

gantt._init_template = function(name, initial){
  var registeredTemplates = this._reg_templates || {};

  if(this.config[name] && registeredTemplates[name] != this.config[name]){
    if(!(initial && this.templates[name])){
      this.templates[name] = this.date.date_to_str(this.config[name]);
      registeredTemplates[name] = this.config[name];
    }
  }
  this._reg_templates = registeredTemplates;
};
gantt._init_templates = function(){
  var labels = gantt.locale.labels;
  labels.gantt_save_btn 	= labels.icon_save;
  labels.gantt_cancel_btn 	= labels.icon_cancel;
  labels.gantt_delete_btn 	= labels.icon_delete;

  //build configuration based templates
  var d = this.date.date_to_str;
  var c = this.config;
  gantt._init_template("date_scale", true);
  gantt._init_template("date_grid", true);
  gantt._init_template("task_date", true);

  dhtmlx.mixin(this.templates,{
    xml_date:this.date.str_to_date(c.xml_date,c.server_utc),
    xml_format:d(c.xml_date,c.server_utc),
    api_date:this.date.str_to_date(c.api_date),
    progress_text:function(start, end, task){return "";},
    grid_header_class : function(column, config){
      return "";
    },

    task_text:function(start, end, task){
      return task.text;
    },
    task_class:function(start, end, task){return "";},
    grid_row_class:function(start, end, task){
      return "";
    },
    task_row_class:function(start, end, task){
      return "";
    },
    task_cell_class:function(item, date){return "";},
    scale_cell_class:function(date){return "";},
    scale_row_class:function(date){return "";},

    grid_indent:function(item) {
      return "<div class='gantt_tree_indent'></div>";
    },
    grid_folder:function(item) {
      if(item.$open||gantt._get_safe_type(item.type)!==gantt.config.types.task){  //  HOSEK
        return "<div class='gantt_tree_icon gantt_folder_" + (item.$open ? "open" : "closed") + "'></div>";
      }else{
        return "<div class='gantt_tree_icon'><div class='gantt_drag_handle gantt_alldirarrow'></div></div>";  // HOSEK
      }
    },
    grid_file:function(item) {
      if(gantt._get_safe_type(item.type)===gantt.config.types.task)
        return "<div class='gantt_tree_icon'><div class='gantt_drag_handle gantt_alldirarrow'></div></div>";  // HOSEK
      return "<div class='gantt_tree_icon gantt_folder_open'></div>";
    },
    grid_open:function(item) {
      return "<div class='gantt_tree_icon gantt_" + (item.$open ? "close" : "open") + "'></div>";
    },
    grid_blank:function(item) {
      return "<div class='gantt_tree_indent'></div>";
    },

    task_time:function(start,end,ev){
        return gantt.templates.task_date(start)+" - "+gantt.templates.task_date(end);
    },
    time_picker:d(c.time_picker),
    link_class : function(link){
      return "";
    },
    link_description : function(link){
      var from = gantt.getTask(link.source),
        to = gantt.getTask(link.target);

      return "<b>" + from.text + "</b> &ndash;  <b>" + to.text+"</b>";
    },

    drag_link : function(from, from_start, to, to_start) {
      from = gantt.getTask(from);
      var labels = gantt.locale.labels;

      var text = "<b>" + from.text + "</b> " + (from_start ? labels.link_start : labels.link_end)+"<br/>";
      if(to){
        to = gantt.getTask(to);
        text += "<b> " + to.text + "</b> "+ (to_start ? labels.link_start : labels.link_end)+"<br/>";
      }
      return text;
    },
    drag_link_class: function(from, from_start, to, to_start) {
      var add = "";

      if(from && to){
        var allowed = gantt.isLinkAllowed(from, to, from_start, to_start);
        add = " " + (allowed ? "gantt_link_allow" : "gantt_link_deny");
      }

      return "gantt_link_tooltip" + add;
    }
    });

  this.callEvent("onTemplatesReady",[]);
};

})();
if (window.jQuery){

(function( $ ){

  var methods = [];
  $.fn.dhx_gantt = function(config){
    config = config || {};
    if (typeof(config) === 'string') {
      if (methods[config] ) {
        return methods[config].apply(this, []);
      }else {
        $.error('Method ' +  config + ' does not exist on jQuery.dhx_gantt');
      }
    } else {
      var views = [];
      this.each(function() {
        if (this && this.getAttribute){
          if (!this.getAttribute("dhxgantt")){
            for (var key in config)
              if (key!="data")
                gantt.config[key] = config[key];

            gantt.init(this);
            if (config.data)
              gantt.parse(config.data);

            views.push(gantt);
          }
        }
      });

      if (views.length === 1) return views[0];
      return views;
    }
  };

})(jQuery);

}

if (window.dhtmlx){

  if (!dhtmlx.attaches)
    dhtmlx.attaches = {};

  dhtmlx.attaches.attachGantt=function(start, end){
    var obj = document.createElement("DIV");
    obj.id = "gantt_"+dhtmlx.uid();
    obj.style.width = "100%";
    obj.style.height = "100%";
    obj.cmp = "grid";

    document.body.appendChild(obj);
    this.attachObject(obj.id);

    var that = this.vs[this.av];
    that.grid = gantt;

    gantt.init(obj.id, start, end);
    obj.firstChild.style.border = "none";

    that.gridId = obj.id;
    that.gridObj = obj;

    var method_name="_viewRestore";
    return this.vs[this[method_name]()].grid;
  };

}
gantt.locale = {
  labels:{
  }
};

gantt.skins.skyblue = {
  config:{
    grid_width:350,
    row_height: 27,
    scale_height: 27,
    link_line_width:1,
    link_arrow_size:8,
    lightbox_additional_height:75
  },
  _second_column_width:95,
  _third_column_width:80
};
gantt.skins.meadow = {
  config:{
    grid_width:350,
    row_height: 27,
    scale_height: 30,
    link_line_width:2,
    link_arrow_size:6,
    lightbox_additional_height:72
  },
  _second_column_width:95,
  _third_column_width:80
};

gantt.skins.terrace = {
  config:{
    grid_width:360,
    row_height: 35,
    scale_height: 35,
    link_line_width:2,
    link_arrow_size:6,
    lightbox_additional_height:75
  },
  _second_column_width:90,
  _third_column_width:70
};
gantt.skins.broadway = {
  config:{
    grid_width:360,
    row_height: 35,
    scale_height: 35,
    link_line_width:1,
    link_arrow_size:7,
    lightbox_additional_height:86
  },
  _second_column_width:90,
  _third_column_width:80,

  _lightbox_template:"<div class='gantt_cal_ltitle'><span class='gantt_mark'>&nbsp;</span><span class='gantt_time'></span><span class='gantt_title'></span><div class='gantt_cancel_btn'></div></div><div class='gantt_cal_larea'></div>",
  _config_buttons_left: {},
  _config_buttons_right: {
    "gantt_delete_btn": "icon_delete",
    "gantt_save_btn": "icon_save"
  }
};

gantt.config.touch_drag = 500; //nearly immediate dnd
gantt.config.touch = true;
gantt.config.touch_feedback = true;

gantt._touch_feedback = function(){
  if(gantt.config.touch_feedback){
    if(navigator.vibrate)
      navigator.vibrate(1);
  }
};

gantt._init_touch_events = function(){
  if (this.config.touch != "force")
    this.config.touch = this.config.touch &&
       ((navigator.userAgent.indexOf("Mobile")!=-1)    ||
        (navigator.userAgent.indexOf("iPad")!=-1)    ||
        (navigator.userAgent.indexOf("Android")!=-1) ||
        (navigator.userAgent.indexOf("Touch")!=-1));

  if (this.config.touch){
    if (window.navigator.msPointerEnabled){
      this._touch_events(["MSPointerMove", "MSPointerDown", "MSPointerUp"], function(ev){
        if (ev.pointerType == ev.MSPOINTER_TYPE_MOUSE ) return null;
        return ev;
      }, function(ev){
        return (!ev || ev.pointerType == ev.MSPOINTER_TYPE_MOUSE);
      });
    } else
      this._touch_events(["touchmove", "touchstart", "touchend"], function(ev){
        if (ev.touches && ev.touches.length > 1) return null;
        if (ev.touches[0])
          return {
            target: ev.target,
            pageX: ev.touches[0].pageX,
            pageY: ev.touches[0].pageY,
            clientX:ev.touches[0].clientX,
            clientY:ev.touches[0].clientY
          };
        else
          return ev;
      }, function(){ return false; });
  }
};


//we can't use native scrolling, as we need to sync momentum between different parts
//so we will block native scroll and use the custom one
//in future we can add custom momentum
gantt._touch_events = function(names, accessor, ignore){
  //webkit on android need to be handled separately
  var dblclicktime = 0;
  var action_mode = false;
  var scroll_mode = false;
  var dblclick_timer = 0;
  var action_start = null;
  var scroll_state;
  var long_tap_timer = null;
  var current_target = null;

  //touch move
  if (!this._gantt_touch_event_ready){
    this._gantt_touch_event_ready = 1;
    dhtmlxEvent(gantt.$container, names[0], function(e){
      if (ignore(e)) return;

      //ignore common and scrolling moves
      if (!action_mode) return;

      if (long_tap_timer) clearTimeout(long_tap_timer);

      var source = accessor(e);
      if (gantt._tasks_dnd.drag.id || gantt._tasks_dnd.drag.start_drag) {
        gantt._tasks_dnd.on_mouse_move(source);
        if (e.preventDefault)
          e.preventDefault();
        e.cancelBubble = true;
        return false;
      }
      if (source && action_start){
        var dx = action_start.pageX - source.pageX;
        var dy = action_start.pageY - source.pageY;
        if (!scroll_mode && (Math.abs(dx) > 5 || Math.abs(dy) > 5)){
          gantt._touch_scroll_active = scroll_mode = true;
          dblclicktime = 0;
          scroll_state = gantt.getScrollState();
        }

        if (scroll_mode){
          gantt.scrollTo(scroll_state.x + dx, scroll_state.y + dy);
          var new_scroll_state = gantt.getScrollState();

          if((scroll_state.x != new_scroll_state.x && dy > 2 * dx) ||
            (scroll_state.y != new_scroll_state.y && dx > 2 * dy ))
          {
            return block_action(e);
          }
        }
      }
      return block_action(e);
    });
  }

  //block touch context menu in IE10
  dhtmlxEvent(this.$container, "contextmenu", function(e){
    if (action_mode)
      return block_action(e);
  });

  //touch start
  dhtmlxEvent(this.$container, names[1], function(e){
    if (ignore(e)) return;
    if (e.touches && e.touches.length > 1){
      action_mode = false;
      return;
    }

    action_mode = true;
    action_start = accessor(e);

    //dbl-tap handling
    if (action_start && dblclicktime){
      var now = gantt.date.Date();
      if ((now - dblclicktime) < 500 ){
        gantt._on_dblclick(action_start);
        block_action(e);
      } else
        dblclicktime = now;
    } else {
      dblclicktime = gantt.date.Date();
    }

    //long tap
    long_tap_timer = setTimeout(function(){
      var taskId = gantt.locate(action_start);
      if(taskId && !gantt._locate_css(action_start, "gantt_link_control") &&  !gantt._locate_css(action_start, "gantt_grid_data")) {
        gantt._tasks_dnd.on_mouse_down(action_start);
        gantt._tasks_dnd._start_dnd(action_start);
        gantt._touch_drag = true;
        cloneTaskRendered(taskId);

        gantt.refreshTask(taskId);

        gantt._touch_feedback();
      }

      long_tap_timer = null;
    }, gantt.config.touch_drag);
  });

  //touch end
  dhtmlxEvent(this.$container, names[2], function(e){
    if (ignore(e)) return;
    if (long_tap_timer) clearTimeout(long_tap_timer);
    gantt._touch_drag = false;
    action_mode = false;
    var source = accessor(e);
    gantt._tasks_dnd.on_mouse_up(source);

    if(current_target) {
      gantt.refreshTask(gantt.locate(current_target));
      current_target.parentNode.removeChild(current_target);
      gantt._touch_feedback();
    }

    gantt._touch_scroll_active = action_mode = scroll_mode = false;
    current_target = null;
  });

  //common helper, prevents event
  function block_action(e){
    if (e && e.preventDefault)
      e.preventDefault();
    (e||event).cancelBubble = true;
    return false;
  }

  function cloneTaskRendered(taskId) {
    var renders = gantt._task_area_pulls;
    var task = gantt.getTask(taskId);
    if(task && gantt.isTaskVisible(taskId)){
      for(var i in renders) {
        task = renders[i][taskId];
        if(task && task.getAttribute("task_id") && task.getAttribute("task_id") == taskId) {
          var copy = task.cloneNode(true);
          current_target = task;
          renders[i][taskId] = copy;
          task.style.display="none";
          copy.className += " gantt_drag_move ";
          task.parentNode.appendChild(copy);
          return copy;
        }
      }
    }
  }
};