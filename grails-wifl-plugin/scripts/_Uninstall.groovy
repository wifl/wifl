//
// This script is executed by Grails when the plugin is uninstalled from project.
//
// It deletes the plugin's web content.
//
ant.delete(dir: "${basedir}/web-app/wifl")
