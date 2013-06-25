<% 
def requestURI = store.requestUri().toString()
if (requestURI.endsWith('/')) {
	requestURI = requestURI.substring(0, requestURI.length()-1)
}
def serverURL = new URL(requestURI)
def host = serverURL.port > 0 ? "${serverURL.host}:${serverURL.port}" : serverURL.host
def appPath = serverURL.path
def apiPath = "api"
def apikeyValue = "12ab"
def productsPath = "products"
def apiURL = "$serverURL/$apiPath"
def productsURL = "$apiURL/$productsPath" 
%><?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html
  PUBLIC "-//W3C//DTD XHTML+RDFa 1.1//EN" "http://www.w3.org/MarkUp/DTD/xhtml-rdfa-2.dtd">
<html>
<head>
<title>Web InterFace Language Example</title>
<meta http-equiv="content-type" content="application/xhtml+xml; charset=UTF-8"></meta>
<link rel="stylesheet" type="text/css" href="css/wifl.css"></link>
<link rel="stylesheet" type="text/css" href="wifl/css/wifl-console.css"></link>
<link rel="stylesheet" type="text/css" href="wifl/css/jquery-ui.css"></link>
<script type="text/javascript" src="wifl/js/require-jquery.js"></script>
<script type="text/javascript">
    require.config({ baseUrl: "wifl/js" });
    require(["wifl-console"]);
</script>
</head>

<body prefix="wifl: http://wifl.org/spec/#">
<h1>Web InterFace Language Example</h1>
<div id="intro" class="intro"><h2>Introduction</h2><div>
<p>This document describes a simple application 
having a RESTful API and then explains the <a href="spec/index.html">model</a> 
with examples based on the application. The example is interactive,
using the <a href="#" class="wifl-console-show">WIFL console</a>.
Because this is a live application, console responses may
differ from those in the examples.</p>  
</div></div>
<div class="navbar"><ul><li><a href="#intro">Introduction</a></li><li><a href="#application">Store Application</a></li><li><a href="#explanation">Model Usage</a></li><li><a href="#implementation">Implementation Notes</a></li></ul></div>
<div id="application" class="intro"><h2>Store Application</h2><div prefix="wifl: http://wifl.org/spec/#" vocab="http://wifl.org/spec/#">
 
<p>This section outlines a fictional online store application which has a RESTful API.
The application supports listing the products it offers, adding new products, 
getting detailed product information, updating products, and deleting products.
The description is marked up with <a href="http://www.w3.org/TR/rdfa-core/">RDFa</a>
using the <a href="http://wifl.org/spec/">WIFL vocabulary</a>.</p>

<div about="#Store" typeof="Resource">
<h3>Store Resource</h3>
<p>The application's API is found at 
<span property="path">${apiURL}</span>.
It has a container resource of all products at
<span class="uri">${productsURL}</span> and it has
an item resource for each product at 
<span class="uri">${productsURL}/{id}</span>, where
<span class="pathParam">{id}</span> is the product's identifier.
These are abbreviated to <span class="uri">${appPath}/${apiPath}/${productsPath}</span> and
<span class="uri">${appPath}/${apiPath}/${productsPath}/{id}</span> below.</p>

<p>As a (weak) authentication measure, the store developer decides to 
require clients to identify themselves with a
<span rel="queryParam" resource="#API_key" typeof="Parameter">
<span rel="type" resource="xsd:hexBinary">hex</span> query parameter, 
<span property="name">apikey</span></span>, on each request.</p>
</div>

<div about="#Products" typeof="Resource">
<h3>Products Resource</h3>
<p>The <span rel="parent super" resource="#Store">store's</span> container 
resource at the <span class="uri">${appPath}/${apiPath}<span property="path">/${productsPath}</span></span> URI
supports the GET and POST methods.</p>

<div rel="request" resource="#Products_GET" typeof="Request">
<p>To get a listing of all the products in the store, a client sends a 
<span property="method">GET</span> request to the resource.
<span rel="response" resource="#Products_GET_200" typeof="Response">
The application returns an HTTP response with a status code of 
<span property="status">200</span>
and 
<span rel="representation" resource="#Product_List" typeof="Representation">
a listing of all the products' URIs in the form of a
<span property="contentType">text/uri-list</span></span></span>.</p>

