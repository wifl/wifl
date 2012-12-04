<?xml version="1.0" encoding="UTF-8"?>
<!-- 
    wadl-html.xsl
    
    Transforms Web Application Description Language (WADL) XML documents into HTML.
     
    See example_wadl.xml at http://github.com/ipcsystems/wadl-stylesheet to explore 
    this stylesheet's capabilities and the README.txt for other usage information.
    Note that the contents of a doc element is rendered as a:
        * hyperlink if the title attribute contains is equal to 'Example'
        * mono-spaced font ('pre' tag) if content contains the text 'Example'
			
    Limitations:
        * Ignores queryType attributes of resource element.
        * Ignores profile attribute of representation element.
        * Ignores path attribute and child link elements of param element.
    
    The generated HTML preserves WADL element heritage with class, property,
    or content attribute values for subsequent transformations.

    Parts of this work are adapted from Mark Nottingham's wadl_documentation.xsl, at
        https://github.com/mnot/wadl_stylesheets.
    and from Mark Sawers <mark.sawers@ipc.com> wadl.xsl at
        https://github.com/ipcsystems/wadl-stylesheet/blob/master/wadl.xsl
 -->
<xsl:stylesheet version="2.0"
 xmlns="http://www.w3.org/1999/xhtml"
 xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
 xmlns:wadl="http://wadl.dev.java.net/2009/02"
 xmlns:xs="http://www.w3.org/2001/XMLSchema"
 xmlns:wh="http://wadl-html.com"
 xmlns:html="http://www.w3.org/1999/xhtml"
 exclude-result-prefixes="html wadl wh xs"
>

<xsl:output method="xhtml" encoding="UTF-8" indent="yes" />

<xsl:include href="expand-wadl.xsl"/>
  
<xsl:template match="wadl:application">
  <!-- Replace hrefs and resource type references in source wadl document
    with their target's content. -->
  <xsl:variable name="expansion">
    <xsl:apply-templates select="." mode="expand"/>
  </xsl:variable>
  <!-- Transform the expanded document. -->
  <xsl:apply-templates select="$expansion" mode="expanded"/>
</xsl:template>

<xsl:template mode="expanded" match="wadl:application">
  <xsl:variable name="title" select="if (wadl:doc/@title) then wadl:doc/@title 
  else 'Web Application'"/>
  <html>
	  <head>
      <title><xsl:value-of select="$title"/></title>
      <xsl:call-template name="getStyle"/>
	  </head>
	  <body>
		  <h1><xsl:value-of select="$title"/></h1>
		  <xsl:apply-templates select="wadl:doc"/>
		  
		  <!-- Summary -->
		  <h2>Summary</h2>
		  <table>
	      <tr>
	        <th>Resource</th>
	        <th>Method</th>
	        <th>Description</th>
	      </tr>
	      <xsl:apply-templates select="wadl:resources" mode="summarize"/>
		  </table>
		  
		  <!-- Grammars -->
		  <xsl:if test="wadl:grammars/wadl:include">
	      <h2>Grammars</h2>
	      <ul class="grammars">
	        <xsl:apply-templates select="wadl:grammars/wadl:doc"/>
	        <xsl:for-each select="wadl:grammars/wadl:include">
	          <xsl:variable name="href" select="@href"/>
	          <li class="grammar">
	            <a href="{$href}"><xsl:value-of select="$href"/></a>
	          </li>
	        </xsl:for-each>
	      </ul>
		  </xsl:if>
		  
		  <!-- Detail -->
		  <h2>Resources</h2>
		  <xsl:apply-templates select="wadl:resources"/>
	
	  </body>
  </html>
</xsl:template>

<xsl:template match="wadl:doc">
  <xsl:param name="resourceBase" tunnel="yes"/>
  <div class="doc">
    <xsl:if test="@title and local-name(..) != 'application'">
        <xsl:value-of select="@title"/>:
    </xsl:if>
    <xsl:variable name="content" select="."/>
    <xsl:choose>
        <xsl:when test="@title = 'Example'">
            <xsl:variable name="url">
                <xsl:choose>
                    <xsl:when test="string-length($resourceBase) > 0">
                      <xsl:value-of select="wh:getFullResourcePath($resourceBase,text())"/>
                    </xsl:when>
                    <xsl:otherwise><xsl:value-of select="text()"/></xsl:otherwise>
                </xsl:choose>
            </xsl:variable>
            <a href="{$url}"><xsl:value-of select="$url"/></a>
        </xsl:when>
        <xsl:when test="contains($content, 'Example')">
            <div class="example"><pre><xsl:value-of select="."/></pre></div>
        </xsl:when>
        <xsl:otherwise>
            <xsl:value-of select="$content"/>
        </xsl:otherwise>
    </xsl:choose>
  </div>
