package org.wifl.grails

import javax.xml.transform.*
import javax.xml.transform.stream.*

class XsltService {

    boolean transactional = false

	/**
	 * Returns the result of an XSLT transformation of an XML document.
	 * @param src the source XML document's URL.
	 * @param xslt the XSLT stylesheet's URL.
	 * @return the result of the transformation.
	 */
    String transform(URL src, URL xslt) throws TransformerException {
		def String xml = src.toString().toURL().text
		def TransformerFactory factory = TransformerFactory.newInstance()
		factory.setURIResolver(new XsltUriResolver(xslt))
		def Transformer transformer = factory.newTransformer(new StreamSource(new StringReader(xslt.text)))
		def StringWriter out = new StringWriter()
		transformer.transform(new StreamSource(new StringReader(xml)), new StreamResult(out))
		out
    }
}

private class XsltUriResolver implements URIResolver {
	private URL base
	
	XsltUriResolver(URL base) {
		this.base = base
	}
	
	/**
	 * Resolves a hyperlink reference found in an XSLT stylesheet.
	 * @param href an href attribute, which may be relative or absolute.
	 * @param base The base attribute against which the first argument will
	 * be made absolute.
	 * @return null if base parameter is provided, to use default URI resolution. 
	 * Otherwise, treat href as a relative URL and resolve using base provided to constructor. 
	 */
	 @Override
	Source resolve(String href, String base) throws TransformerException {
		if (base) {
			return null
		}
		new StreamSource(new StringReader(new URL(this.base, href).text))
	}
}
