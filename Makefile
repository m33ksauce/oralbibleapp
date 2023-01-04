# OBA Makefile
APPVERSION = $(shell git describe --tags)

CLIENT := $(CURDIR)/client
MD_BUNDLER := $(CURDIR)/util/md-bundler
BM_INPUTS := $(CURDIR)/bible-media/inputs
BM_OUTPUTS := $(CURDIR)/bible-media/outputs


bundle_path := $(CLIENT)/platforms/android/app/build/outputs/bundle/release
bundle_default_file := $(bundle_path)/app-release.aab

build-all: \
	build-yetfa

build-yetfa: prep-yetfa cycle-cordova-platform package-yetfa

prep-all: \
	prep-yetfa

prep-%: clean $(CLIENT)/dist/media/%.bundle.obd $(CLIENT)/config.template.xml $(CLIENT)/src/*
	mkdir -p dist/
	mv $(CLIENT)/dist/media/$*.bundle.obd $(CLIENT)/dist/media/bundle.obd
	cp $(CLIENT)/src/environments/environment.prod.$*.ts $(CLIENT)/src/environments/environment.prod.ts
	sed \
		-e 's/%%VERSION%%/$(APPVERSION)/g' \
		-e 's/%%TRANSLATION%%/$*/g' \
		$(CLIENT)/config.template.xml > \
		$(CLIENT)/config.xml

# Later, we should make this target ONLY run if something has changed in CLIENT
cycle-cordova-platform:
	pushd $(CLIENT) && \
	ionic cordova platform rm android && \
	ionic cordova platform add android

package-yetfa: dist/yetfa.prod.aab

dist/%.prod.aab: $(bundle_default_file)
	cp $< $@

$(bundle_default_file): $(CLIENT)/dist/media/bundle.obd $(CLIENT)/config.xml
	pushd $(CLIENT) && npm run package-prod


$(CLIENT)/dist/media/%.bundle.obd: $(BM_OUTPUTS)/%.bundle.obd
	mkdir -p $(CLIENT)/dist/media/
	cp $^ $@

$(BM_OUTPUTS)/%.bundle.obd:
	mkdir -p $(BM_OUTPUTS)/
	pushd $(MD_BUNDLER) && npm run make -- $(BM_INPUTS)/$*/ $(@D)
	mv $(@D)/bundle.obd $@

clean:
	rm -r $(CLIENT)/config.xml \
		$(CLIENT)/dist/media/*.obd \
		$(CLIENT)/src/environments/environment.prod.ts

clean-all: clean
	rm -r dist/

.PRECIOUS: $(BM_OUTPUTS)/%.bundle.obd
.PHONY: yetfa clean clean-all