</xsl:template>

<xsl:template match="wadl:resources">
  <xsl:variable name="id" select="wh:getId(.)"/>
  <div class="resources" id="{$id}">
    <span property="base" content="{@base}"/>
    <xsl:apply-templates>
      <xsl:with-param name="resourceBase" select="@base" tunnel="yes"/>
      <xsl:with-param name="resourceParent" select="$id" tunnel="yes"/>
    </xsl:apply-templates>
  </div>
</xsl:template>

<xsl:template match="wadl:resource">
  <xsl:param name="resourceBase" tunnel="yes"/>
  <xsl:param name="resourceParent" tunnel="yes"/>

  <xsl:variable name="resourceId" select="wh:getId(.)"/>
  <div class="resource" id="{$resourceId}">
   <span property="path" content="{@path}"/>
   <xsl:if test="$resourceParent">
     <span property="parent" content="{$resourceParent}"/>
   </xsl:if>
   
	 <xsl:if test="wadl:method">
     <h3 class="fullPath">
       <xsl:value-of select="if (@path) then 
       wh:getFullResourcePath($resourceBase,@path) else @id"/>
     </h3>
     <xsl:apply-templates select="wadl:doc"/>
     <h5>Methods</h5>
     <div class="methods">
       <xsl:apply-templates select="wadl:method"/>
     </div>
    </xsl:if>
  </div>

  <!-- Call recursively for child resources -->
  <xsl:apply-templates select="wadl:resource">
    <xsl:with-param name="resourceBase" select="wh:getFullResourcePath($resourceBase,@path)" tunnel="yes"/>
    <xsl:with-param name="resourceParent" select="$resourceId" tunnel="yes"/>
  </xsl:apply-templates>
</xsl:template>

<xsl:template match="wadl:method">
  <div class="method">
    <xsl:if test="@id"><xsl:attribute name="id" select="wh:getId(.)"/></xsl:if>
    <table class="methodNameTable">
      <tr>
        <td class="methodNameTd">
          <xsl:value-of select="@name"/>
        </td>
        <td class="methodIdTd">
          <xsl:if test="@id">
            <span class="id"><xsl:value-of select="wadl:clean-id(wh:getId(.))"/></span>()
          </xsl:if>
        </td>
      </tr>
    </table>

    <div class="request">
	    <span property="name" content="{@name}"/>
	    <xsl:apply-templates select="wadl:doc"/>
	
	    <!-- Request -->
	    <h6>request</h6>
	    <div class="input">
	      <xsl:choose>
          <xsl:when test="wadl:request">
            <xsl:for-each select="wadl:request">
              <xsl:call-template name="getRequestInputBlock" />
            </xsl:for-each>
          </xsl:when>
          <xsl:when test="ancestor::wadl:resource/wadl:param">
            <xsl:call-template name="getRequestInputBlock" />
          </xsl:when>
          <xsl:otherwise>
            unspecified
          </xsl:otherwise>
	      </xsl:choose>
	    </div>
	                    
	    <!-- Response -->
	    <h6>responses</h6>
	    <div class="output">
	      <xsl:choose>
          <xsl:when test="wadl:response">
            <xsl:apply-templates select="wadl:response"/>
          </xsl:when>
          <xsl:otherwise>
            unspecified
          </xsl:otherwise>
	      </xsl:choose>                
	    </div>
    </div>
  </div>
</xsl:template>

