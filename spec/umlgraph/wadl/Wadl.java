package wadl;

import java.util.*;

/**
 * @opt attributes
 * @opt types
 * @opt nodefillcolor "lightblue"
 * @opt nodefontabstract italic
 * @hidden
 */
class UMLOptions {}

/**
 * @composed - - * Doc
 * @composed - - ? Grammars
 * @composed - - * Resources
 * @composed - - * ResourceType
 * @composed - - * Method
 * @composed - - * Representation
 * @composed - - * Param
 */
class Application {}

/**
 * @hidden
 */
class Doc {
    string title;
    lang lang;
    string text;
}

/**
 * @composed - - * Doc
 * @composed - - * Include
 */
class Grammars {}

/**
 * @hidden
 */
class Id {}

/**
 * @composed 0..* - * Doc
 */
class Include {
    anyURI href;
}

/**
 * @composed - - * Doc
 * @navassoc - - ? ResourceType
 */
class Link {
	nmToken rel;
	nmToken rev;
}

/**
 * @hidden
 */
class LinkRelation {}

/**
 * @composed - - * Doc
 * @composed - - ? Request
 * @composed - - * Response
 */
class Method {
    Id id;
    anyURI href;
    verb name;
}

/**
 * @composed - - * Doc
 */
class Option {
    mediaType mediaType;
    string value;
}

/**
 * @composed - - * Doc
 * @navassoc - - * Option
 * @composed - - ? Link
 */
class Param {
    Id id;
    anyURI href;
    nmToken name;
    paramStyle style;
    dataType type;
    string dfault;
    xPath path;
    boolean required;
    boolean repeating;
    string fixed; 
}

/**
 * @composed - - * Doc
 * @navassoc - - * Param
 */
class Representation {
    Id id;
    anyURI href;
    qName element;
    mediaType mediaType;
    List<anyURI> profile;
}

/**
 * @composed - - * Doc
 * @navassoc - - * Param
 * @navassoc - - * Representation
 */
class Request {}

/**
 * @composed - - * Doc
 * @navassoc - - * Param
 * @navassoc - - * Method
 * @navassoc - - * Resource
 */
class ResourceType {
    Id id;
}

/**
 * @composed - - * Doc
 * @navassoc - - * Param
 * @navassoc - - * Method
 * @navassoc - - * Resource
 * @navassoc - - * ResourceType
 */
class Resource {
    Id id;
    uriTemplate path;
    mediaType queryType;
    List<anyURI> type;
}

/**
 * @composed - - * Doc
 * @composed 1..* - * Resource
 */
class Resources {
    anyURI base;
}

/**
 * @composed - - * Doc
 * @navassoc - - * Param
 * @navassoc - - * Representation
 */
class Response {
    List<statusCode> status;
}

/**
 * @hidden
 */
class uriTemplate {}

/**
 * @hidden
 */
class statusCode {}

/**
 * @hidden
 */
class verb {}

/**
 * @hidden
 */
class xPath {}

/**
 * @hidden
 */
class dataType {}

/**
 * @hidden
 */
class string {}

/**
 * @hidden
 */
class lang {}

/**
 * @hidden
 */
class anyURI {}

/**
 * @hidden
 */
class mediaType {}

/**
 * @hidden
 */
class nmToken {}

/**
 * @hidden
 */
class paramStyle {}

/**
 * @hidden
 */
class token {}

/**
 * @hidden
 */
class qName {}
