<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    
  <xsl:template name="toc" >
    <xsl:param name="caption" />
    <xsl:param name="classes" />
    <div class="toc">
      <table cellspacing="0" cellpadding="0" border="1">
        <caption><xsl:value-of select="$caption"/></caption>
        <tr><th>Class</th><th>Summary</th></tr>
        <xsl:apply-templates select="$classes" mode="toc" >
          <xsl:sort select="@name" />
        </xsl:apply-templates>
      </table>
    </div>
  </xsl:template>
  
  <xsl:template match="class[@name != 'RDFOptions' and @name != 'UMLOptions']" mode="toc">
    <tr>
      <td><a href="#{@name}"><xsl:value-of select="@name"/></a></td>
      <td><xsl:apply-templates select="summary"/></td>
    </tr>
  </xsl:template>
  
  <xsl:template match="class[@name != 'RDFOptions' and @name != 'UMLOptions']">
    <xsl:param name="prefix" />
    <div id="{@name}" class="class" about="{$prefix}:{@name}" typeof="rdfs:Class">
      <h3 property="dc:title">
        <xsl:value-of select="@name" />
      </h3>
      <xsl:apply-templates select="description" />
      <xsl:if test="@extends != 'Object'">
        <div class="extends">
          Superclass: <a href="#{@extends}">
            <xsl:value-of select="@extends" />
          </a>
        </div>
      </xsl:if>
      <xsl:variable name="n" select="@name" />
      <div class="subclasses">
        <ol>
          <xsl:for-each select="../class[@extends]">
            <xsl:sort select="@name" />
            <xsl:if test="$n = @extends">
              <li>Subclass: <a href="#{@name}">
                  <xsl:value-of select="@name" />
                </a>
              </li>
            </xsl:if>
          </xsl:for-each>
        </ol>
      </div>
      <xsl:if test="count(association) &gt; 0">
        <div class="associations">
          <table cellspacing="0" cellpadding="0" border="1">
            <caption>Associations</caption>
            <tr>
              <th class="name">Name</th>
              <th class="type">Class</th>
              <th class="arity">Multiplicity</th>
              <th class="desc">Description</th>
            </tr>
            <xsl:apply-templates select="association" >
              <xsl:sort select="@name" />
              <xsl:with-param name="prefix" select="$prefix" />
            </xsl:apply-templates>
          </table>
        </div>
      </xsl:if>
      <xsl:if test="count(attribute) &gt; 0">
        <div class="attributes">
          <table cellspacing="0" cellpadding="0" border="1">
            <caption>Attributes</caption>
            <tr>
              <th class="name">Name</th>
              <th class="type">Class</th>
              <th class="arity">Arity</th>
              <th class="desc">Description</th>
            </tr>
            <xsl:apply-templates select="attribute[@hidden='false']" >
              <xsl:sort select="@name" />
              <xsl:with-param name="prefix" select="$prefix" />
            </xsl:apply-templates>
          </table>
        </div>
      </xsl:if>
    </div>
  </xsl:template>

  <xsl:template match="summary">
    <div class="summary">
      <xsl:copy-of select="./text()|./node()" />
    </div>
  </xsl:template>
  
  <xsl:template match="description">
    <div class="desc" property="dc:description">
      <xsl:copy-of select="./text()|./node()" />
    </div>
  </xsl:template>

  <xsl:template match="association">
    <xsl:param name="prefix" />
    <tr about="{$prefix}:{@name}" typeof="rdfs:Property">
      <td class="name assoc" property="dc:title">
        <xsl:value-of select="@name" />
      </td>
      <td class="type">
        <a href="#{@targetClass}" rel="rdfs:range" resource="{$prefix}:{@targetClass}">
          <xsl:value-of select="@targetClass" />
        </a>
      </td>
      <td class="arity">
        <xsl:value-of select="@targetAdornments" />
      </td>
      <td class="desc">
        <xsl:apply-templates select="description" />
      </td>
    </tr>
  </xsl:template>

  <xsl:template match="attribute">
    <xsl:param name="prefix" />
    <tr about="{$prefix}:{@name}" typeof="rdfs:Property">
      <td class="name attr" property="dc:title">
        <xsl:value-of select="@name" />
      </td>
      <td class="type">
        <a href="#{@class}" rel="rdfs:range" resource="{$prefix}:{@class}">
          <xsl:value-of select="@class" />
        </a>
      </td>
      <td class="arity">
        <xsl:value-of select="@arity" />
      </td>
      <td class="desc">
        <xsl:apply-templates select="description" />
      </td>
    </tr>
  </xsl:template>
</xsl:stylesheet>