<xsl:template match="wadl:param">
  <tr class="{@style}">
    <xsl:if test="@id"><xsl:attribute name="id" select="wh:getId(.)"/></xsl:if>
    <td class="name"><xsl:value-of select="@name"/></td>
    <td>
      <xsl:if test="not(@type) and not(@fixed)">
        unspecified type
      </xsl:if>
      <xsl:call-template name="getHyperlinkedElement">
        <xsl:with-param name="qname" select="@type"/>
      </xsl:call-template>
      <xsl:if test="@required = 'true'"><br/><span class="required">(required)</span></xsl:if>
      <xsl:if test="@repeating = 'true'"><br/><span class="repeating">(repeating)</span></xsl:if>
      <xsl:if test="@default"><br/>default: <tt class="default"><xsl:value-of select="@default"/></tt></xsl:if>
      <xsl:if test="@type and @fixed"><br/></xsl:if>
      <span property="type" content="{@type}"/>
      <!--  WIFL says @fixed is boolean that uses defaultValue, WADL says @fixed is the value and default is ignored. -->
      <xsl:if test="@fixed">fixed: <tt class="fixed"><xsl:value-of select="@fixed"/></tt></xsl:if>
      <xsl:if test="wadl:option">
        <br/>options:
        <xsl:for-each select="wadl:option">
          <xsl:choose>
            <xsl:when test="@mediaType">
              <br/><tt><xsl:value-of select="@value"/> (<xsl:value-of select="@mediaType"/>)</tt>
            </xsl:when>
            <xsl:otherwise>
              <tt><xsl:value-of select="@value"/></tt>
              <xsl:if test="position() != last()">, </xsl:if>
            </xsl:otherwise>
          </xsl:choose>
        </xsl:for-each>
      </xsl:if>
    </td>
    <xsl:if test="wadl:doc">
        <td class="doc"><xsl:value-of select="wadl:doc"/></td>
    </xsl:if>
  </tr>
</xsl:template>

<xsl:template match="wadl:response">
	<div class="response">
	  <div class="h8">status:
	   <xsl:choose>
       <xsl:when test="@status">
           <span class="status"><xsl:value-of select="@status"/></span>
       </xsl:when>
       <xsl:otherwise>
           <span class="status">200</span> - OK
       </xsl:otherwise>
	   </xsl:choose>
	  </div>
		<xsl:for-each select="wadl:doc">
			<xsl:if test="@title">
				-
				<xsl:value-of select="@title" />
			</xsl:if>
			<!-- <xsl:if test="text()"> - <xsl:value-of select="text()"/> </xsl:if> -->
			<xsl:text> </xsl:text>
			<div class="doc">
				<xsl:value-of select="." />
			</div>
	  </xsl:for-each>
	  
	  <!-- Get response headers/representations -->
	  <xsl:if test="wadl:param or wadl:representation">
      <div class="output">
       <xsl:if test="wadl:param">
         <div class="h7">headers</div>
         <table>
           <xsl:apply-templates select="wadl:param[@style='header']"/>
         </table>
       </xsl:if>
       <xsl:call-template name="getRepresentations"/>
      </div>
	  </xsl:if>
	</div>
</xsl:template>

<xsl:template match="wadl:representation">
  <tr class="representation">
    <xsl:if test="@id"><xsl:attribute name="id" select="wh:getId(.)"/></xsl:if>
    <td class="mediaType">
      <xsl:value-of select="@mediaType"/>
    </td>
    <xsl:choose>
      <xsl:when test="@href or @element">
        <td>
          <xsl:variable name="href" select="@href" />
          <xsl:choose>
            <xsl:when test="@href">
              <span property="representation-href" content="{@href}"/>
              <xsl:variable name="localname" select="substring-after($href, '#')" />
              <a href="{$href}">
                <xsl:value-of select="$localname" />
              </a>
            </xsl:when>
            <xsl:otherwise>
              <span property="element" content="{@element}"/>
              <xsl:call-template name="getHyperlinkedElement">
                <xsl:with-param name="qname" select="@element" />
              </xsl:call-template>
            </xsl:otherwise>
          </xsl:choose>
        </td>
      </xsl:when>
      <xsl:otherwise>
        <td />
      </xsl:otherwise>
    </xsl:choose>

    <td>
      <xsl:call-template name="getDoc">
        <xsl:with-param name="base" select="''" />
      </xsl:call-template>
    </td>
  </tr>
  <xsl:call-template name="getRepresentationParamBlock">
    <xsl:with-param name="style" select="'template'" />
  </xsl:call-template>

  <xsl:call-template name="getRepresentationParamBlock">
    <xsl:with-param name="style" select="'matrix'" />
  </xsl:call-template>

  <xsl:call-template name="getRepresentationParamBlock">
    <xsl:with-param name="style" select="'header'" />
  </xsl:call-template>

  <xsl:call-template name="getRepresentationParamBlock">
    <xsl:with-param name="style" select="'query'" />
  </xsl:call-template>
</xsl:template>

<xsl:template mode="summarize" match="wadl:resources">
  <xsl:apply-templates select="wadl:resource" mode="summarize">
    <xsl:with-param name="resourceBase" select="@base" tunnel="yes"/>
  </xsl:apply-templates>
</xsl:template>

