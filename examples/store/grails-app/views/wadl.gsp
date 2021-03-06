<%@ page contentType="application/vnd.sun.wadl+xml;charset=UTF-8" %><% 
def requestURI = store.requestUri().toString()
def serverURL = new URL(requestURI)
def host = serverURL.port > 0 ? "${serverURL.host}:${serverURL.port}" : serverURL.host
serverURL.path = request.contextPath
def appPath = serverURL.path
def apiPath = "api"
def productsPath = "products"
def apiURL = "$serverURL/$apiPath"
def productsURL = "$apiURL/$productsPath" 
%><?xml version="1.0" encoding="UTF-8"?>
<application xmlns="http://wadl.dev.java.net/2009/02"
  xmlns:wadl="http://wadl.dev.java.net/2009/02" 
  xmlns:xml="http://www.w3.org/XML/1998/namespace"
  xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:html="http://www.w3.org/1999/xhtml"
  xsi:schemaLocation="http://research.sun.com/wadl/2006/10 http://www.w3.org/Submission/wadl/wadl.xsd">

  <doc title="Store Application">
    <html:p>
      This document describes a fictional online store application which
      has a RESTful API.
      The application supports listing the products it offers, adding new
      products,  getting detailed product information, updating products, and 
      deleting products. The description is marked up with
      <html:a href="http://www.w3.org/TR/rdfa-core/">RDFa</html:a>
      using the
      <html:a href="http://wifl.org/spec/">WIFL vocabulary</html:a>
      .
    </html:p>
  </doc>

  <grammars>
    <include href="${apiURL}/schema" />
  </grammars>

  <resources base="${apiURL}/">
    <doc>
      <html:p>
        The application's API is found at  ${apiURL}.
        It has a container resource of all products at
        <html:span class="uri">${productsURL}</html:span>
        and it has an item resource for each product at
        <html:span class="uri">${productsURL}/{id}</html:span>
        , where <html:span class="pathParam">{id}</html:span>
        is the product's identifier.
      </html:p>
    </doc>

    <resource id="Products" path="${productsPath}">
      <doc>
        <html:p>The store's container resource at the /${apiPath}/${productsPath} URI
          supports the GET and POST methods.</html:p>
      </doc>
      <param href="#API_key" />

      <method id="Products_GET" name="GET">
        <doc>
          To get a listing of all the products in the store, a client
          sends a  GET request to the resource.
        </doc>
        <request>
          <param id="Start_index" name="start-index" style="query"
            type="xsd:int" default="1">
            <doc>The starting index of the requested products.</doc>
          </param>
          <param id="Max_results" name="max-results" style="query"
            type="xsd:int" default="10">
            <doc>The maximum number of results to be returned.</doc>
          </param>
        </request>
        <response status="200">
          <doc>
            The application returns an HTTP response with a status code of
            200  and a listing of all the products' URIs in the form of a
            text/uri-list.
          </doc>
          <representation id="Product_List" mediaType="text/uri-list">
            <doc>A list of product URIs.</doc>
          </representation>
        </response>
      </method>
      <method id="Products_POST" name="POST">
        <doc>
          To add a new product to the store, a client sends a
          POST request to  the <html:span class="uri">/${apiPath}/${productsPath}</html:span>
          URI. The POST body includes a representation of the new product.
        </doc>
        <request>
          <representation href="#Product_JSON"/>
        </request>
        <response status="201">
          <doc>The application returns an HTTP response with status 201 to 
            indicate the resource has been created, 
            a <html:span class="header">Location</html:span>
            header with the new resource's URI, and a representation of the
            resource in the body.
          </doc>
          <representation href="#Product_JSON" />
        </response>
        <response status="400">
          <doc>
            If it does not, the application returns an HTTP response with status
            400.</doc>
        </response>
      </method>
      <resource id="Product" path="{productId}">
        <doc>
          <html:p>
            Each product in the store is represented by an item resource at
            <html:span class="uri">/${apiPath}/${productsPath}/{id}</html:span>
            .
            The product resource has a required 'id' path parameter.
          </html:p>
        </doc>
        <param id="Product_ID" name="productId" style="template" type="xsd:int" 
          required="true">
          <doc>The product identifier.</doc>
        </param>
        <param href="#API_key" />
        <method id="Product_GET" name="GET">
          <doc>
            <html:p>
              To get a detailed listing of a product, a client sends a
              GET to the product's URI.
              To access the listing for product 675, the product
              identifier is substituted into
              <html:span class="uri">/${apiPath}/${productsPath}/{id}</html:span>
              to get the product's URI.
            </html:p>
          </doc>
          <response status="200">
            <doc>
              If the product exists, the server returns a 200
              containing its JSON representation.
            </doc>
            <representation href="#Product_JSON" />
          </response>
        </method>

        <method id="Product_PUT" name="PUT">
          <doc>
            <html:p>To update an existing product's description, a client sends a
              PUT request to the product's URI with the body containing 
              the new description.</html:p>
          </doc>
          <request>
            <representation href="#Product_JSON" />
          </request>
          <response status="204">
            <doc>A 204 response indicates that the
              representation now matches that which was uploaded.</doc>
          </response>
        </method>

        <method id="Product_DELETE" name="DELETE">
          <doc>
            <html:p>When a client wishes to delete a product from the store, it
              sends a  DELETE request to the product's URI.</html:p>
          </doc>
          <response status="204">
            <doc>The store returns a 204 if the product was deleted.</doc>
          </response>
        </method>
      </resource>
    </resource>
    
    <resource id='Bonus' type="#Bonus_Type" path="bonus/{p}">
      <doc>This is a Bonus resource with a resource type.</doc>
      <param name='p' style="template" type="xsd:string"/>
      <method name="GET">
        <request>
          <param name="qg" style="query"/>
        </request>
      </method>
    </resource>
  </resources>

  <resource_type id="Bonus_Type">
    <doc>This is a basic resource type.</doc>
    <param name='q' style='query' type='xsd:int'>
      <doc>The most important query parameter.</doc>
    </param>
    <param name='h' style='header' type='xsd:int'>
      <doc>The most important header parameter.</doc>
    </param>
    <method name='OPTIONS'>
      <doc>To get the currently supported bonus options.</doc>
    </method>
    <resource id="Double_Bonus" path="double">
      <doc>A sub-resource of a Bonus_Type resource.</doc>
      <method name="GET">
        <doc>To get the secret double bonus code.</doc>
      </method>
    </resource>
  </resource_type>
  
  <param id="API_key" name="apikey" style="query" required="true"
    type="xsd:string">
    <doc>The store assigns an API key to each authorized application.
      It must be included in the query string of each request.</doc>
  </param>
  
  <representation id="Product_JSON" mediaType="application/json">
    <doc>
      The product representation has a media type of
      application/json and must conform to the schema at
      ${apiURL}/schema.
    </doc>
  </representation>
</application>
