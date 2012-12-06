<?xml version="1.0" encoding="UTF-8"?>
<!--
  Creates an expanded version of a WADL document by
   a. replacing references with the referenced item.
   b. inlining resource_types into their resources, with the resource gaining
     a method for each resource_type method, where the resource_type's
     query and header parameters are copied into the method's request.
     A request is created if the method does not already have one.
   c. ids of inlined items are modified to be prefixed with the base URI of 
     their origin.  This results an id value appearing more than once and
     not being syntactically legal ids.  Subsequent transformation phases are 
     responsible for using the id values to identify common elements, 
     restoring uniqueness of ids, and using the clean-id function to 
     replace id values with syntactically legal ones.
       
  Parts of this work are adapted from Mark Nottingham's wadl_documentation.xsl, at
    https://github.com/mnot/wadl_stylesheets.
 -->
<xsl:stylesheet version="2.0" 
  xmlns:ns="urn:namespace"
  xmlns:wadl="http://wadl.dev.java.net/2009/02"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema"
  exclude-result-prefixes="ns xs xsl"
  >

  <xsl:variable name="wadl-ns">http://wadl.dev.java.net/2009/02</xsl:variable>
  <xsl:variable name="bases" select="//wadl:resources/@base"/>
	
	<xsl:template mode="expand" match="wadl:application">
	  <xsl:copy>
	    <xsl:copy-of select="@*"/>
	    <xsl:apply-templates select="node()[not(namespace-uri()=$wadl-ns and 
	    (local-name()='method' or local-name()='param' or 
	    local-name()='representation' or local-name()='resource_type'))]" mode="expand"/>
	  </xsl:copy>
	</xsl:template>

  <!-- expand @hrefs, @types into a full tree -->
  
  <xsl:template mode="expand" match="wadl:resources">
    <xsl:variable name="base" select="wadl:strip-slash(@base)"/>
    <xsl:element name="resources" namespace="{$wadl-ns}">
      <xsl:for-each select="namespace::*">
        <xsl:variable name="prefix" select="name(.)"/>
        <xsl:if test="$prefix">
          <xsl:attribute name="ns:{$prefix}" select="."/>
        </xsl:if>
      </xsl:for-each>
      <xsl:apply-templates select="@*|node()" mode="expand">
        <xsl:with-param name="base" select="$base" tunnel="yes"/>
      </xsl:apply-templates>            
    </xsl:element>
  </xsl:template>
  
  <xsl:template mode="expand" match="wadl:resource[@type]" priority="1">
		<xsl:param name="base" tunnel="yes"/>
    <xsl:variable name="node" select="."/>
		<xsl:variable name="types" select="tokenize(@type, '\s+')"/>
    <xsl:element name="resource" namespace="{$wadl-ns}">
      <xsl:attribute name="id">
        <xsl:choose>
          <xsl:when test="@id">
            <xsl:value-of select="wadl:generate-id($base, @id)"/>
          </xsl:when>
          <xsl:otherwise>
            <xsl:value-of select="wadl:generate-id($base, @path)" />
          </xsl:otherwise>
        </xsl:choose>
      </xsl:attribute>
      <xsl:attribute name="path" select="@path"/>
      <xsl:apply-templates select="wadl:doc|wadl:param" mode="expand"/>
			<xsl:for-each select="$types">
			  <xsl:variable name="type" select="."/>
				<xsl:variable name="uri" select="substring-before($type, '#')" />
				<xsl:variable name="id" select="substring-after($type, '#')" />
				<xsl:choose>
					<xsl:when test="$uri">
					  <xsl:message>Expanding resource_type <xsl:value-of select="$type"/></xsl:message>
						<xsl:variable name="included" select="$node/document($uri, /)" />
						<xsl:apply-templates
							select="$included/descendant::wadl:resource_type[@id=$id]" mode="expand">
							<xsl:with-param name="base" select="$uri" tunnel="yes"/>
						</xsl:apply-templates>
					</xsl:when>
					<xsl:otherwise>
						<xsl:apply-templates select="root($node)//wadl:resource_type[@id=$id]"
							mode="expand"/>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:for-each>
      <xsl:apply-templates select="node()[not(namespace-uri()=$wadl-ns and 
      (local-name()='doc' or local-name()='param'))]" mode="expand"/>
    </xsl:element>
  </xsl:template>
  
  <xsl:template mode="expand" match="wadl:resource_type" priority="1">
    <xsl:apply-templates select="wadl:method|wadl:resource" mode="expand"/>
    <xsl:apply-templates select="node()[not(namespace-uri()=$wadl-ns)]" mode="expand"/>
  </xsl:template>

  <xsl:template mode="expand" match="wadl:resource_type/wadl:method" priority="1">
    <xsl:param name="base" tunnel="yes"/>
    <xsl:element name="method" namespace="{$wadl-ns}">
      <xsl:copy-of select="@*[not(name()='id')]"/>
      <xsl:if test="@id">
        <xsl:attribute name="id" select="wadl:generate-id($base, @id)"/>
      </xsl:if>
      <xsl:choose>
        <xsl:when test="wadl:request">
          <xsl:apply-templates select="wadl:request" mode="expand"/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:element name="request" namespace="{$wadl-ns}">
            <xsl:apply-templates select="../wadl:param|wadl:param" mode="expand"/>
          </xsl:element>    
        </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="wadl:*[namespace-uri()!=$wadl-ns and 
      local-name()!='request']" mode="expand"/>
    </xsl:element>
  </xsl:template>
    
  <xsl:template mode="expand" match="wadl:resource_type/wadl:method/wadl:request">
    <xsl:copy>
      <xsl:copy-of select="@*"/>
      <xsl:apply-templates select="wadl:doc" mode="expand"/>
      <xsl:apply-templates select="../../wadl:param|wadl:param" mode="expand"/>
      <xsl:apply-templates select="*[not(namespace-uri()=$wadl-ns and 
      local-name='param')]" mode="expand"/>
    </xsl:copy>
  </xsl:template>
  
  <xsl:template mode="expand" match="wadl:*[@href]">
		<xsl:param name="base" tunnel="yes"/>
		<xsl:variable name="uri" select="substring-before(@href, '#')" />
		<xsl:variable name="id" select="substring-after(@href, '#')" />
		<xsl:element name="{local-name()}" namespace="{$wadl-ns}">
			<xsl:copy-of select="@*" /> <!-- do not copy @href -->
			<xsl:choose>
				<xsl:when test="$uri">
          <xsl:message>Expanding href to <xsl:value-of select="@href"/></xsl:message>
					<xsl:attribute name="id" select="wadl:generate-id($uri, $id)"/>
					<xsl:variable name="included" select="document($uri, /)" />
					<xsl:apply-templates select="$included/descendant::wadl:*[@id=$id]/*"
						mode="expand">
						<xsl:with-param name="base" select="$uri" tunnel="yes"/>
					</xsl:apply-templates>
				</xsl:when>
				<xsl:otherwise>
				  <xsl:copy-of select="//wadl:*[@id=$id]/@*"/>
					<xsl:attribute name="id" select="wadl:generate-id($base, $id)"/>
					<xsl:apply-templates select="//wadl:*[@id=$id]/*"	mode="expand"/>
				</xsl:otherwise>
			</xsl:choose>
		</xsl:element>
  </xsl:template>
  
  <xsl:template mode="expand" match="node()[@id]">
    <xsl:param name="base" tunnel="yes"/>
    <xsl:element name="{local-name()}" namespace="{$wadl-ns}">
      <xsl:copy-of select="@*"/>
      <xsl:attribute name="id" select="wadl:generate-id($base, @id)"/>
      <xsl:apply-templates select="node()" mode="expand"/>
    </xsl:element>
  </xsl:template>
  
  <xsl:template mode="expand" match="@*|node()">
    <xsl:copy>
      <xsl:apply-templates select="@*|node()" mode="expand"/>
    </xsl:copy>
  </xsl:template>
  
  <xsl:function name="wadl:generate-id">
    <xsl:param name="base"/>
    <xsl:param name="id"/>
    <xsl:value-of select="$base"/>#<xsl:value-of select="$id"/>
  </xsl:function>
  
  <xsl:function name="wadl:clean-id" as="xs:string">
  <xsl:param name="id"/>
  <xsl:choose>
    <xsl:when test="contains($id,'#') and wadl:has-local-base($bases,$id)">
      <xsl:value-of select="substring-after($id, '#')"/>
    </xsl:when>
    <xsl:otherwise>
      <xsl:value-of select="translate($id, '#', '_')"/>
    </xsl:otherwise>
  </xsl:choose>
</xsl:function>

<xsl:function name="wadl:has-local-base">
  <xsl:param name="bases"/>
  <xsl:param name="id"/>
  <xsl:value-of select="exists(
  for $i in (1 to count($bases))
    return $i[starts-with($id, wadl:strip-slash($bases[$i]))]
  )"/>
</xsl:function>

<xsl:function name="wadl:strip-slash" as="xs:string">
  <xsl:param name="s"/>
  <xsl:choose>
    <xsl:when test="substring($s, string-length($s), 1)='/'">
      <xsl:value-of select="substring($s, 1, string-length($s)-1)"/>
    </xsl:when>
    <xsl:otherwise>
      <xsl:value-of select="$s"/>
    </xsl:otherwise>
  </xsl:choose>
</xsl:function>
  
</xsl:stylesheet>