##@ Question data

.PHONY: data
data: ## Check the question bank and rebuild the catalogue and sign drawings
	cd scripts && $(UV) run --locked build_data.py
