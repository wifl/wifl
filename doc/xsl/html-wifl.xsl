<?xml version="1.0" encoding="UTF-8"?>
<!-- 
  html-wifl.xsl
  
  Adds WIFL RDFa to HTML.
  Decorate the HTML with RDFa using WIFL vocabulary (http://wifl.org/spec/#).
    1. The first instance of a WIFL resource gets @id, @typeof, @resource attributes
      and its children are decorated.  Subsequent instances get @rel, @resource
      attributes to link to the first and their children are not decorated.
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

<xsl:include href="wadl-html.xsl" />

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
    <xsl:with-param name="id" select="@id"/>
  </xsl:call-template>
</xsl:template>

<xsl:template mode="wifl" match="html:div[@class='resource']">
  <xsl:call-template name="wrap-resource">
    <xsl:with-param name="typeof" select="'Resource'"/>
    <xsl:with-param name="id" select="wifl:resource-id(.)"/>
  </xsl:call-template>
</xsl:template>

<xsl:template mode="wifl" match="html:div[@class='method']">
  <xsl:copy>
    <xsl:attribute name="rel" select="'request'"/>
    <xsl:attribute name="typeof" select="'Request'"/>
    <xsl:attribute name="id" select="wifl:request-id(.)"/>
    <xsl:apply-templates select="@*[name()!='id']|*" mode="wifl"/>
  </xsl:copy>
</xsl:template>

<xsl:template mode="wifl" match="html:div[@class='response']">
  <xsl:call-template name="wrap-resource">
    <xsl:with-param name="rel" select="'response'"/>
    <xsl:with-param name="typeof" select="'Response'"/>
    <xsl:with-param name="id" select="wifl:response-id(.)"/>
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
  <xsl:variable name='rel' select="wifl:param-rel(@class)"/>
  <xsl:choose>
    <xsl:when test="preceding::*[@id=current()/@id]">
      <xsl:copy>
        <xsl:attribute name="rel" select="$rel"/>
        <xsl:attribute name="resource" select="concat('#', wadl:clean-id(@id))"/>
        <xsl:copy-of select="@*[name()!='id']|*"/>
      </xsl:copy>
    </xsl:when>
    <xsl:otherwise>
		  <xsl:copy>
		    <xsl:if test="$rel">
		      <xsl:attribute name="rel" select="$rel"/>
		      <xsl:attribute name="typeof" select="'Parameter'"/>
		    </xsl:if>
		    <xsl:if test="@id">
		      <xsl:attribute name="resource" select="concat('#', wadl:clean-id(@id))" />
		      <xsl:attribute name="id" select="wadl:clean-id(@id)"/>
		    </xsl:if>
		    <xsl:apply-templates select="@*[name()!='id']|node()" mode="wifl"/>
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
  <xsl:choose>
    <xsl:when test="preceding::*[@id=current()/@id]">
		  <xsl:call-template name="link-resource">
		    <xsl:with-param name="rel" select="'representation'"/>
		    <xsl:with-param name="resource" select="wadl:clean-id(@id)"/>
		  </xsl:call-template>
    </xsl:when>
    <xsl:otherwise>
		  <xsl:call-template name="wrap-resource">
		    <xsl:with-param name="elt" select="'tr'"/>
		    <xsl:with-param name="rel" select="'representation'"/>
		    <xsl:with-param name="typeof" select="'Representation'"/>
		    <xsl:with-param name="id" select="wadl:clean-id(@id)"/>
		  </xsl:call-template>
	  </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<xsl:template mode="wifl" match="html:td[@class='mediaType']">
  <xsl:copy>
    <xsl:attribute name="property" select="'contentType'"/>
    <xsl:apply-templates select="@*|node()" mode="wifl"/>
  </xsl:copy> 
</xsl:template>

<xsl:template mode="wifl" match="html:span[@property]">
  <xsl:choose>
    <xsl:when test="@property='base' or @property='path'">
      <span property='path' content='{@content}'/>
    </xsl:when>
    <xsl:when test="@property='parent'">
      <span rel="parent" resource="#{wadl:clean-id(@content)}"/>
    </xsl:when>
    <xsl:when test="@property='name'">
      <span property="method">
        <xsl:apply-templates mode="wifl"/>
      </span>
    </xsl:when>
    <xsl:when test="@property='type'">
      <span property="dataType" content="{@content}"/>
    </xsl:when>
    <xsl:when test="@property='representation-href'">
      <span rel="representationType" resource="{@content}"/>
    </xsl:when>
    <xsl:otherwise>
      <xsl:message>Unsupported meta property '<xsl:value-of select="@property"/>'.</xsl:message>
      <xsl:copy-of select='.'/>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<xsl:template mode="wifl" match="html:span[@class='required']">
  <span property="required" content="true"/>
  <xsl:copy-of select='.'/>
</xsl:template>

<xsl:template mode="wifl" match="html:tt[@class='default']">
  <xsl:copy>
    <xsl:attribute name="property" select="'default'"/>
    <xsl:apply-templates select="@*|node()" mode="wifl"/>
  </xsl:copy>
</xsl:template>

<xsl:template mode="wifl" match="html:tt[@class='fixed']">
  <xsl:copy>
    <xsl:attribute name="property" select="'fixed'"/>
    <xsl:apply-templates select="@*|node()" mode="wifl"/>
  </xsl:copy>
</xsl:template>

<xsl:template mode="wifl" match="html:a[starts-with(@href,'#')]">
  <xsl:copy>
    <xsl:copy-of select="@*[name()!='href']"/>
    <xsl:attribute name="href" select="concat('#', wadl:clean-id(substring-after(@href,'#')))"/>
    <xsl:apply-templates mode="wifl"/>
  </xsl:copy> 
</xsl:template>

<xsl:template name="wrap-resource">
  <xsl:param name="elt" select="'div'"/>
  <xsl:param name="rel"/>
  <xsl:param name="typeof"/>
  <xsl:param name="id" select="@id"/>
  <xsl:element name="{$elt}">
    <xsl:if test="$rel">
      <xsl:attribute name="rel" select="$rel"/>
    </xsl:if>
    <xsl:if test="$typeof">
      <xsl:attribute name="typeof" select="$typeof"/>
    </xsl:if>
    <xsl:if test="$id">
      <xsl:attribute name="resource" select="concat('#', $id)" />
      <xsl:attribute name="id" select="$id"/>
    </xsl:if>
    <xsl:apply-templates select="@*[name()!='id']|node()" mode="wifl"/>
  </xsl:element>
</xsl:template>

<xsl:template name="link-resource">
  <xsl:param name="rel"/>
  <xsl:param name="resource"/>
  <xsl:copy>
    <xsl:attribute name="rel" select="$rel"/>
    <xsl:attribute name="resource" select="concat('#', $resource)"/>
    <xsl:copy-of select="@*[name()!='id']|*"/>
  </xsl:copy>
</xsl:template>

<xsl:function name="wifl:param-rel" as="xs:string">
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

<xsl:function name="wifl:resource-id" as="xs:string">
  <xsl:param name="node" as="node()"/>
  <xsl:value-of select="wadl:clean-id($node/ancestor-or-self::*[@class='resource'][1]/@id)"/>
</xsl:function>

<xsl:function name="wifl:request-id" as="xs:string">
  <xsl:param name="node" as="node()"/>
  <xsl:variable name="methodId" select="wadl:clean-id($node/ancestor-or-self::*[@class='method'][1]/@id)"/>
  <xsl:choose>
    <xsl:when test="$methodId">
      <xsl:value-of select="$methodId"/>
    </xsl:when>
    <xsl:otherwise>
      <xsl:variable name="resource-id" select="wifl:resource-id($node)"/>
		  <xsl:variable name="method" select="$node/ancestor-or-self::*[@class='request'][1]/*[@property='name'][1]/@content"/>
		  <xsl:choose>
			  <xsl:when test="$resource-id and $method">
			    <xsl:value-of select="concat($resource-id,'_',$method)"/>
			  </xsl:when>
			  <xsl:otherwise>
			    <xsl:value-of select="generate-id($node)"/>
			  </xsl:otherwise>
		  </xsl:choose>
    </xsl:otherwise>
  </xsl:choose>
</xsl:function>

<xsl:function name="wifl:response-id" as="xs:string">
  <xsl:param name="node" as="node()"/>
  <xsl:variable name="request-id" select="wifl:request-id($node)"/>
  <xsl:variable name="status" select="$node/ancestor-or-self::*[@class='response'][1]//*[@class='status'][1]"/>
  <xsl:if test="$request-id and $status">
    <xsl:value-of select="concat($request-id,'_',$status)"/>
  </xsl:if>
</xsl:function>

</xsl:stylesheet>
