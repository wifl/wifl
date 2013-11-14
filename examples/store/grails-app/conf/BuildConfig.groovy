grails.servlet.version = "2.5" // Change depending on target container compliance (2.5 or 3.0)
grails.project.class.dir = "target/classes"
grails.project.test.class.dir = "target/test-classes"
grails.project.test.reports.dir = "target/test-reports"
grails.project.target.level = 1.6
grails.project.source.level = 1.6
//grails.project.war.file = "target/${appName}-${appVersion}.war"

grails.project.dependency.resolution = {
    // inherit Grails' default dependencies
    inherits("global") {
        // specify dependency exclusions here; for example, uncomment this to disable ehcache:
        // excludes 'ehcache'
    }
    log "warn"//"error" // log level of Ivy resolver, either 'error', 'warn', 'info', 'debug' or 'verbose'
    checksums true // Whether to verify checksums on resolve

    repositories {
        inherits true // Whether to inherit repository definitions from plugins

        grailsPlugins()
        grailsHome()
        grailsCentral()

        mavenLocal()
        mavenCentral()

        // uncomment these (or add new ones) to enable remote dependency resolution from public Maven repositories
        //mavenRepo "http://snapshots.repository.codehaus.org"
        //mavenRepo "http://repository.codehaus.org"
        //mavenRepo "http://download.java.net/maven/2/"
        //mavenRepo "http://repository.jboss.com/maven2/"

        // add repo for wifl plugin
        def wiflBase = System.properties["wifl.repository.url"] ?: "http://wifl.org/ivy"
        def wiflResolver = new org.apache.ivy.plugins.resolver.URLResolver()
        wiflResolver.addArtifactPattern(wiflBase + "/[organisation]/[module]/[artifact]-[revision].[ext]")
        wiflResolver.addIvyPattern(wiflBase + "/[organisation]/[module]/[artifact]-[revision].xml") 
        wiflResolver.name = "wifl-repository" 
        wiflResolver.changingPattern = ".*-SNAPSHOT"
        wiflResolver.checkmodified = true
        resolver wiflResolver
    }
    dependencies {
        // specify dependencies here under either 'build', 'compile', 'runtime', 'test' or 'provided' scopes eg.

        // runtime 'mysql:mysql-connector-java:5.1.20'

	// following is required per http://stackoverflow.com/questions/12627147/grails-rendering-plugin-gives-java-lang-classnotfoundexception-when-deployed
	// (without it submitting XML in production environment resulted in 
	// ClassNotFoundException for org.springframework.mock.web.MockHttpServletRequest)
        runtime 'org.springframework:spring-test:3.1.2.RELEASE'
        runtime 'net.sf.saxon:Saxon-HE:9.4'
    }

    plugins {
        runtime ":hibernate:$grailsVersion"
        runtime ":jquery:1.8.0"
        runtime ":resources:1.1.6"
        runtime "org.grails.plugins:jaxrs:0.7"
        runtime "org.wifl:grails-wifl:0.3"

        // Uncomment these (or add new ones) to enable additional resources capabilities
        //runtime ":zipped-resources:1.0"
        //runtime ":cached-resources:1.0"
        //runtime ":yui-minify-resources:0.1.4"

        build ":tomcat:$grailsVersion"

        runtime ":database-migration:1.1"

        compile ':cache:1.0.0'
        test ":spock:0.7"
    }
}
//grails.plugin.location.wifl = "../grails-wifl-plugin"
