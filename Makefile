pm := yarn

all::
	@$(MAKE) -s install
	@$(MAKE) -s build

install::
	$(pm) install

build::
	npx webpack --mode production

dev::
	npx webpack serve --mode development --open

serve::
	npx http-server ./dist/ -d --cors -o / -c-1
