package org.wifl.grails.store

import javax.servlet.http.HttpServletRequest

class UriService {

    def requestUri(HttpServletRequest request) {
		request.serverPort == 80 ?
		"${request.scheme}://${request.serverName}${request.requestURI}" :
		"${request.scheme}://${request.serverName}:${request.serverPort}${request.requestURI}"
    }
}
