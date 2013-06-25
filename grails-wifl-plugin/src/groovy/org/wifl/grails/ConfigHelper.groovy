package org.wifl.grails

import org.codehaus.groovy.grails.commons.ConfigurationHolder

class ConfigHelper {
	static String WADL_PARAM = "org.wifl.grails.wadl"
	static String XSLT_PARAM = "org.wifl.grails.xslt"

	static def getWadlParam() {
		ConfigurationHolder.config.org.wifl.grails.wadl
	}
	
	static void setWadlParam(p) {
		ConfigurationHolder.config.org.wifl.grails.wadl = p
	}
	
	static def getXsltParam() {
		ConfigurationHolder.config.org.wifl.grails.xslt
	}
	
	static void setXsltParam(p) {
		ConfigurationHolder.config.org.wifl.grails.xslt = p
	}

}