<div class="appl exchange" typeof="Example"><span rel="exampleRequest" typeof="ExampleRequest"><span property="method">GET</span> <span property="uri">${appPath}/${apiPath}/${productsPath}?apikey=${apikeyValue}</span>
<span rel="exampleHeader" typeof="ExampleHeader"><span property="name">Host</span>: <span property="value">${host}</span></span></span>
<span rel="exampleResponse" typeof="ExampleResponse"><span property="status">200</span> OK
<span rel="exampleHeader" typeof="ExampleHeader"><span property="name">Content-Type</span>: <span property="value">text/uri-list</span></span>
<span property="body">${productsURL}/1
..
${productsURL}/10
</span></span></div>

<p>Because the returned list could be quite long, the application offers
the ability to paginate the results using the 
<span rel="queryParam" resource="#Start_index" typeof="Parameter"><span property="name">start-index</span></span> and 
<span rel="queryParam" resource="#Max_results" typeof="Parameter"><span property="name">max-results</span></span> 
query parameters, which are both integers
<span about="#Start_index" rel="type" resource="xsd:nonNegativeInteger"></span>
<span about="#Max_results" rel="type" resource="xsd:nonNegativeInteger"></span>
and default to 
<span about="#Start_index" property="default">1</span> and
<span about="#Max_results" property="default">100</span>, respectively.
To get 50 products starting at the 100th product, the exchange
would look like:</p>

<div class="appl exchange" typeof="Example"><span rel="exampleRequest" typeof="ExampleRequest"><span property="method">GET</span> <span property="uri">${appPath}/${apiPath}/${productsPath}?apikey=${apikeyValue}&amp;start-index=100&amp;max-results=50</span>
<span rel="exampleHeader" typeof="ExampleHeader"><span property="name">Host</span>: <span property="value">${host}</span></span></span>
<span rel="exampleResponse" typeof="ExampleResponse"><span property="status">200</span> OK
<span rel="exampleHeader" typeof="ExampleHeader"><span property="name">Content-Type</span>: <span property="value">text/uri-list</span></span>
<span property="body">${productsURL}/100
..
${productsURL}/149
</span></span></div>
</div>

<div rel="request" resource="#Products_POST" typeof="Request">
<p>To add a new product to the store, a client sends a 
<span property="method">POST</span> request to
the <span class="uri">${appPath}/${apiPath}/${productsPath}</span> URI.  The POST body includes a
representation of the new product.
<span rel="response" resource="#Products_POST_201" typeof="Response">
The application returns an HTTP
response with status <span property="status">201</span> to indicate the
resource has been created, a <span class="header">Location</span> header
with the new resource's URI, and a
<span rel="representation" resource="#Product_JSON">JSON</span> or 
<span rel="representation" resource="#Product_XML">XML</span> 
representation of the resource in the body.
</span></p>

<div class="appl exchange" typeof="Example"><span rel="exampleRequest" typeof="ExampleRequest"><span property="method">POST</span> <span property="uri">${appPath}/${apiPath}/${productsPath}?apikey=${apikeyValue}</span>
<span rel="exampleHeader" typeof="ExampleHeader"><span property="name">Host</span>: <span property="value">${host}</span></span>
<span rel="exampleHeader" typeof="ExampleHeader"><span property="name">Content-Type</span>: <span property="value">application/json</span></span>
<span property="body">{ "manufacturer": "ACME", "name": "Anvil", "weight": 2000 }</span></span>
<span rel="exampleResponse" typeof="ExampleResponse"><span property="status">201</span> Created
<span rel="exampleHeader" typeof="ExampleHeader"><span property="name">Location</span>: <span property="value">${productsURL}/1</span></span>
<span rel="exampleHeader" typeof="ExampleHeader"><span property="name">Content-Type</span>: <span property="value">application/json</span></span>
<span property="body">{ "manufacturer": "ACME", "name": "Anvil", "weight": 2000 }</span></span>
</div>

