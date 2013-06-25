package org.wifl.grails.store

class RestErrorController {

    def index() { 
		def exception = request.exception
		def message = ""
		while (exception) {
			message = exception.message
			if (exception instanceof groovy.json.JsonException ||
				exception instanceof org.xml.sax.SAXParseException ||
				exception instanceof java.util.NoSuchElementException) {
				render(status:400, contentType:"application/xml", model:[message:message], view:'/error')
				return
			}
			exception = exception.cause
		}
		render(status:500, contentType:"application/xml", model:[message:message], view:'/error')
	}
}
