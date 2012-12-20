package wifl;

/**
 * @opt horizontal
 * @opt nodefillcolor "#ffffdd"
 * @hidden
 */
class UMLOptions {}

// Application

/**
 * @navassoc - queryParam - API_key
 */
class Store {}

// Resources

/**
 * uri-template: "/products"
 * @navassoc - request - Products_GET
 * @navassoc - request - Products_POST
 * @navassoc - super - Store
 * @navassoc - parent - Store
 */
class Products {
}

/**
 * uri-template: "/{id}"
 * @navassoc - request - Product_GET
 * @navassoc - request - Product_PUT
 * @navassoc - request - Product_DELETE
 * @navassoc - response - Product_404
 * @navassoc - pathParam - Product_ID
 * @navassoc - super - Store
 * @navassoc - parent - Products
 */
class Product {}

// Requests

/**
 * @navassoc - queryParam - Start_index
 * @navassoc - queryParam - Max_results
 * @navassoc - response - Products_GET_200
 */
class Products_GET {
	GET verb;
}

/**
 * @navassoc - representation - Product_JSON
 * @navassoc - representation - Product_XML
 * @navassoc - response - Products_POST_201
 * @navassoc - response - Products_POST_400
 */
class Products_POST {
	POST verb;
}

/**
 * @navassoc - response - Product_GET_200
 */
class Product_GET {
	GET verb;
}

/**
 * @navassoc - representation - Product_JSON
 * @navassoc - representation - Product_XML
 * @navassoc - response - Product_PUT_204
 */
class Product_PUT {
	PUT verb;
}

/**
 * @navassoc - response - Product_DELETE_204
 */
class Product_DELETE {
	DELETE verb;
}

// Path Parameters

class Product_ID {}

// Query Parameters

class API_key {}

class Start_index {}

class Max_results {}

// Responses

/**
 * statusCode: 200
 * @navassoc - representation - Product_List
 */
class Products_GET_200 {}

/**
 * statusCode: 201
 * @navassoc - representation - Product_JSON
 * @navassoc - representation - Product_XML
 */
class Products_POST_201 {}

/**
 * statusCode: 400
 */
class Products_POST_400 {}

/**
 * statusCode: 200
 * @navassoc - representation - Product_JSON
 * @navassoc - representation - Product_XML
 */
class Product_GET_200 {}

/**
 * statusCode: 204
 */
class Product_PUT_204 {}

/**
 * statusCode: 204
 */
class Product_DELETE_204 {}

// Representations

/**
 * content-type: "application/json"
 * type: "example-schema.json#/product"
 */
class Product_JSON {}

/**
 * content-type: "application/xml"
 * type: "example-schema.xml#product"
 */
class Product_JSON {}

/**
 * content-type: "text/uri-list"
 */
class Product_List {}

/**
 * @hidden
 */
class GET {}

/**
 * @hidden
 */
class DELETE {}

/**
 * @hidden
 */
class POST {}

/**
 * @hidden
 */
class PUT {}