<xsl:template mode="summarize" match="wadl:resource">
  <xsl:param name="resourceBase" tunnel="yes"/>
  <xsl:apply-templates select="wadl:method" mode="summarize">
    <xsl:with-param name="resourcePath" select="@path" tunnel="yes"/>
  </xsl:apply-templates>
  <xsl:apply-templates select="wadl:resource" mode="summarize">
    <xsl:with-param name="resourceBase" select="wh:getFullResourcePath($resourceBase,@path)" tunnel="yes"/>
  </xsl:apply-templates>
</xsl:template>

<xsl:template mode="summarize" match="wadl:method">
  <xsl:param name="resourceBase" tunnel="yes"/>
  <xsl:param name="resourcePath" tunnel="yes"/>
  <tr>
    <!-- Resource -->
    <xsl:if test="position() = 1">
      <td class="summary" rowspan="{count(../wadl:method)}">
        <xsl:variable name="id" select="wh:getId(..)"/>
        <a href="#{$id}">
           <xsl:value-of select="wh:getFullResourcePath($resourceBase,$resourcePath)"/>
        </a>
      </td>
    </xsl:if>
    <!-- Method -->
    <td class="summary">
      <xsl:variable name="name" select="@name"/>
      <xsl:variable name="id2" select="wh:getId(.)"/>
      <a href="#{$id2}"><xsl:value-of select="$name"/></a>
    </td>
    <!-- Description -->
    <td class="summary">
      <xsl:apply-templates select="wadl:doc"/>
    </td>
  </tr>
</xsl:template>

<xsl:template name="getDoc">
    <xsl:param name="base"/>
    <xsl:apply-templates select="wadl:doc">
      <xsl:with-param name="resourceBase" select="$base" tunnel="yes"/>
    </xsl:apply-templates>
</xsl:template>

<xsl:template name="getRequestInputBlock">
  <xsl:call-template name="getParamBlock">
      <xsl:with-param name="style" select="'template'"/>
  </xsl:call-template>

  <xsl:call-template name="getParamBlock">
      <xsl:with-param name="style" select="'matrix'"/>
  </xsl:call-template>

  <xsl:call-template name="getParamBlock">
      <xsl:with-param name="style" select="'header'"/>
  </xsl:call-template>

  <xsl:call-template name="getParamBlock">
      <xsl:with-param name="style" select="'query'"/>
  </xsl:call-template>

  <xsl:call-template name="getRepresentations"/>
</xsl:template>

<xsl:template name="getParamBlock">
  <xsl:param name="style"/>
  <xsl:variable name="inherited" select="if ($style='query' or $style='header') 
  then ancestor::wadl:resource[1]/wadl:param[@style=$style]
  else ancestor::wadl:resource/wadl:param[@style=$style]"/>
  <xsl:variable name="params" select="$inherited | wadl:param[@style=$style]"/> 
  <xsl:if test="$params">
    <div class="h7"><xsl:value-of select="$style"/> params</div>
    <table>
        <xsl:apply-templates select="$params"/>
    </table>
    <p/>
  </xsl:if>
</xsl:template>

<xsl:template name="getHyperlinkedElement">
  <xsl:param name="qname"/>
  <xsl:variable name="prefix" select="substring-before($qname,':')"/>
  <xsl:variable name="ns-uri" select="./namespace::*[name()=$prefix]"/>
  <xsl:variable name="localname" select="substring-after($qname, ':')"/>
  <xsl:choose>
    <xsl:when test="$ns-uri='http://www.w3.org/2001/XMLSchema' or $ns-uri='http://www.w3.org/2001/XMLSchema-instance'">
        <a href="http://www.w3.org/TR/xmlschema-2/#{$localname}"><xsl:value-of select="$localname"/></a>
    </xsl:when>
    <xsl:when test="$ns-uri and starts-with($ns-uri, 'http://www.w3.org/XML/') = false()">
        <a href="{$ns-uri}#{$localname}"><xsl:value-of select="$localname"/></a>
    </xsl:when>
    <xsl:when test="$qname">
        <xsl:value-of select="$qname"/>
    </xsl:when>
  </xsl:choose>
</xsl:template>

<xsl:template name="getRepresentations">
  <xsl:if test="wadl:representation">
    <div class="h7">representations</div>
    <table>
      <xsl:apply-templates select="wadl:representation"/>    
    </table>
  </xsl:if> 
</xsl:template>

