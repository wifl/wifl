//
// This script is executed by Grails after plugin was installed in project.
// 
// It creates a directory under web-app for the plugin's web content. 
//
ant.mkdir(dir: "${basedir}/web-app/wifl")
ant.copy(todir: "${basedir}/web-app/wifl") {
	ant.fileset(dir: "${pluginBasedir}/web-app/wifl")
}