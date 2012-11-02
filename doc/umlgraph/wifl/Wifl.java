package wifl;

/**
 * @opt attributes
 * @opt types
 * @opt nodefillcolor "lightblue"
 * @opt nodefontabstract italic
 * @hidden
 */
class UMLOptions {}

/**
 * @rdf-ns dc http://purl.org/dc/elements/1.1/
 * @rdf-ns maven http://maven.apache.org/POM/3.0.0
 * @hidden
 */
class RDFOptions {}

/**
 * The abstract base class of all classes that may have parameters.
 * 
 * A parameterized object contributes its associated parameters to an HTTP request.
 * The association's name indicates where the parameter appears in the
 * request.
 * @relcomment headerParam A parameter that appears in a request header.
 * @relcomment pathParam A parameter that appears in the path of request's URI.
 * @relcomment queryParam A parameter that appears in a request's query string.
 * @navassoc - headerParam * Parameter
 * @navassoc - pathParam * Parameter
 * @navassoc - queryParam * Parameter
 */
abstract class Parameterized {
}

/**
 * A collection of a resource's sub-resources, requests and their common parameters.
 * 
 * <p>A resource may support a number of different requests.
 * A resource may specify parameters that are common to its requests.</p>
 * 
 * <p>A resource may declare itself to be a sub-resource of another resource by
 * using the <span class="assoc">parent</span> association.
 * A resource may declare its type to be that of another resource with the
 * <span class="assoc">super</span> association.</p>
 * 
 * <p>A resource's complete URI path template is computed by appending its 
 * <span class="attr">path</span> value to the complete URI path template of its 
 * <span class="assoc">parent</span> resource.</p>

 * <p>A resource's complete sets of <span class="assoc">pathParam</span>s,
 * <span class="assoc">queryParam</span>s, and 
 * <span class="assoc">headerParam</span>s include
 * those it specifies directly and those it inherits.
 * A resource inherits <span class="assoc">pathParam</span>s from its
 * <span class="assoc">parent</span> resource, if any.
 * A resource inherits <span class="assoc">queryParam</span>s and
 * <span class="assoc">headerParam</span>s from its
 * <span class="assoc">super</span> resources, if any.
 * If a resource specifies a parameter with the same name as one it inherits,
 * the resource's parameter is used.</p>
 * 
 * <p>A resource's complete set of <span class="assoc">request</span>s and
 * <span class="assoc">response</span>s includes those it specifies directly
 * and the complete sets of its <span class="assoc">super</span> resources.</p>
 * 
 * @relcomment parent A parent that provides a base URI path template and path parameters.
 * @relcomment super Super-resources that provide requests, responses, queryParams, and headerParams.
 * @relcomment request A request supported by the resource.
 * @relcomment response A response that may be returned for one or more requests.
 * @navassoc - parent 0..1 Resource
 * @navassoc - super * Resource
 * @navassoc - request * Request
 * @navassoc - response * Response
 */
class Resource extends Parameterized {
	/**
	 * A URI template for the resource's path.  The path is specified by a URI template, which
	 * conforms to <a href="http://tools.ietf.org/html/rfc6570">RFC 6570</a>, 
	 * excluding 
	 * <a href="http://tools.ietf.org/html/rfc6570#section-3.2.7">Path-style Parameter Expansion</a>,
	 * <a href="http://tools.ietf.org/html/rfc6570#section-3.2.8">Form-style Parameter Expansion</a>,
	 * and
	 * <a href="http://tools.ietf.org/html/rfc6570#section-3.2.9">Form-style Query Continuation</a>.
	 * The path is ignored, and may be omitted, when the resource acts as a 
	 * type for other resources.
	 * @arity 0..1
	 */
    uriTemplate path;
}

