package org.wifl.grails.store

import static org.grails.jaxrs.support.ConverterUtils.*
import static org.grails.jaxrs.support.ProviderUtils.*

import grails.converters.JSON
import grails.converters.XML

import javax.ws.rs.Produces
import javax.ws.rs.ext.Provider
import org.grails.jaxrs.support.*

@Provider
@Produces(['application/json', 'application/xml'])
class ProductWriter extends DomainObjectWriterSupport {
    /**
     * Writes a JSON representation of a Product's GORM domain object to entity stream.
     * Excludes the 'class' and 'id' items produced by default producer.
     */
    protected Object writeToJson(Object t, OutputStream entityStream, String charset) {
		if (t instanceof Product) {
	      def writer = new OutputStreamWriter(entityStream, charset)
	      def json = new groovy.json.JsonBuilder()
		  json { 
			  manufacturer t.manufacturer
			  name t.name
			  weight t.weight
	      }
		  json.writeTo(writer)
		  writer.flush()
		  writer.close()
		} else {
		  super.writeToJson(t, entityStream, charset)
		}
    }
	
	/**
	 * Writes an XML representation of a Product's GORM domain object to entity stream.
	 * Excludes the product's @id attribute.
	 */
	protected Object writeToXml(Object t, OutputStream entityStream, String charset) {
		if (t instanceof Product) {
		  def writer = new OutputStreamWriter(entityStream, charset)
		  def xml = new groovy.xml.MarkupBuilder(writer)
		  xml.product {
			  manufacturer t.manufacturer
			  name t.name
			  weight t.weight
		  }
		} else {
		  super.writeToXml(t, entityStream, charset)
		}
	}
}
