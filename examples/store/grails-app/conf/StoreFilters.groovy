class StoreFilters {
	def filters = {
		apiKeyCheck(uri:"/api/**") {
			before = {
				// reject request if it doesn't have an apikey parameter
				if (!params.apikey) {
					render(status:400, text:"Must include apikey query parameter")
					return false;
				}
			}
		}
		
	}
}
