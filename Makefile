# DCIT208 Universal Makefile Contract
# Each team must map these commands to its chosen technology stack.
# Replace the placeholder commands before the required checkpoint.

.PHONY: setup lint test run build

setup:
	npm install

lint:
	npm run lint

test:
	npm test

run:
	npm run dev

build:
	npm run build