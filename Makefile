build:
	rm -fr build/*
	yarn --non-interactive
	yarn build
	./node_modules/.bin/babel src --out-file index.js

test:
	yarn test --maxWorkers=4

publish:
	npm publish --registry https://registry.npmjs.org
