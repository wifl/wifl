<?xml version="1.0" encoding="UTF-8"?>
<!-- 
  wadl-wifl.xsl
  
  Transforms Web Application Description Language (WADL) XML documents into HTML
  +RDFa with Web InterFace Language (WIFL) in steps:
    a. Transform WADL to HTML.  This includes expanding references inline
       and preserving WADL data for the next step.
    b. Decorate that HTML with RDFa using WIFL vocabulary (http://wifl.org/spec/#).
      1. The first instance of a WIFL resource gets @id, @typeof, @resource attributes
        and its children are decorated.  Subsequent instances get @rel, @resource
        attributes to link to the first and children are not decorated.
      2. All resource identifiers and references are made syntactically valid
        by using the clean-id function.
 -->
 
<xsl:stylesheet version="2.0"
  xmlns="http://www.w3.org/1999/xhtml"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema"
  xmlns:html="http://www.w3.org/1999/xhtml"
  xmlns:wadl="http://wadl.dev.java.net/2009/02"
  xmlns:wifl="http://wifl.org/spec/#"
  exclude-result-prefixes="html wadl wifl xs"
>

<xsl:output method="xhtml" encoding="UTF-8"
  doctype-public="-//W3C//DTD XHTML+RDFa 1.1//EN"
  doctype-system="http://www.w3.org/MarkUp/DTD/xhtml-rdfa-2.dtd"
  media-type="application/xhtml+xml"
  indent="yes" />

<xsl:include href="wifl-console.xsl" />

<xsl:template match="/">
  <xsl:variable name="html">
    <xsl:apply-templates/>
  </xsl:variable>
  <xsl:variable name="wifl">
    <xsl:apply-templates select="$html" mode="wifl" />
  </xsl:variable>
  <xsl:apply-templates select="$wifl" mode="console"/>
</xsl:template>

</xsl:stylesheet>