<p><span rel="representation" resource="#Product_JSON" typeof="Representation">
The submitted representation has a media type of
<span property="contentType">application/json</span> and 
must conform to the <a rel="type" href="example-schema.json#/product">product JSON schema</a>.</span>
<span rel="response" resource="#Products_POST_400" typeof="Response">
If it does not, the application returns an HTTP response with status 
<span property="status">400</span>.</span></p>

<div class="appl exchange" typeof="Example"><span rel="exampleRequest" typeof="ExampleRequest"><span property="method">POST</span> <span property="uri">${appPath}/${apiPath}/${productsPath}?apikey=${apikeyValue}</span>
<span rel="exampleHeader" typeof="ExampleHeader"><span property="name">Host</span>: <span property="value">${host}</span></span>
<span rel="exampleHeader" typeof="ExampleHeader"><span property="name">Content-Type</span>: <span property="value">application/json</span></span>
<span property="body">manufacturer=ACME&amp;name=Anvil&amp;weight=2000</span></span>
<span rel="exampleResponse" typeof="ExampleResponse"><span property="status">400</span> Bad Request</span>
</div>

<p><span rel="representation" resource="#Product_XML" typeof="Representation">
The submitted representation may also be given with content type
<span property="contentType">application/xml</span> using the
<a rel="type" href="example-schema.xsd#product">product XML schema</a>.</span></p>

<div class="appl exchange" typeof="Example"><span rel="exampleRequest" typeof="ExampleRequest"><span property="method">POST</span> <span property="uri">${appPath}/${apiPath}/${productsPath}?apikey=${apikeyValue}</span>
<span rel="exampleHeader" typeof="ExampleHeader"><span property="name">Host</span>: <span property="value">${host}</span></span>
<span rel="exampleHeader" typeof="ExampleHeader"><span property="name">Content-Type</span>: <span property="value">application/xml</span></span>
<span property="body">&lt;product&gt;&lt;manufacturer&gt;ACME&lt;/manufacturer&gt;&lt;name&gt;Safe&lt;/name&gt;&lt;weight&gt;10000&lt;/weight&gt;&lt;/product&gt;</span></span>
<span rel="exampleResponse" typeof="ExampleResponse"><span property="status">201</span> Created
<span rel="exampleHeader" typeof="ExampleHeader"><span property="name">Location</span>: <span property="value">${productsURL}/2</span></span>
<span rel="exampleHeader" typeof="ExampleHeader"><span property="name">Content-Type</span>: <span property="value">application/json</span></span>
<span property="body">{ "manufacturer": "ACME", "name": "Safe", "weight": 10000 }</span></span>
</div>

<p>The products container resource does not support the PUT or DELETE methods.</p>
</div>
</div>

<div resource="#Product" typeof="Resource">
<h3>Product Resource</h3>
<p>Each product in the <span rel="super" href="#Store">store</span> is represented by an item resource at
<span class="uri"><span rel="parent" href="#Products">${appPath}/${apiPath}/${productsPath}</span><span property="path">/{id}</span></span>.
The product resource has a 
<span rel="pathParam" resource="#Product_ID" typeof="Parameter">
<span property="required" content="true">required</span> path parameter
of <span property="name">id</span></span>. 
</p>

<div rel="request" resource="#Product_GET" typeof="Request">
<p>To get a detailed listing of a product, a client sends a 
<span property="method">GET</span> to the product's URI.  
To access the listing for product 1, the product
identifier is substituted into <span class="uri">/${productsPath}/{id}</span>
to get the product's URI:</p>

<div class="appl exchange" typeof="Example"><span rel="exampleRequest" typeof="ExampleRequest"><span property="method">GET</span> <span property="uri">${appPath}/${apiPath}/${productsPath}/1?apikey=${apikeyValue}</span>
<span rel="exampleHeader" typeof="ExampleHeader"><span property="name">Host</span>: <span property="value">${host}</span></span></span>
<span rel="exampleResponse" typeof="ExampleResponse"><span property="status">200</span> OK
<span rel="exampleHeader" typeof="ExampleHeader"><span property="name">Content-Type</span>: <span property="value">application/json</span></span>
<span property="body">{ "manufacturer": "ACME", "name": "Instant Hole" }</span></span>
</div>

