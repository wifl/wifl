define(["jquery","jquery-ui"],function($,jqueryUI) {

  // A recursive version of append that iterates through arrays.
  // This is a work-around for http://bugs.jquery.com/ticket/8897
  $.fn.appendAll = function() {
    for (var i=0; i<arguments.length; i++) {
      var argument = arguments[i];
      if ($.isArray(argument)) {
        this.appendAll.apply(this,argument);
      } else {
        this.append(argument);
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
      $div().text(req.method + " " + parsed.relative + " HTTP/1.1").addClass("http-method"),
      $div().text(headers.join("\n")).addClass("http-headers"),
      $div().text(req.body).addClass("http-body")
    );
  }

  // Display an HTTP response
  function $httpResponse(xhr) {
    var status = xhr.status + " " + reason(xhr);
    var headers = xhr.getAllResponseHeaders();
    var body = xhr.responseText;
    if (body) { headers = headers + "Content-Length: " + body.length }
    return $div(
      $div().text(status).addClass("http-status"),
      $div().text(headers).addClass("http-headers"),
      $div().text(body).addClass("http-body")
    );
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
    var $pname = $div(parameter.name).addClass("pname");
    var $pvalue = $input().attr("name",parameter.name).attr("type","text").addClass("pvalue");
    var $result = $div($pname,$pvalue).addClass("parameter");
    var pdefault = parameter.default;
    var pinit = params[parameter.name];
    if (pdefault === undefined) { pdefault = ""; }
    if (pinit === undefined) { pinit = pdefault; }
    $pvalue.attr("value",pinit);
    if (pinit === pdefault) {
      $pvalue.addClass("default-value");
    }
    if (parameter.required) {
      $result.addClass("required");
      if (pinit === "") {
        $result.addClass("invalid");
      }
    }
    if (parameter.descriptions.length) {
      $result.attr("title",parameter.descriptions.join("\n"));
    }
    // Sigh, keypress and paste events are fired *before* the DOM value
    // is updated, so we have to set a timeout to call us back after the
    // new value has been set.
    $pvalue.bind("change keypress paste",function() { setTimeout (function() {
      var value = $pvalue.val();
      if (pdefault === value) {
        delete params[parameter.name];
        $pvalue.addClass("default-value");
      } else {
        params[parameter.name] = $pvalue.val();
        $pvalue.removeClass("default-value");
      }
      if (parameter.required && value === "") {
        $result.addClass("invalid");
      } else {
        $result.removeClass("invalid");
      }
    },0);});
    return $result;
  }; }

  function $representations(req,representations) {
    if (representations.length) {
      function $opt(representation) {
        var $result = $option(representation.contentType);
        if (representation.descriptions.length) {
          $result.attr("title",representation.descriptions.join("\n"));
        }
        return $result;
      }
      var $ta = $textarea(req.body).addClass("request-repr-body");
      var $sel = $select(representations.map($opt)).addClass("request-repr-type");
      return $div($sel,$ta).change(function () {
        req.body = $ta.val();
	if ($ta.val()) {
          req.contentType = $sel.val();
	} else {
	  delete req.contentType;
	}
      });
    }
  }

  // Display a request.
  // When the submit button is pressed, it creates an HTTP request,
  // and displays the result.
  function $request(request,uriParams,headerParams,body) {
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
    var $httpReq = $div();
    var $httpResp = $div();
    var $resetButton = $input("Reset").attr("type","reset").button().addClass("reset-button");
    var $submitButton = $button(req.method).button().addClass("submit-button");
    var $requestForm = $form(
      $div(request.pathParams.map($parameter(uriParams))).addClass("path-params"),
      $div(request.queryParams.map($parameter(uriParams))).addClass("query-params"),
      $div(request.headerParams.map($parameter(headerParams))).addClass("header-params"),
      $representations(req,request.representations),
      $div($resetButton,$submitButton).addClass("request-buttons")
    ).submit(function() {
      try {
        req.uri = req.uriTemplate.expand(req.uriParams);
	$httpReq = $httpRequest(req).replaceAll($httpReq);
	$httpResp = $div().addClass("in-progress").replaceAll($httpResp);
	var xhr = httpRequest(req);
	xhr.always(function () {
	  $httpResp = $httpResponse(xhr).replaceAll($httpResp);
	});
      } catch (err) {
        $httpReq = $div(err).addClass("http-error").replaceAll($httpReq);
      } finally {
        return false;
      }
    }).bind("reset",function() {
      $requestForm.find(":input").change();
    });
    return $div(
      $div(request.descriptions).addClass("description"),
      $table($tr(
        $td($div($requestForm).addClass("request-form")),
        $td($div($httpReq).addClass("http-request")),
        $td($div($httpResp).addClass("http-response"))
      )).addClass("request-controls")
    ).addClass("request");
  }
  
  // Display a resource.
  // This is a series of jQuery tabs, displaying each of its methods.
  var tabIds = 0;
  function $resource(resource) {
    var tabId = tabIds++;
    var $aboutLink = $li($a(resource.path).attr("href","#descr"+tabId));
    var $aboutBody = $div(resource.descriptions)
      .addClass("description").attr("id","descr"+tabId);
    function $requestLink(request) {
      return $li($a(request.method).attr("href","#"+request.method+tabId));
    }
    function $requestBody(request) {
      return $request(request).attr("id",request.method+tabId)
    }
    return $div(
      $ul($aboutLink,resource.requests.map($requestLink)),
      $aboutBody,resource.requests.map($requestBody)
    ).tabs().addClass("resource");
  }

  // Display an example
  function $example(example,api) {
    var request = api.lookup(example.request.method,example.request.uri);
    if (request) {
      var uriParams = request.uriTemplate.parse(example.request.uri);
      var headerParams = {};
      for (var i=0; i<request.headerParams.length; i++) {
        var name = request.headerParams[i].name;
        if (example.request.headers.hasOwnProperty(name)) {
          headerParams[name] = example.request.headers[name]
        }
      }
      return $request(request,uriParams,headerParams,example.request.body);
    } else {
      return $div(example.request.uri + " not found").addClass("ui-state-error");
    }
  }

  return {
    resource: $resource,
    example: $example
  };

});