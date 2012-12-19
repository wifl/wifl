define(["jquery","jquery-ui","wifl","validator"],function($,jqueryUI,wifl,validator) {

  // A recursive version of append that iterates through arrays.
  // This is a work-around for http://bugs.jquery.com/ticket/8897
  $.fn.appendAll = function() {
    for (var i=0; i<arguments.length; i++) {
      var argument = arguments[i];
      if ($.isArray(argument)) {
        this.appendAll.apply(this,argument);
      } else if (argument !== undefined) {
        this.append(argument);
      }
    }
    return this;
  }

  // Copy the computed CSS from each of the $from elements
  // to the current element.
  $.fn.copyComputedCSS = function($from) {
    if ($from.length) {
      var from = $from[0];
      var fromStyles = getComputedStyle(from);
      for (var i=0; i<this.length; i++) {
        var to = this[i];
        var toStyles = getComputedStyle(to);
        for (var j=0; j<fromStyles.length; j++) {
          var property = fromStyles[j];
          var fromValue = fromStyles.getPropertyValue(property);
          var toValue = toStyles.getPropertyValue(property);
          if (toValue !== fromValue) {
            to.style.setProperty(property,fromValue);
          }
        }
      }
    }
    return this;
  }

  // Ditto but for styled CSS (e.g. expicitly added with .css).
  $.fn.copyStyledCSS = function($from) {
    if ($from.length) {
      var from = $from[0];
      var fromStyles = from.style;
      for (var i=0; i<this.length; i++) {
        var to = this[i];
        var toStyles = to.style;
        for (var j=0; j<fromStyles.length; j++) {
          var property = fromStyles[j];
          var fromValue = fromStyles.getPropertyValue(property);
          var toValue = toStyles.getPropertyValue(property);
          if (toValue !== fromValue) {
            to.style.setProperty(property,fromValue);
          }
        }
      }
    }
    return this;
  }

  // Create an element, and append nodes to it.
  // Naming convention: jQuery-wrapped DOM nodes start with $.
  function $element(name) {
    return function () {
      var $node = $(name);
      return $node.appendAll.apply($node,arguments);
    }
  }

  // The elements used in this script
  var $a = $element("<a>");
  var $button = $element("<button>");
  var $div = $element("<div>");
  var $form = $element("<form>");
  var $h3 = $element("<h3>");
  var $input = $element("<input>");
  var $option = $element("<option>");
  var $pre = $element("<pre>");
  var $span = $element("<span>");
  var $select = $element("<select>");
  var $textarea = $element("<textarea>");
  var $table = $element("<table>");
  var $tr = $element("<tr>");
  var $th = $element("<th>");
  var $td = $element("<td>");
  var $ul = $element("<ul>");
  var $li = $element("<li>");
  
  // Sigh...
  function reason(xhr) {
    switch (xhr.status) {
    case 0:   return "Network Error";
    case 100: return "Continue";
    case 101: return "Switching Protocols";
    case 200: return "OK";
    case 201: return "Created";
    case 202: return "Accepted";
    case 203: return "Non-Authoritative Information";
    case 204: return "No Content";
    case 205: return "Reset Content";
    case 206: return "Partial Content";
    case 300: return "Multiple Choices";
    case 301: return "Moved Permanently";
    case 302: return "Found";
    case 303: return "See Other";
    case 304: return "Not Modified";
    case 305: return "Use Proxy";
    case 307: return "Temporary Redirect";
    case 400: return "Bad Request";
    case 401: return "Unauthorized";
    case 402: return "Payment Required";
    case 403: return "Forbidden";
    case 404: return "Not Found";
    case 405: return "Method Not Allowed";
    case 406: return "Not Acceptable";
    case 407: return "Proxy Authentication Required";
    case 408: return "Request Time-out";
    case 409: return "Conflict";
    case 410: return "Gone";
    case 411: return "Length Required";
    case 412: return "Precondition Failed";
    case 413: return "Request Entity Too Large";
    case 414: return "Request-URI Too Large";
    case 415: return "Unsupported Media Type";
    case 416: return "Requested range not satisfiable";
    case 417: return "Expectation Failed";
    case 500: return "Internal Server Error";
    case 501: return "Not Implemented";
    case 502: return "Bad Gateway";
    case 503: return "Service Unavailable";
    case 504: return "Gateway Time-out";
    case 505: return "HTTP Version not supported";
    default:  return xhr.statusText;
    }
  }

  // Parsing (and resolving) a URI using the DOM.
  function parseURI(uri) {
    var node = document.createElement("a");
    node.href = uri;
    return {
      host: node.host,
      relative: node.pathname + node.search + node.hash
    };
  }

  // Display an HTTP request.
  function $httpRequest(req) {
    var parsed = parseURI(req.uri);
    function header(name) { return name + ": " + req.headerParams[name] }
    var headers = Object.keys(req.headerParams).sort().map(header);
    if (parsed.host) { headers.push("Host: " + parsed.host); }
    if (req.contentType) { headers.push("Content-Type: " + req.contentType); }
    if (req.body) { headers.push("Content-Length: " + req.body.length); }
    return $div(
      $div().text(req.method + " " + parsed.relative + " HTTP/1.1").addClass("wifl-http-method"),
      $div().text(headers.join("\n")).addClass("wifl-http-headers"),
      $div().text(req.body).addClass("wifl-http-body")
    ).addClass("wifl-http-request");
  }

  // Display an HTTP response
  function $httpResponse(xhr) {
    var status = xhr.status + " " + reason(xhr);
    var headers = xhr.getAllResponseHeaders();
    var body = xhr.responseText;
    if (body) { headers = headers + "Content-Length: " + body.length }
    return $div(
      $div().text(status).addClass("wifl-http-status"),
      $div().text(headers).addClass("wifl-http-headers"),
      $div().text(body).addClass("wifl-http-body")
    ).addClass("wifl-http-response");
  }

  // Create an HTTP request using jQuery ajax.
  function httpRequest(req) {
    var settings = {
      type: req.method,
      url: req.uri,
      headers: req.headerParams,
      dataType: "text"
    };
    if (req.contentType) { settings.contentType = req.contentType; }
    if (req.body) { settings.data = req.body; }
    return $.ajax(settings);
  }

  // Display a table row for a parameter as an editable text field.
  // When the field value changes, it updates the params object.
  function $parameter(params) { return function(parameter) {
    var $pname = $div(parameter.name).addClass("wifl-parameter-name");
    var $pvalue = $input().attr("name",parameter.name).attr("type","text").addClass("wifl-parameter-value");
    var $result = $div($pname,$pvalue).addClass("wifl-parameter");
    var pdefault = parameter["default"];
    var pinit = params[parameter.name];
    if (pdefault === undefined) { pdefault = ""; }
    if (pinit === undefined) { pinit = pdefault; }
    function update() {
      var value = $pvalue.val();
      if (value === pdefault) {
        delete params[parameter.name];
        $pvalue.addClass("wifl-default-value");
      } else {
        params[parameter.name] = value;
        $pvalue.removeClass("wifl-default-value");
      }
      $result.attr("title","Validating");
      $result.removeClass("wifl-valid wifl-invalid").addClass("wifl-validating"); 
      validator.checkParam(value,parameter).done(function() { 
        if (value === $pvalue.val()) {
          $result.attr("title","Valid");
          $result.removeClass("wifl-validating").addClass("wifl-valid"); 
        }
      }).fail(function(err) { 
        if (value === $pvalue.val()) {
          $result.attr("title",err);
          $result.removeClass("wifl-validating").addClass("wifl-invalid");
        }
      });
    }
    $pvalue.attr("value",pinit);
    update();
    if (parameter.descriptions.length) {
      $result.attr("title",parameter.descriptions.join("\n"));
    }
    // Sigh, keypress and paste events are fired *before* the DOM value
    // is updated, so we have to set a timeout to call us back after the
    // new value has been set.
    $pvalue.bind("change keypress paste",function() { setTimeout(update,0); });
    return $result;
  }; }

  function $representations(req,representations) {
    if (representations.length) {
      function $opt(representation) {
        var $result = $option(representation.contentType);
        if (representation.descriptions.length) {
          $result.attr("title",representation.descriptions.join("\n"));
        }
        if (representation.contentType && representation.contentType === req.contentType) {
          $result.attr("selected",true);
        }
        return $result;
      }
      var $lab = $div("Representation").addClass("wifl-parameter-name");
      var $sel = $select(representations.map($opt)).addClass("wifl-representation-type");
      var $ta = $textarea().val(req.body).addClass("wifl-representation-body");
      var $result = $div($lab,$sel,$ta).addClass("wifl-representation");
      var updating;
      function update() {
        var body = req.body = $ta.val();
        if (body) {
          if (!updating) {
            var contentType = req.contentType = $sel.val();
            updating = true;
            $lab.attr("title","Validating");
            $result.removeClass("wifl-valid wifl-invalid").addClass("wifl-validating");
            validator.checkRepr(req.body,req.contentType,representations).done(function() {
              updating = false;
              if (body === $ta.val() && contentType === $sel.val()) {
        	$lab.attr("title","Valid");
        	$result.removeClass("wifl-validating").addClass("wifl-valid");
              } else {
        	update();
              }
            }).fail(function(err) {
              updating = false;
              if (body === $ta.val() && contentType === $sel.val()) {
        	$lab.attr("title",err);
        	$result.removeClass("wifl-validating").addClass("wifl-invalid");
              } else {
        	update();
              }
            });
          }
        } else {
          delete req.contentType;
          $result.removeClass("wifl-invalid wifl-validating").addClass("wifl-valid");
        }
      }
      update();
      $result.bind("change keypress paste",function() { setTimeout(update,0); });
      return $result;
    }
  }

  // Display a request.
  // When the submit button is pressed, it creates an HTTP request,
  // and displays the result.
  function $request(request,uriParams,headerParams,contentType,body) {
    uriParams = uriParams || {};
    headerParams = headerParams || {};
    body = body || "";
    var req = {
      method: request.method,
      uriTemplate: request.uriTemplate,
      uriParams: uriParams,
      headerParams: headerParams,
      body: body
    }
    if (contentType) {
      req.contentType = contentType;
    }
    var $httpReq = $div().addClass("wifl-http-request");
    var $httpResp = $div().addClass("wifl-http-response");
    var $resetButton = $input("Reset").attr("type","reset").button().addClass("wifl-reset-button");
    var $submitButton = $button(req.method).button().addClass("wifl-submit-button");
    var $requestForm = $form(
      $div(request.pathParams.map($parameter(uriParams))).addClass("wifl-path-params"),
      $div(request.queryParams.map($parameter(uriParams))).addClass("wifl-query-params"),
      $div(request.headerParams.map($parameter(headerParams))).addClass("wifl-header-params"),
      $representations(req,request.representations),
      $div($resetButton,$submitButton).addClass("wifl-buttons")
    ).addClass("wifl-form");
    $requestForm.submit(function() {
      try {
        req.uri = req.uriTemplate.expand(req.uriParams);
        $httpReq = $httpRequest(req).replaceAll($httpReq);
        $httpResp = $div().addClass("wifl-http-response wifl-in-progress").replaceAll($httpResp);
        var xhr = httpRequest(req);
        xhr.always(function () {
          $httpResp = $httpResponse(xhr).replaceAll($httpResp);
        });
      } catch (err) {
        $httpReq = $div(err.toString()).addClass("wifl-http-request wifl-http-error").replaceAll($httpReq);
      } finally {
        return false;
      }
    });
    $requestForm.bind("reset",function() {
      $requestForm.find(":input").change();
    });
    return $div($requestForm,$httpReq,$httpResp).addClass("wifl-console-body");;
  }

  function $console(api) {
    var $window = $(window);
    var $selectRequest = $select().addClass("wifl-select-request");
    var resources = {};
    var requests = {};
    var $optionResources = api.resources.map(function(resource) {
      if (resource.requests.length) {
        resources[resource] = resource;
        return $option(resource.path).attr("value",resource);
      }
    });
    var $selectResource = $select($optionResources).addClass("wifl-select-resource");
    var $closeConsole = $button("\u00d7").addClass("wifl-console-hide");
    var $resizer = $div().addClass("wifl-console-resizer");
    var $head = $div($selectRequest,$selectResource,$closeConsole).addClass("wifl-console-head");
    var $body = $div().addClass("wifl-console-body");
    var $result = $div($resizer,$head,$body).addClass("wifl-console");
    $selectResource.change(function() {
      var resource = resources[$selectResource.val()];
      var $optionRequests = resource.requests.map(function(request) {
        requests[request] = request;
        return $option(request.method).attr("value",request);
      });
      $selectRequest.empty().appendAll($optionRequests).change();
    });
    $selectRequest.change(function() {
      var request = requests[$selectRequest.val()];
      $result.find(".wifl-console-body").replaceWith($request(request));
    });
    $selectResource.change();
    $resizer.mousedown(function(event) {
      var screenY = event.screenY;
      var consoleHeight = $result.height();
      var bodyHeight = $body.height();
      function onmove(event) {
        var deltaY = event.screenY - screenY;
        $result.height(consoleHeight + screenY - event.screenY);
        $window.resize();
      }
      document.body.style.cursor = "ns-resize";
      $window.on("mousemove",onmove);
      $window.on("mouseup",function() {
        document.body.style.cursor = "default"; 
        $window.off("mousemove",onmove); 
      });
      event.preventDefault();
    });
    return $result;
  }

  function validateExample(example,api,$node,$console) {
    var request = api.lookup(example.request.method,example.request.uri);
    var body = example.request.body;
    var contentType = example.request.headers["Content-Type"];
    $node.addClass("wifl-example wifl-console-show");
    if (request) {
      var uriParams = request.uriTemplate.parse(example.request.uri);
      var headerParams = {};
      for (var i=0; i<request.headerParams.length; i++) {
        var name = request.headerParams[i].name;
        if (example.request.headers.hasOwnProperty(name)) {
          headerParams[name] = example.request.headers[name]
        }
      }
      $node.addClass("wifl-example-validating");
      validator.checkExample(example,request).done(function() {
        $node.removeClass("wifl-example-validating").addClass("wifl-example-valid");
      }).fail(function(error) {
        $node.removeClass("wifl-example-validating").addClass("wifl-example-invalid").attr("title",error);
      });
      $node.click(function() {
        var $body = $request(request,uriParams,headerParams,contentType,body);
        $console.find(".wifl-select-resource").val(request.resource.about).change();
        $console.find(".wifl-select-request").val(request.about).change();
        $console.find(".wifl-console-body").replaceWith($body);
      });
    } else {
      $node.addClass("wifl-example-invalid").title(example.request.uri + " not found");
    }
  }

  function main(api) {
    var $window = $(window);
    var $body = $("body");
    var $copy = $div($body.children()).copyComputedCSS($("<body>")).copyStyledCSS($body);
    var $page = $div($copy).addClass("wifl-page");
    var $cons = $console(api).addClass("wifl-console");
    var $container = $div($page,$cons).addClass("wifl-container");
    $body.append($container);
    $window.resize(function() {
      var consoleH = ($cons.is(":hidden")? 0: $cons.height());
      $page.height($container.height() - consoleH);
      $page.width($container.width());
    });
    api.examples.forEach(function(example) {
      document.getElementsBySubject(example.about).forEach(function (node) {
        validateExample(example,api,$(node),$cons);
      });
    });
    $(".wifl-console-hide").click(function() {
      $cons.hide(); $window.resize();
    });
    $(".wifl-console-show").click(function() {
      $cons.show(); $window.resize();
    });
    $cons.hide();
    $window.resize();
  }

  jQuery(function() { wifl.build(document).wait(main); })

  return {};

});