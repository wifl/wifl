<?xml version="1.0" encoding="UTF-8"?>
<!-- 
  wadl-wifl.xsl
  
  Transforms Web Application Description Language (WADL) XML documents into HTML
  with (Web InterFace Language) WIFL in steps:
    a. Transform WADL to HTML using modified version of Mark Sawers' wadl.xsl.
    b. Decorate that HTML with RDFa using WIFL vocabulary (http://wifl.org/spec/#).
    c. Remove @id and @typeof from second and subsequent elements with same @id value.
  
  The original wadl.xsl file has been renamed to wadl-html.xsl and modified
  to preserve wadl data in the generated HTML, which is used by this 
  stylesheet to add the RDFa.
 -->
 
<xsl:stylesheet version="2.0"
 xmlns="http://www.w3.org/1999/xhtml"
 xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
 xmlns:xs="http://www.w3.org/2001/XMLSchema"
 xmlns:functx="http://www.functx.com"
 xmlns:html="http://www.w3.org/1999/xhtml"
 xmlns:wifl="http://wifl.org/spec/#"
 exclude-result-prefixes="functx html wifl xs"
>
<xsl:output method="html" encoding="ISO-8859-1"
  doctype-public="-//W3C//DTD XHTML+RDFa 1.1//EN"
  doctype-system="http://www.w3.org/MarkUp/DTD/xhtml-rdfa-2.dtd"
  indent="yes" />

<xsl:include href="wadl-html.xsl" />

<xsl:template match="/">
  <xsl:variable name="html">
      <xsl:apply-templates/>
  </xsl:variable>
  <xsl:variable name="wifl">
    <xsl:apply-templates select="$html" mode="wifl" />
  </xsl:variable>
  <xsl:apply-templates select="$wifl" mode="unique" />
</xsl:template>

<xsl:template mode="wifl" match="@*|node()">
  <xsl:copy>
    <xsl:apply-templates select="@*|node()" mode="wifl" />
  </xsl:copy>
</xsl:template>

<xsl:template mode="wifl" match="html:body">
  <xsl:copy>
	  <xsl:attribute name="prefix" select="'wifl: http://wifl.org/spec/#'"/>
	  <xsl:attribute name="vocab" select="'http://wifl.org/spec/#'"/>
    <xsl:apply-templates select="@*|node()" mode="wifl" />
  </xsl:copy>
</xsl:template>

<xsl:template mode="wifl" match="html:div[@class='doc']|html:td[@class='doc']">
  <xsl:copy>
    <xsl:attribute name="property" select="'dc:description'"/>
    <xsl:apply-templates select="@*|node()" mode="wifl"/>
  </xsl:copy>
</xsl:template>

<xsl:template mode="wifl" match="html:div[@class='resources']">
  <xsl:call-template name="wrap-resource">
    <xsl:with-param name="typeof" select="'Resource'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template mode="wifl" match="html:div[@class='resource_type']">
  <xsl:call-template name="wrap-resource">
    <xsl:with-param name="typeof" select="'Resource'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template mode="wifl" match="html:div[@class='resource']">
  <xsl:call-template name="wrap-resource">
    <xsl:with-param name="typeof" select="'Resource'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template mode="wifl" match="html:*[@class='type']/html:a[@href]">
  <xsl:copy>
    <xsl:attribute name="rel" select="'super'"/>
    <xsl:apply-templates select="@*|node()" mode="wifl"/>
  </xsl:copy>
</xsl:template>

<xsl:template mode="wifl" match="html:div[@class='request']">
  <xsl:call-template name="wrap-resource">
    <xsl:with-param name="rel" select="'request'"/>
    <xsl:with-param name="typeof" select="'Request'"/>
    <xsl:with-param name="id" select="wifl:requestId(.)"/>
  </xsl:call-template>
</xsl:template>

<xsl:template mode="wifl" match="html:div[@class='response']">
  <xsl:call-template name="wrap-resource">
    <xsl:with-param name="rel" select="'response'"/>
    <xsl:with-param name="typeof" select="'Response'"/>
    <xsl:with-param name="id" select="wifl:responseId(.)"/>
  </xsl:call-template>
</xsl:template>

<xsl:template mode="wifl" match="html:span[@class='status']">
  <xsl:copy>
    <xsl:attribute name="property" select="'status'"/>
    <xsl:apply-templates select="@*|node()" mode="wifl"/>
  </xsl:copy> 
</xsl:template>

<xsl:template mode="wifl" match="html:tr[@class='query' or @class='header' or 
  @class='template' or @class='matrix' or @class='plain']">
  <xsl:variable name='rel' select="wifl:paramRel(@class)"/>
  <xsl:choose>
    <xsl:when test="html:meta[@property='ref']">
      <xsl:copy>
        <xsl:copy-of select="@*"/>
        <link rel="{$rel}" href="{html:meta/@content}"/>
        <xsl:copy-of select="node() except html:meta[@property='ref']"/>
      </xsl:copy>
    </xsl:when>
    <xsl:otherwise>
		  <xsl:copy>
		    <xsl:if test="$rel">
		      <xsl:attribute name="rel" select="$rel"/>
		      <xsl:attribute name="typeof" select="'Parameter'"/>
		    </xsl:if>
		    <xsl:if test="@id">
		      <xsl:attribute name="resource" select="concat('#', @id)" />
		    </xsl:if>
		    <xsl:apply-templates select="@*|node()" mode="wifl"/>
		  </xsl:copy>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<xsl:template mode="wifl" match="html:td[@class='name']">
  <xsl:copy>
    <xsl:attribute name="property" select="'name'"/>
    <xsl:apply-templates select="@*|node()" mode="wifl"/>
  </xsl:copy>
