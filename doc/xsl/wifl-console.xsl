<?xml version="1.0" encoding="UTF-8"?>
<!-- 
  wifl-console.xsl
  
  Adds interactive console to HTML with WIFL.
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

<xsl:include href="html-wifl.xsl" />

<xsl:template mode="console" match="@*|node()">
  <xsl:copy>
    <xsl:apply-templates select="@*|node()" mode="console" />
  </xsl:copy>
</xsl:template>

<xsl:template mode="console" match="html:head">
  <xsl:copy>
    <xsl:apply-templates select="@*|node()" mode="console"/>
    <link rel="stylesheet" type="text/css" href="wifl/css/wifl-console.css"></link>
    <link rel="stylesheet" type="text/css" href="wifl/css/jquery-ui.css"></link>
    <style type="text/css">
      button.wifl-console-show { float: right }
    </style>
    <script type="text/javascript" src="wifl/js/require-jquery.js"></script>
    <script type="text/javascript">
        require.config({ baseUrl: "wifl/js" });
        require(["wifl-console"]);
    </script>
  </xsl:copy>
</xsl:template>

<xsl:template mode="console" match="html:h2[@class='resources']">
  <xsl:copy>
    <xsl:apply-templates select="@*|node()" mode="console"/>
    <button class="wifl-console-show">Console</button>
  </xsl:copy>
</xsl:template>

<xsl:template mode="console" match="html:td[@class='methodNameTd']|html:h3[@class='fullPath']">
  <xsl:copy>
    <xsl:variable name="classes" select="@class"/>
    <xsl:attribute name="class" select="concat($classes, ' ', 'wifl-console-show')"/>
    <xsl:apply-templates select="@*[name()!='class']|node()" mode="console"/>
  </xsl:copy>
</xsl:template>

</xsl:stylesheet>
