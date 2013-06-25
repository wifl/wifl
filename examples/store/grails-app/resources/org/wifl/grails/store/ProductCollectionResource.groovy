package org.wifl.grails.store

import static org.grails.jaxrs.response.Responses.*

import javax.servlet.http.HttpServletRequest
import javax.ws.rs.Consumes
import javax.ws.rs.DefaultValue
import javax.ws.rs.GET
import javax.ws.rs.Produces
import javax.ws.rs.Path
import javax.ws.rs.PathParam
import javax.ws.rs.POST
import javax.ws.rs.QueryParam
import javax.ws.rs.core.Context
import javax.ws.rs.core.Response

@Path('api/products')
@Consumes(['application/xml','application/json'])
@Produces(['application/xml','application/json'])
class ProductCollectionResource {

	def uriService
	
    @GET
	@Produces("text/uri-list")
    def uriList(@Context HttpServletRequest request,
		@QueryParam("apikey") String apikey,
		@DefaultValue("1") @QueryParam("start-index") int offset, 
		@DefaultValue("10") @QueryParam("max-results") int max) {
		def myURL = uriService.requestUri(request)
        Product.findAll([offset:offset-1, max:max])?.collect{
			"$myURL/${it.id}"
		}.join("\r\n")
    }
	
	@POST
	Response create(@QueryParam("apikey") String apikey, Product dto) {
		created dto.save()
	}

    @Path('/{id}')
    ProductResource getResource(@PathParam('id') String id) {
        new ProductResource(id:id)
    }
        
}