/**
 * A request to a resource.
 * 
 * <p>A request has exactly one HTTP method.</p>
 * 
 * <p>A request can support zero or more alternative representations in its body.
 * All of a request's representations are logically equivalent.
 * A GET request typically has an empty body, and would not have any 
 * <span class="assoc">representation</span>
 * associations, while a POST request would have a 
 * <span class="assoc">representation</span> association for
 * each supported content type.
 * A request has a <span class="assoc">response</span> association for each 
 * possible response.</p>
 * 
 * <p>A request's complete set of <span class="assoc">pathParam</span>s
 * is that of its resource.  
 * A request's complete set of <span class="assoc">queryParam</span>s
 * includes those it specifies directly and that of its resource.
 * A request's complete set of <span class="assoc">headerParam</span>s
 * includes those it specifies directly and that of its resource.
 * If a request and its resource have different parameters with the same name,
 * the request's parameter is used.</p>
 *
 *<div>

<p>Given a <span class="class">Request</span> object,
generate an HTTP request by following these steps:</p>

<ol>
<li>Set the HTTP method to the value of the <span class="class">Request</span>'s
<span class="attr">method</span> attribute.</li>

<li>Generate the URL.
<ol type="a">
<li>Create the Request's URI template by 
<ol type="1">
<li>Creating an RFC 6570 URI template expression whose operator is <code>?</code>
and whose variable-list has a varspec for each member of the 
<span class="class">Request</span>'s
complete set of <span class="assoc">queryParam</span>s.
The varspec is a varname whose value is that of  
the <span class="assoc">queryParam</span>'s <span class="attr">name</span>
attribute.</li>
<li>Appending the URI template expression to the 
<span class="class">Request</span>'s <span class="class">Resource</span>'s 
complete URI path
template.</li>
</ol></li>

<li>Create a binding for each <span class="attr">name</span> of the
<span class="class">Request</span>'s
complete set of <span class="assoc">pathParam</span>s and fixed 
or non-default <span class="assoc">queryParam</span>s from the 
<span class="class">Request</span>'s complete set of 
<span class="assoc">queryParam</span>s to the corresponding
value in the run-time environment.</li>
<li>Expand the <span class="class">Request</span>'s 
URI template according to RFC 6570 using the binding 
created in the previous step.</li>
</ol>
</li>

<li>Add the request headers.
<ol type="a">
<li>Create a binding for each <span class="attr">name</span> of the non-default 
<span class="assoc">headerParam</span>s from the 
<span class="class">Request</span>'s complete set of 
<span class="assoc">headerParam</span>s to the corresponding
value in the run-time environment.</li>
<li>For each member of the binding, add an HTTP header where the
header name is the variable's name and the header value is the variable's value.</li>
</ol>
</li>
</ol>

<p>If a <span class="class">Representation</span> is to be submitted in
the HTTP request, include the following steps:</p>
<ol start="4">
<li>Set the HTTP request's <span class="header">Content-Type</span> header 
to the value of the selected Representation's 
<span class="attr">contentType</span> attribute value.</li>

<li>Add the entity body to the HTTP request.</li>
</ol>
</div>

 * @relcomment representation A representation that may be carried by this request.
 * @relcomment response A response that may be returned.
 * @navassoc - representation * Representation
 * @navassoc - response * Response
 */
class Request extends Parameterized {
	/**
	 * The request's HTTP verb (e.g. GET, POST, PUT, DELETE).
	 */
    verb method;
}

/**
 * A response to a request.
 * 
 * A response has a list of possible HTTP status codes.
 * A response can support zero or more alternative representations in its body.
 * All of a response's representations are logically equivalent.
 * @relcomment headerParam A parameter returned in the response header.
 * @relcomment representation A representation carried by the response.
 * @navassoc - headerParam * Parameter
 * @navassoc - representation * Representation
 */
class Response {
	/**
	 * A list of the response's possible HTTP status codes.
	 * @arity 1..*
	 */
    statusCode status;
}

/**
 * A request or response parameter.
 * 
 * @relcomment dataType The parameters datatype. Default: xsd:string.
 * @navassoc - dataType 0..1 DataType
 */
class Parameter {
	/**
	 * The parameter's name.
	 */
    paramName name;
    /**
     * Whether the parameter is required.  Default: false.
     */
    boolean required;
    /**
     * Whether the parameter's value is constant.  If true,
     * the defaultValue must contain the value.  Default: false.
     */
    boolean fixed;
    /**
     * The parameter's default value, if any.
     */
    string defaultValue;
}

/**
 * A reference to a data type.
 * The reference must be resolvable to a <a href="http://tools.ietf.org/html/rfc2396">URI</a>
 * that identifies the data type specification, given in XML Schema.
 */
class DataType {}

/**
 * A resource's representation.
 * 
 * The representation is carried in the body of an HTTP request or response.
 * The following representation instances are pre-defined:
 * <dl>
 * <dt class="instance">wifl:Empty</dt>
 * <dd>The empty representation contains the empty string "".</dd>
 * <dt class="instance">wifl:JSON</dt>
 * <dd>The JSON representation contains a schema-less JSON string.
 * The <span class="attr">contentType</span> is <span class="value">application/json</span>.</dd>
 * <dt class="instance">wifl:XML</dt>
 * <dd>The XML representation contains a schema-less XML document.
 * The <span class="attr">contentType</span> is <span class="value">application/xml</span>.</dd> 
 * </dl>
 * 
 * @relcomment representationType The type of the representation. Default: <a href="http://www.w3.org/TR/rdf-schema/#ch_resource">rdfs:Resource</a>.
 * @navassoc - representationType 0..1 RepresentationType
 */