<p rel="response" resource="#Product_GET_200" typeof="Response">
If the product exists, the server returns a <span property="status">200</span>
containing its <span rel="representation" resource="#Product_JSON">JSON</span>
or <span rel="representation" resource="#Product_XML">XML</span>
representation.</p>
</div>

<div rel="request" resource="#Product_PUT" typeof="Request">
<p>To update an existing product's description, a client sends a 
<span property="method">PUT</span> request to the
product's URI with the body containing the new description in
<span rel="representation" resource="#Product_JSON">JSON</span> or
<span rel="representation" resource="#Product_XML">XML</span> and returns
<span rel="response" resource="#Product_PUT_204" typeof="Response">a 
<span property="status">204</span> response indicating that the 
representation now matches that which was uploaded</span>.</p>

<div class="appl exchange" typeof="Example"><span rel="exampleRequest" typeof="ExampleRequest"><span property="method">PUT</span> <span property="uri">${appPath}/${apiPath}/${productsPath}/1?apikey=${apikeyValue}</span>
<span rel="exampleHeader" typeof="ExampleHeader"><span property="name">Host</span>: <span property="value">${host}</span></span>
<span rel="exampleHeader" typeof="ExampleHeader"><span property="name">Content-Type</span>: <span property="value">application/json</span></span>
<span property="body">{ "manufacturer": "ACME", "name": "Anvil", "weight": 10000 }</span></span>
<span rel="exampleResponse" typeof="ExampleResponse"><span property="status">204</span> No Content</span>
</div>
</div>

<div rel="request" resource="#Product_DELETE" typeof="Request">
<p>When a client wishes to delete a product from the store, it sends a
<span property="method">DELETE</span> request to the product's URI.  
<span rel="response" resource="#Product_DELETE_204" typeof="Response">The store returns a 
<span property="status">204</span> if the product was deleted.</span></p>

<div class="appl exchange" typeof="Example"><span rel="exampleRequest" typeof="ExampleRequest"><span property="method">DELETE</span> <span property="uri">${appPath}/${apiPath}/${productsPath}/1?apikey=${apikeyValue}</span>
<span rel="exampleHeader" typeof="ExampleHeader"><span property="name">Host</span>: <span property="value">${host}</span></span></span>
<span rel="exampleResponse" typeof="ExampleResponse"><span property="status">204</span> No Content</span>
</div>
</div>

<p rel="response" resource="#Product_404" typeof="Response">
A <span property="status">404</span> Not Found response is returned
if the product id was not found, regardless of the request method.</p>

<p>The product item resources do not support the POST method.</p>
</div>
</div></div>
<div class="navbar"><ul><li><a href="#intro">Introduction</a></li><li><a href="#application">Store Application</a></li><li><a href="#explanation">Model Usage</a></li><li><a href="#implementation">Implementation Notes</a></li></ul></div>
<div id="explanation" class="intro"><h2>Model Usage</h2><div>
<p>The model describes RESTful resources.</p>

<p class="appl commentary">The example application has a 
<span class="rname">store</span> resource, a single 
<span class="rname">products</span>
collection resource and a <span class="rname">product</span>
item resource for each product.
</p>

<p>A resource's location is specified by a URI template.  The template
syntax is defined in <a href="http://tools.ietf.org/html/rfc6570">RFC 6570</a>.
It accommodates parameters in the URI's path and in its query string.</p>

<p class="appl commentary">The <span class="rname">store</span> resource's
URI template is <span class="uri-template">http://${host}/${apiPath}</span>.
The <span class="rname">products</span> resource's 
URI template is <span class="uri-template">/${productsPath}</span>.
The <span class="rname">product</span> URI template is
<span class="uri-template">/{id}</span>.</p>

<p>A resource may have a single parent resource whose URI template is a
prefix to its own.</p>

