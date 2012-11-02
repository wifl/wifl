<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE stylesheet [
<!ENTITY Title "Web InterFace Language: Example">
<!ENTITY Intro "Introduction">
<!ENTITY Application "Store Application">
<!ENTITY Explanation "Model Usage">
<!ENTITY VocabularyPrefix "wifl">
<!ENTITY VocabularyReference "http://wifl.org/spec/#">
]>
<xsl:stylesheet version="1.0"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:output method="html" version="1.0" encoding="ISO-8859-1"
		doctype-public="-//W3C//DTD XHTML+RDFa 1.0//EN"
		doctype-system="http://www.w3.org/MarkUp/DTD/xhtml-rdfa-2.dtd"
		indent="yes" />
  <xsl:param name="docdir" select="." />

	<xsl:variable name="navbar">
    <div class="navbar">
      <ul>
      <li><a href="#intro">&Intro;</a></li>
      <li><a href="#application">&Application;</a></li>
      <li><a href="#explanation">&Explanation;</a></li>
      </ul>
    </div>
	</xsl:variable>
	
	<xsl:template match="/">
		<html xmlns="http://www.w3.org/1999/xhtml">
			<head>
				<title>&Title;</title>
				<link rel="stylesheet" type="text/css" href="spec/spec.css" />
			</head>
			<body prefix="rdfs: http://www.w3.org/2000/01/rdf-schema#
			  &VocabularyPrefix;: &VocabularyReference;">
				<h1>&Title;</h1>
				<div id="intro" class="intro">
					<h2>&Intro;</h2>
					<xsl:copy-of select="document(concat($docdir, '/', 'intro.html'))/*" />
				</div>
				<xsl:copy-of select="$navbar" />
        <div id="application" class="intro">
          <h2>&Application;</h2>
          <xsl:copy-of select="document(concat($docdir, '/', 'application.html'))/*" />
        </div>
        <xsl:copy-of select="$navbar" />
				<div id="explanation" class="intro">
					<h2>&Explanation;</h2>
					<xsl:copy-of select="document(concat($docdir, '/', 'explanation.html'))/*" />
				</div>
				<xsl:copy-of select="$navbar" />
			</body>
		</html>
	</xsl:template>

</xsl:stylesheet>