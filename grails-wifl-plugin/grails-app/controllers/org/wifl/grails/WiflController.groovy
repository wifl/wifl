package org.wifl.grails

class WiflController {

	static def defaultAction = "handle"

	def xsltService

	/**
	 * Transforms the application's WADL file into HTML+WIFL.
	 * The WADL file and the XSLT stylesheet are set in Config.groovy.
	 * @see Config
	 */
	def handle = {
		try {
			String wadlURL = ConfigHelper.wadlParam.url ?: 
				resource(ConfigHelper.wadlParam.resource) 
			String xsltURL = ConfigHelper.xsltParam.url ?:
			    resource(ConfigHelper.xsltParam.resource)
			log.info "wadlURL = ${wadlURL}"
			log.info "xsltURL = ${xsltURL}"
			render xsltService.transform(
				new URL(wadlURL),
				new URL(xsltURL))
		} catch (MalformedURLException mue) {
			render(status:500, contentType:"text/plain", text:"Invalid configuration URL: ${mue.message}")
		} catch (FileNotFoundException fnfe) {
		    render(status:500, contentType:"text/plain", text:"Configuration URL not found: ${fnfe.message}")
		} catch (Exception e) {
			render(status:500, contentType:"text/plain", text:e.class.name+" "+e.message)
		}
	}
}