</xsl:template>

<xsl:template mode="wifl" match="html:tr[@class='representation']">
  <xsl:call-template name="wrap-resource">
    <xsl:with-param name="elt" select="'tr'"/>
    <xsl:with-param name="rel" select="'representation'"/>
    <xsl:with-param name="typeof" select="'Representation'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template mode="wifl" match="html:td[@class='mediaType']">
  <xsl:copy>
    <xsl:attribute name="property" select="'contentType'"/>
    <xsl:apply-templates select="@*|node()" mode="wifl"/>
  </xsl:copy> 
</xsl:template>

<xsl:template mode="wifl" match="html:meta[@property]">
  <xsl:choose>
    <xsl:when test="@property='base' or @property='path'">
      <meta property='path' content='{@content}'/>
    </xsl:when>
    <xsl:when test="@property='parent'">
      <link rel="parent" resource="#{@content}"/>
    </xsl:when>
    <xsl:when test="@property='name'">
      <meta property="method" content="{@content}"/>
    </xsl:when>
    <xsl:when test="@property='type'">
      <meta property="dataType" content="{@content}"/>
    </xsl:when>
    <xsl:when test="@property='representation-href'">
      <link rel="representationType" resource="{@content}"/>
    </xsl:when>
    <xsl:otherwise>
      <xsl:message>Unsupported meta property '<xsl:value-of select="@property"/>'.</xsl:message>
      <xsl:copy-of select='.'/>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<xsl:template mode="wifl" match="html:span[@class='required']">
  <meta property="required" content="true"/>
  <xsl:copy-of select='.'/>
</xsl:template>

<xsl:template mode="wifl" match="html:tt[@class='default']">
  <xsl:copy>
    <xsl:attribute name="property" select="'defaultValue'"/>
    <xsl:apply-templates select="@*|node()" mode="wifl"/>
  </xsl:copy>
</xsl:template>

<xsl:template mode="wifl" match="html:tt[@class='fixed']">
  <xsl:copy>
    <xsl:attribute name="property" select="'fixed'"/>
    <xsl:apply-templates select="@*|node()" mode="wifl"/>
  </xsl:copy>
</xsl:template>