<p class="appl commentary">The <span class="rname">product</span> resource's
parent is <span class="rname">products</span>, whose parent resource is
<span class="rname">store</span>.
To indicate this, <span class="rname">product</span>'s 
<span class="rprop">parent</span> property is set to
<span class="rname">products</span>, and <span class="rname">products</span>
<span class="rprop">parent</span> property is set to
<span class="rname">store</span>.
Given these relationships and the model's rules, 
the <span class="rname">product</span>'s complete URI template is composed
by combining the URI templates of <span class="rname">store</span>,
<span class="rname">products</span>, and <span class="rname">product</span>
resulting in
<span class="uri-template">${productsURL}/{id}</span>. 
</p>

<p>A resource may support a number of requests.
A request has a required HTTP method, e.g. GET or POST.</p>

<p class="appl commentary">The <span class="rname">products</span> resource 
has two requests: <span class="rname">products_GET</span> and
<span class="rname">products_POST</span>, for the GET and POST methods, 
respectively.
The <span class="rname">product</span> resource has three requests:
<span class="rname">product_GET</span>, <span class="rname">product_PUT</span>,
and <span class="rname">product_DELETE</span>.</p>

<p>A resource may specify a number of responses that are common to all its
requests.</p>

<p class="appl commentary">The <span class="rname">product</span> resource
requires the product id as a path parameter.  If the product id does not
exist, the <span class="rname">product_404</span> response is returned
regardless of whether the request's HTTP method was GET, POST, or PUT.</p>

<p>A request may have parameters.  A parameter may appear in the
HTTP request's URI's path or its query string, or in an HTTP request header.</p>

<p class="appl commentary">The <span class="rname">products_GET</span>
request has two query parameters: <span class="rname">start_index</span>
and <span class="rname">max_results</span>.</p>

<p>A request may also specify zero or more logically equivalent representations.
For instance, a POST or PUT request might accept XML or JSON content.
A request's representation is carried in the HTTP request's message body.</p>

<p class="appl commentary">The <span class="rname">products_POST</span>
request's representation is <span class="rname">product_JSON</span>
or <span class="rname">product_XML</span>,
as is the representation of the <span class="rname">product_PUT</span> 
request.</p>

<p>A request may specify a number of expected responses.
A response indicates its HTTP status codes.
A response may also specify zero or more logically equivalent representations.
For example, a response may return an XML or a JSON representation depending
on the value of a request parameter.
A response's representation is carried in the HTTP response's message body.</p>

<p class="appl commentary">The <span class="rname">products_POST</span> request has
two responses: <span class="rname">products_POST_201</span> indicating
success, and <span class="rname">products_POST_400</span> when the 
submitted representation fails schema validation.
The <span class="rname">products_POST_201</span> has a status code of 200
and a representation of <span class="rname">product_JSON</span>
or  <span class="rname">product_XML</span>.
The <span class="rname">products_POST_400</span> has a status code of 400
and no representation.</p>

<p class="appl commentary">The <span class="rname">product_GET</span> request has two
responses: <span class="rname">product_GET_200</span> for the success case,
and <span class="rname">product_GET_404</span> for the not found case.
The <span class="rname">product_GET_200</span> response's status code is 200
and its representation is <span class="rname">product_JSON</span>
or  <span class="rname">product_XML</span>.
The <span class="rname">product_GET_404</span> response's status code is 404
and it does not have a representation.</p>

<p>A response may specify more than one HTTP status code when they share a set of
representations.
A response may optionally have parameters contained in HTTP response headers.</p>

<p>A representation specifies metadata about an HTTP request's or response's 
message body.  A representation must indicate the content type that is 
conveyed in the <span class="header">Content-Type</span> header.
A representation may optionally indicate the URI of a schema for the message body.
The URI may be that of a type in XML schema, a JSON schema, or a schema or grammar
in another specification language.</p>

<p class="appl commentary">The <span class="rname">product_JSON</span>
representation has a content type of <span class="rvalue">application/json</span>
and a type of <span class="rvalue">example-schema.json#/product</span>.</p>

