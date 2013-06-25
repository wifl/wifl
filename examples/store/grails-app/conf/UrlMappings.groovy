class UrlMappings {

	static mappings = {
		"/"(view:"/index")
		"/wadl"(view:"/wadl")
		"500"(controller:"restError")
	}
}