<xsl:template name="wrap-resource">
  <xsl:param name="elt" select="'div'"/>
  <xsl:param name="rel"/>
  <xsl:param name="typeof"/>
  <xsl:param name="id" select="@id"/>
  <xsl:choose>
    <xsl:when test="html:meta[@property='ref']">
      <xsl:copy>
        <xsl:copy-of select="@*"/>
        <link rel="{$rel}" href="{html:meta/@content}"/>
        <xsl:copy-of select="node() except html:meta[@property='ref']"/>
      </xsl:copy>
    </xsl:when>
    <xsl:otherwise>
		  <xsl:element name="{$elt}">
		    <xsl:if test="$rel">
		      <xsl:attribute name="rel" select="$rel"/>
		    </xsl:if>
		    <xsl:if test="$typeof">
		      <xsl:attribute name="typeof" select="$typeof"/>
		    </xsl:if>
		    <xsl:if test="$id">
		      <xsl:attribute name="resource" select="concat('#', $id)" />
		    </xsl:if>
		    <xsl:apply-templates select="@*|node()" mode="wifl"/>
		  </xsl:element>
	  </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<xsl:function name="wifl:paramRel" as="xs:string">
  <xsl:param name="style" as="xs:string"/>
  <xsl:choose>
    <xsl:when test="$style='template'">pathParam</xsl:when>
    <xsl:when test="$style='query'">queryParam</xsl:when>
    <xsl:when test="$style='header'">headerParam</xsl:when>
    <xsl:otherwise>
      <xsl:message>Unsupported WADL style value of '<xsl:value-of select="$style"/>'.</xsl:message>
    </xsl:otherwise>
  </xsl:choose>
</xsl:function>

<xsl:function name="wifl:resourceId" as="xs:string">
  <xsl:param name="node" as="node()"/>
  <xsl:value-of select="$node/ancestor-or-self::*[@class='resource'][1]/@id"/>
</xsl:function>

<xsl:function name="wifl:requestId" as="xs:string">
  <xsl:param name="node" as="node()"/>
  <xsl:variable name="methodId" select="$node/ancestor-or-self::*[@class='method'][1]//*[@class='id'][1]"/>
  <xsl:choose>
    <xsl:when test="$methodId">
      <xsl:value-of select="$methodId"/>
    </xsl:when>
    <xsl:otherwise>
      <xsl:variable name="resourceId" select="wifl:resourceId($node)"/>
		  <xsl:variable name="method" select="$node/ancestor-or-self::*[@class='request'][1]/*[@property='name'][1]/@content"/>
		  <xsl:choose>
			  <xsl:when test="$resourceId and $method">
			    <xsl:value-of select="concat($resourceId,'_',$method)"/>
			  </xsl:when>
			  <xsl:otherwise>
			    <xsl:value-of select="generate-id($node)"/>
			  </xsl:otherwise>
		  </xsl:choose>
    </xsl:otherwise>
  </xsl:choose>
</xsl:function>

<xsl:function name="wifl:responseId" as="xs:string">
  <xsl:param name="node" as="node()"/>
  <xsl:variable name="requestId" select="wifl:requestId($node)"/>
  <xsl:variable name="status" select="$node/ancestor-or-self::*[@class='response'][1]//*[@class='status'][1]"/>
  <xsl:if test="$requestId and $status">
    <xsl:value-of select="concat($requestId,'_',$status)"/>
  </xsl:if>
</xsl:function>

<xsl:template mode="unique" match="@*|node()">
  <xsl:copy>
    <xsl:apply-templates select="@*|node()" mode="unique"/>
  </xsl:copy>
</xsl:template>

<xsl:template mode="unique" match="*[@id]">
  <xsl:variable name="id" select="@id"/>
  <xsl:choose>
    <xsl:when test="functx:index-of-node(//*[@id=$id],.)=1">
      <xsl:copy>
        <xsl:apply-templates select="@*|node()" mode="unique"/>
      </xsl:copy>
    </xsl:when>
    <xsl:otherwise>
      <xsl:copy>
        <xsl:apply-templates select="@*[name()!='id' and name()!='typeof']|node()" mode="unique"/>
      </xsl:copy>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>
</xsl:stylesheet>