<p class="appl commentary">The <span class="rname">product_XML</span>
representation has a content type of <span class="rvalue">application/xml</span>
and a type of <span class="rvalue">example-schema.xml#product</span>.</p>

<p>A parameter is required to have a name.
It may specify a type defining the parameter's legal values, 
whether the parameter is required, and a default value for the parameter.</p>

<p class="appl commentary">The <span class="rname">start_index</span> 
parameter's name is <span class="rvalue">start-index</span>, it must
be a non-negative integer, and is optional with a default value of 1.
The <span class="rname">max_results</span> parameter's name is
<span class="rvalue">max-results</span>.  It is also a non-negative
integer, and optional with a default value of 10.</p>

<p>To accommodate parameters that are common to a number of resources or requests,
the model supports parameter inheritance.  
A resource inherits parameters from its super-resource, i.e. the target of
its <span class="rprop">super</span> property.
A request inherits parameters from its resource, including those inherited
by the resource.  For example, if all requests are required to include an
API key in the query string, a new resource may be identified as the
super-resource of all resources.  The super-resource will specify the API key as
a required query parameter, eliminating the need to specify it for each
request.</p>

<p class="appl commentary">When the store developers decided to add the 
API key to all requests, they created the <span class="rname">store</span> 
resource to define an abstract resource type, which has a required 
query parameter <span class="rname">API_key</span> whose name is
<span class="rvalue">apikey</span>.  Each resource specifies the 
<span class="rname">Store</span> resource as a 
<span class="rprop">super</span> resource to inherit its query parameters.
The requests of each resource are then required to
include the <span class="rvalue">apikey</span> query parameter.</p>

<p>As another example, consider a resource that is a specific instance in
a collection.  The instance resource's URI must include the instance's
identifier as a path parameter for any request to get
a representation with a GET, to update it with a PUT, or to DELETE it.
The resource specifies a path parameter for the instance's identifier and
includes the parameter's name in the resource's URI template.</p>

<p class="appl commentary">The <span class="rname">product</span> resource 
has a required path parameter, <span class="rname">product_ID</span>, which applies 
to all its requests, and is referred to in the resource's URI template.</p>

<p>The model of the online store's resources and their relationships is 
shown below.</p>

<img class="umlgraph" src="images/Store.png" alt="Online store application's resources and relationships"></img>
</div></div>

<div class="navbar"><ul><li><a href="#intro">Introduction</a></li><li><a href="#application">Store Application</a></li><li><a href="#explanation">Model Usage</a></li><li><a href="#implementation">Implementation Notes</a></li></ul></div>

<div id="implementation">
<h2>Implementation Notes</h2>

<p>This application was developed with the 
<a href="http://grails.org">Grails</a> framework, the 
<a href="https://code.google.com/p/grails-jaxrs/">JAX-RS</a> plugin,
and the WIFL plugin.</p>

<p>The JAX-RS plugin includes the <a href="http://jersey.java.net">Jersey</a>
reference implementation of <a href="http://jsr311.java.net">JSR-311</a>.
Jersey can automatically generate
<a href="http://wadl.java.net">WADL</a> from JAX-RS annotations in the
source code.  The Jersey-generated WADL for this application is at
<a href="application.wadl">${serverURL}/application.wadl</a>.
</p>

<p>The WIFL plugin provides JavaScript that validates the examples and
generates the <span class="wifl-console-show">interactive console</span>, 
and <a href="http://www.w3.org/TR/xslt20/">XSLT</a> that transforms WADL into
HTML+WIFL.  The plugin-generated HTML+WIFL for this application is at
<a href="application.wifl">${serverURL}/application.wifl</a>.
Having the generated HTML+WIFL simplified testing of the application
while it was being developed because the console was always in sync
with the JAX-RS annotations in the source code. 
</p>
</div>

<div class="navbar"><ul><li><a href="#intro">Introduction</a></li><li><a href="#application">Store Application</a></li><li><a href="#explanation">Model Usage</a></li><li><a href="#implementation">Implementation Notes</a></li></ul></div>
</body>
</html>
