package org.wifl.grails.store

import static org.grails.jaxrs.support.ConverterUtils.*

import javax.ws.rs.Consumes
import javax.ws.rs.ext.Provider
import org.grails.jaxrs.support.*

@Provider
@Consumes(['application/json', 'application/xml'])
class ProductReader extends DomainObjectReaderSupport {
	
    /**
	 * Construct domain object from json map obtained from entity stream.
	 * If the input does not include the class of the domain object, the
	 * 'type' parameter is used as the domain class.
	 */
    @Override
    protected Object readFromJson(Class type, InputStream entityStream, String charset) {
	    def map = new groovy.json.JsonSlurper().parse(new InputStreamReader(entityStream, charset))
	    if (!map['class']) {
		    map['class'] = type.name
	    }
	    def result = type.metaClass.invokeConstructor(map)

	    // Workaround for http://jira.codehaus.org/browse/GRAILS-1984
	    if (!result.id) {
		    result.id = idFromMap(map)
	    }
	    result
    }
}
