package org.wifl.grails.store

class StoreTagLib {
	static namespace = "store"
	
	def uriService
	
	/**
	 * Returns the original URI of the request.
	 */
	def requestUri = { attrs -> 
		out << uriService.requestUri(request)
	}
}
