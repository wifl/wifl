<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE stylesheet [
<!ENTITY Title "Web InterFace Language">
<!ENTITY Intro "Introduction">
<!ENTITY ObjectClasses "Object Classes">
<!ENTITY DatatypeClasses "Datatype Classes">
<!ENTITY VocabularyPrefix "wifl">
<!ENTITY VocabularyReference "http://wifl.org/spec/#">
]>
<xsl:stylesheet version="1.0"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:include href="umlgraph-html.xsl" />
	<xsl:output method="html" version="1.0" encoding="ISO-8859-1"
		doctype-public="-//W3C//DTD XHTML+RDFa 1.0//EN"
		doctype-system="http://www.w3.org/MarkUp/DTD/xhtml-rdfa-2.dtd"
		indent="yes" />
	<xsl:param name="docdir" select="." />
	
	<xsl:variable name="navbar">
    <div class="navbar">
      <ul>
      <li><a href="#intro">&Intro;</a></li>
      <li><a href="#major">&ObjectClasses;</a></li>
      <li><a href="#attr">&DatatypeClasses;</a></li>
      </ul>
    </div>
	</xsl:variable>
	
	<xsl:template match="/">
		<html xmlns="http://www.w3.org/1999/xhtml">
			<head>
				<title>&Title;</title>
				<link rel="stylesheet" type="text/css" href="spec.css" />
			</head>
			<body prefix="rdfs: http://www.w3.org/2000/01/rdf-schema#
			  &VocabularyPrefix;: &VocabularyReference;">
				<h1>&Title;</h1>
				<div id="intro" class="intro">
					<h2>&Intro;</h2>
					<xsl:copy-of select="document(concat($docdir, '/', 'intro.html'))/*" />
				</div>
				<xsl:copy-of select="$navbar" />
				<xsl:apply-templates select="umlgraph" />
			</body>
		</html>
	</xsl:template>

	<xsl:template match="umlgraph">
		<div class="classes">
			<div id="major" >
				<h2>&ObjectClasses;</h2>
				<xsl:copy-of select="document(concat($docdir, '/', 'object-classes.html'))/*" />
				<xsl:variable name="classes" select="class[association or attribute]" />
				<xsl:call-template name="toc" >
					<xsl:with-param name="caption">&ObjectClasses;</xsl:with-param>
					<xsl:with-param name="classes" select="$classes" />
				</xsl:call-template>
				<xsl:apply-templates select="$classes" >
					<xsl:sort select="@name" />
					<xsl:with-param name="prefix" select="'&VocabularyPrefix;'" />
				</xsl:apply-templates>
			</div>
			<xsl:copy-of select="$navbar" />
			<div id="attr" >
				<h2>&DatatypeClasses;</h2>
				<xsl:copy-of select="document(concat($docdir, '/', 'datatype-classes.html'))/*" />
				<xsl:variable name="classes" select="class[not(association or attribute) and (not(contains(@name,'View')))]" />
				<xsl:call-template name="toc" >
					<xsl:with-param name="caption">&DatatypeClasses;</xsl:with-param>
					<xsl:with-param name="classes" select="$classes" />
				</xsl:call-template>
				<xsl:apply-templates select="$classes" >
					<xsl:sort select="@name" />
					<xsl:with-param name="prefix" select="'&VocabularyPrefix;'" />
 				</xsl:apply-templates>
			</div>
			<xsl:copy-of select="$navbar" />
		</div>
	</xsl:template>

</xsl:stylesheet>