<xsl:template name="getRepresentationParamBlock">
  <xsl:param name="style"/>
  <xsl:variable name="params" select="wadl:param[@style=$style]"/>
  <xsl:if test="$params">
    <tr>
      <td class="representationParams">
        <div class="h7"><xsl:value-of select="$style"/> params</div>
        <table>
          <xsl:apply-templates select="$params"/>    
        </table>
        <p/>
      </td>
    </tr>
  </xsl:if>
</xsl:template>

<xsl:template name="getStyle">
     <style type="text/css">
        body {
            font-family: sans-serif;
            font-size: 0.85em;
            margin: 2em 2em;
        }
        .methods {
            margin-left: 2em; 
            margin-bottom: 2em;
        }
        .method {
            background-color: #eef;
            border: 1px solid #DDDDE6;
            padding: .5em;
            margin-bottom: 1em;
            width: 50em
        }
        .methodNameTable {
            width: 100%;
            border: 0px;
            border-bottom: 2px solid white;
            font-size: 1.4em;
        }
        .methodNameTable * td {
            background-color: #eef;
        }
        .methodNameTd {
            font-weight: bold;
        }
        .methodIdTd {
            text-align: right;
        }
        .input, .output {
            margin-left: 2em;
        }
        .representationParams {
            padding: 0em 0em 0em 2em;
        }
        .example {
            white-space:pre-wrap;
        }
        .name {
            font-weight: bold;
        }
        .mediaType {
            font-weight: bold;
        }
        .grammars {
            margin-left: -1em; 
            margin-bottom: 2em;
        }
        .grammar {
            background-color: #ffffdd;
            border: 1px solid #DDDDE6;
            padding: .5em;
            list-style-type: none;
            margin-bottom: 1em;
            width: 50em
        }
        h1 {
            font-size: 2em;
            margin-bottom: 0em;
        }
        h2 {
            border-bottom: 1px solid black;
            margin-top: 1.5em;
            margin-bottom: 0.5em;
            font-size: 1.5em;
           }
        h3 {
            color: #FF6633;
            font-size: 1.35em;
            margin-top: .5em;
            margin-bottom: 0em;
        }
        h5 {
            font-size: 1.2em;
            color: #99a;
            margin: 0.5em 0em 0.25em 0em;
        }
        h6 {
            color: #700000;
            font-size: 1em;
            margin: 1em 0em 0em 0em;
        }
        .h7 {
            margin-top: .75em;
            font-size: 1em;
            font-weight: bold;
            font-style: italic;
            color: blue;
        }
        .h8 {
            margin-top: .75em;
            font-size: 1em;
            font-weight: bold;
            font-style: italic;
            color: black;
        }
        tt {
            font-size: 1em;
        }
        table {
            margin-bottom: 0.5em;
            border: 1px solid #E0E0E0;
        }
        th {
            text-align: left;
            font-weight: normal;
            font-size: 1em;
            color: black;
            background-color: #DDDDE6;
            padding: 3px 6px;
            border: 1px solid #B1B1B8;
        }
        td {
            padding: 3px 6px;
            vertical-align: top;
            background-color: #F6F6FF;
            font-size: 0.85em;
        }
        p {
            margin-top: 0em;
            margin-bottom: 0em;
        }
        td.summary {
            background-color: white;
        }
        td.summarySeparator {
            padding: 1px;
        }
    </style>
</xsl:template>

<xsl:function name="wh:getId" as="xs:string">
  <xsl:param name="node" as="node()"/>
  <xsl:value-of select="if ($node/@id) then $node/@id else generate-id($node)"/>
</xsl:function>

<xsl:function name="wh:getFullResourcePath" as="xs:string">
   <xsl:param name="base"/>
   <xsl:param name="path"/>
   <xsl:variable name="basePart">
     <xsl:choose>
       <xsl:when test="substring($base, string-length($base)) = '/'">
           <xsl:value-of select="$base"/>
       </xsl:when>
       <xsl:otherwise>
           <xsl:value-of select="concat($base, '/')"/>
       </xsl:otherwise>
     </xsl:choose>
   </xsl:variable>
   <xsl:variable name="pathPart">
     <xsl:choose>
       <xsl:when test="starts-with($path, '/')">
           <xsl:value-of select="substring($path, 2)"/>
       </xsl:when>
       <xsl:otherwise>
           <xsl:value-of select="$path"/>
       </xsl:otherwise>
     </xsl:choose>
   </xsl:variable>
   <xsl:value-of select="concat($basePart,$pathPart)"/>
</xsl:function>

</xsl:stylesheet>