class Representation {
	/**
	 * The representation's media type.
	 * The value appears in the <span class="header">Content-Type</span> header
	 * of an HTTP request or response.
	 */
    mediaType contentType;
}

/**
 * A URI that refers to a type in a schema.
 * The type definition within the schema specifies the syntax for the
 * representation.
 */

class RepresentationType {}

/**
 * An example of an HTTP message exchange.
 * 
 * @relcomment exampleRequest An example request.
 * @relcomment exampleResponse An example response.
 * @relcomment seeAlso The URI of a related resource.
 * @navassoc - exampleRequest * ExampleRequest
 * @navassoc - exampleResponse * ExampleResponse
 * @navassoc - seeAlso * Thing
 */

class Example {
}

/**
 * An example HTTP request.
 *  
 * @relcomment exampleHeader An example header.
 * @navassoc - exampleHeader * ExampleHeader
 */
class ExampleRequest {
	/**
	 * The request's HTTP verb (e.g. GET, POST, PUT, DELETE).
	 */
    verb method;
    
	/**
	 * The request's URI.
	 */
	anyURI uri;
	
	/**
	 * The request's content, if any.
	 */
	string body;
}

/**
 * An example HTTP header.
 */
class ExampleHeader {
	/**
	 * The header's name.
	 */
	fieldName name;
	
	/**
	 * The header's value.
	 */
	fieldValue value;
}

/**
 * An example HTTP response.
 *  
 * @relcomment exampleHeader An example header.
 * @navassoc - exampleHeader * ExampleHeader
 */
class ExampleResponse {
	/**
	 * The HTTP status code.
	 */
	statusCode status;
	
	/**
	 * The response's content, if any.
	 * If the response's <span class="header">Content-Length</span> is missing,
	 * the body is "" (the empty string).
	 */
	string body;
}

/**
 * An rdfs:Resource.
 */
class Thing {}

/**
 * An HTTP header field name.
 * The name matches the <code>field-name</code> production of
 * <a href="http://tools.ietf.org/html/rfc2616.html#section-4.2">RFC 2616 Section 4.2</a>.
 * @hidden
 */
class fieldName {}

/**
 * An HTTP header field value.
 * The value matches the <code>field-value</code> production of
 * <a href="http://tools.ietf.org/html/rfc2616.html#section-4.2">RFC 2616 Section 4.2</a>.
 * @hidden
 */
class fieldValue {}

/**
 * A URI template.
 * The template conforms to <a href="http://tools.ietf.org/html/rfc6570">RFC 6570</a>
 * @hidden
 */
class uriTemplate {}

/**
 * An XML name token.
 * The token conforms to <a href="http://www.w3.org/TR/xmlschema-2/#NMTOKEN">
 * XML Schema Part 2: Datatypes (NMTOKEN)</a>
 * @hidden
 * @rdf-alias xsd:NMTOKEN
 */
class paramName {}

/**
 * A Uniform Resource Identifier.
 * The URI conforms to <a href="http://www.w3.org/TR/xmlschema-2/#anyURI">
 * XML Schema Part 2: Datatypes (anyURI)</a>
 * @hidden
 * @rdf-alias xsd:anyURI
 */
class anyURI {}

/**
 * A media content type.
 * A media type conforming to 
 * <a href="http://tools.ietf.org/html/rfc2616.html#section-3.7">RFC 2616 Section 3.7</a>.
 * @hidden
 */
class mediaType {}

/**
 * An HTTP method name.
 * Method names are found in 
 * <a href="http://tools.ietf.org/html/rfc2616.html#section-5.1.1">RFC 2616 Section 5.1.1</a> 
 * (e.g. GET, POST, PUT, DELETE).
 * @hidden
 */
class verb {}

/**
 * A character string.
 * The character string conforms to <a href="http://www.w3.org/TR/xmlschema-2/#string">
 * XML Schema Part 2: Datatypes (string)</a>
 * @hidden
 * @rdf-alias xsd:string
 */
class string {}

/**
 * An HTTP status code.
 * A numeric HTTP status code as defined in 
 * <a href="http://tools.ietf.org/html/rfc2616.html#section-6.1.1">RFC 2616 Section 6.1.1</a>. 
 * @hidden
 */
class statusCode {}


/**
 * @view
 * @match class wifl.*
 * @opt hide
 * 
 * @match class wifl.(Parameterized|Parameter|Representation|Request|Resource|Response|RepresentationType|DataType)
 * @opt !hide
 */
class WiflView {}

/**
 * @view
 * @match class wifl.*
 * @opt hide
 * 
 * @match class wifl.(Example|ExampleHeader|ExampleRequest|ExampleResponse)
 * @opt !hide
 */
class ExampleView {}
