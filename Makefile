# OBA Makefile
APPVERSION = $(shell git describe --tags)

CLIENT := $(CURDIR)/client
MD_BUNDLER := $(CURDIR)/util/md-bundler
BM_INPUTS := $(CURDIR)/bible-media/inputs
BM_OUTPUTS := $(CURDIR)/bible-media/outputs


bundle_path := $(CLIENT)/platforms/android/app/build/outputs/bundle/release
bundle_default_file := $(bundle_path)/app-release.aab

prep-all: \
	prep-yetfa

prep-%: $(CLIENT)/dist/media/%.bundle.obd $(CLIENT)/config.template.xml $(CLIENT)/src/*
	mkdir -p dist/
	mv $(CLIENT)/dist/media/$*.bundle.obd $(CLIENT)/dist/media/bundle.obd
	sed \
		-e 's/%%VERSION%%/$(APPVERSION)/g' \
		-e 's/%%TRANSLATION%%/$*/g' \
		$(CLIENT)/config.template.xml > \
		$(CLIENT)/config.xml

build-yetfa: dist/yetfa.prod.aab

dist/%.prod.aab: $(bundle_default_file)
	cp $< $@

$(bundle_default_file): $(CLIENT)/dist/media/bundle.obd $(CLIENT)/config.xml
	pushd $(CLIENT) && npm run package-prod


$(CLIENT)/dist/media/%.bundle.obd: $(BM_OUTPUTS)/%.bundle.obd
	cp $^ $@

$(BM_OUTPUTS)/%.bundle.obd:
	mkdir -p $(BM_OUTPUTS)/
	pushd $(MD_BUNDLER) && npm run make -- $(BM_INPUTS)/$*/ $(@D)
	mv $(@D)/bundle.obd $@

clean:
	rm -r $(CLIENT)/config.xml $(CLIENT)/dist/media/*.obd

clean-all: clean
	rm -r dist/

.PRECIOUS: $(BM_OUTPUTS)/%.bundle.obd
.PHONY: yetfa clean clean-all