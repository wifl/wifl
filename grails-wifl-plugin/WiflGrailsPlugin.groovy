import java.util.logging.Logger;
import org.wifl.grails.ConfigHelper

class WiflGrailsPlugin {
    // the plugin version
    def version = "0.3"
    // the version or versions of Grails the plugin is designed for
    def grailsVersion = "2.1 > *"
    // the other plugins this plugin depends on
    def dependsOn = [:]
    // resources that are excluded from plugin packaging
    def pluginExcludes = [
        "grails-app/views/error.gsp",
        "lib/**"
    ]

    def author = "Peter Danielsen"
    def authorEmail = "pdanielsen@alcatel-lucent.com"
    def title = "HTML+WIFL Generator"
    def description = '''\\
Generates HTML+WIFL from a WADL file.  The generated document includes
a console for interactive testing of the application's REST API.  Its
URL is <app server URL>/application.wifl.

This plugin has two configuration parameters: ${ConfigHelper.WADL_PARAM} and
${ConfigHelper.XSLT_PARAM}.  ${ConfigHelper.WADL_PARAM} specifies the
location of the source WADL document.  ${ConfigHelper.XSLT_PARAM} specifies
the location of the XSLT document to transform the WADL to HTML+WIFL. 
Each parameter contains a map with two keys: 'url' and/or
'resource'.  The value of 'url' must be an absolute URL.  The value of
'resource' must be a map whose keys are those of the Grails 'resource' tag.
The 'url' value takes precedence when 'url' and 'resource' are both present.

The default value of ${ConfigHelper.WADL_PARAM} is $DEFAULT_WADL_PARAM
The default value of ${ConfigHelper.XSLT_PARAM} is $DEFAULT_XSLT_PARAM 
'''

    // URL to the plugin's documentation
    def documentation = "http://grails.org/plugin/wifl"
	
	// Default configuration parameter values
	def DEFAULT_WADL_PARAM = [resource:[file:'application.wadl', absolute:true]]
	def DEFAULT_XSLT_PARAM = [resource:[dir:"wifl/xsl", file:'wadl-console.xsl', absolute:true]]

    // Extra (optional) plugin metadata

    // License: one of 'APACHE', 'GPL2', 'GPL3'
//    def license = "APACHE"

    // Details of company behind the plugin (if there is one)
//    def organization = [ name: "My Company", url: "http://www.my-company.com/" ]

    // Any additional developers beyond the author specified above.
//    def developers = [ [ name: "Joe Bloggs", email: "joe@bloggs.net" ]]

    // Location of the plugin's issue tracker.
//    def issueManagement = [ system: "JIRA", url: "http://jira.grails.org/browse/GPMYPLUGIN" ]

    // Online location of the plugin's browseable source code.
//    def scm = [ url: "http://svn.codehaus.org/grails-plugins/" ]

    def doWithWebDescriptor = { xml ->
        // TODO Implement additions to web.xml (optional), this event occurs before
    }

    def doWithSpring = {
        // TODO Implement runtime spring config (optional)
    }

    def doWithDynamicMethods = { ctx ->
        // TODO Implement registering dynamic methods to classes (optional)
    }
	
    def doWithApplicationContext = { applicationContext ->
		// Set defaults if not already set by application
		if (!ConfigHelper.wadlParam) {
			ConfigHelper.wadlParam = DEFAULT_WADL_PARAM
		}
		if (!ConfigHelper.xsltParam) {
			ConfigHelper.xsltParam = DEFAULT_XSLT_PARAM
		}
		logParams(log)
    }
	
	private void logParams(log) {
		log.info "grailsApplication.config.${ConfigHelper.WADL_PARAM} = ${ConfigHelper.wadlParam}"
		log.info "grailsApplication.config.${ConfigHelper.XSLT_PARAM} = ${ConfigHelper.xsltParam}"
    }

    def onChange = { event ->
        // TODO Implement code that is executed when any artefact that this plugin is
        // watching is modified and reloaded. The event contains: event.source,
        // event.application, event.manager, event.ctx, and event.plugin.
    }

    def onConfigChange = { event ->
        // Executed when the project configuration changes.
        // The event is the same as for 'onChange'.
		logParams(log)
    }

    def onShutdown = { event ->
        // TODO Implement code that is executed when the application shuts down (optional)
    }
}
