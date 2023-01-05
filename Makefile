# OBA Makefile
APPVERSION = $(shell git describe --tags)

CLIENT := $(CURDIR)/client
MD_BUNDLER := $(CURDIR)/util/md-bundler
BM_INPUTS := $(CURDIR)/bible-media/inputs
BM_OUTPUTS := $(CURDIR)/bible-media/outputs


bundle_path := $(CLIENT)/platforms/android/app/build/outputs/bundle/release
bundle_default_file := $(bundle_path)/app-release.aab

build-all: \
	build-yetfa \
	build-papuan_malay \
	build-tangko

build-yetfa: prep-yetfa cycle-cordova-platform package-yetfa

build-papuan_malay: prep-papuan_malay cycle-cordova-platform package-papuan_malay

build-tangko: prep-tangko cycle-cordova-platform package-tangko

prep-all: \
	prep-yetfa \
	prep-papuan_malay \
	prep-tangko

prep-%: $(CLIENT)/dist/media/%.bundle.obd $(CLIENT)/src/*
	mkdir -p dist/
	mv $(CLIENT)/dist/media/$*.bundle.obd $(CLIENT)/dist/media/bundle.obd
	cp $(CLIENT)/src/environments/environment.prod.$*.ts $(CLIENT)/src/environments/environment.prod.ts
	sed \
		-e 's/%%VERSION%%/$(APPVERSION)/g' \
		$(CLIENT)/config/config.$*.xml > \
		$(CLIENT)/config.xml

# Later, we should make this target ONLY run if something has changed in CLIENT
cycle-cordova-platform:
	pushd $(CLIENT) && \
	ionic cordova platform rm android && \
	ionic cordova platform add android

package-yetfa: dist/yetfa.prod.aab

package-papuan_malay: dist/papuan_malay.prod.aab

package-tangko: dist/tangko.prod.aab

dist/%.prod.aab: $(CLIENT)/dist/media/bundle.obd $(CLIENT)/config.xml
	pushd $(CLIENT) && npm run package-prod 
	cp $(bundle_default_file) $@

$(CLIENT)/dist/media/%.bundle.obd: $(BM_OUTPUTS)/%.bundle.obd
	mkdir -p $(CLIENT)/dist/media/
	cp $^ $@

$(BM_OUTPUTS)/%.bundle.obd:
	mkdir -p $(BM_OUTPUTS)/
	pushd $(MD_BUNDLER) && npm run make -- $(BM_INPUTS)/$*/ $(@D)
	mv $(@D)/bundle.obd $@

clean:
	-rm -r $(CLIENT)/config.xml \
		$(CLIENT)/dist/media/*.obd \
		$(CLIENT)/src/environments/environment.prod.ts \
		$(bundle_default_file)

clean-all: clean
	-rm -r dist/ $(BM_OUTPUTS)/

.PRECIOUS: $(BM_OUTPUTS)/%.bundle.obd
.PHONY: yetfa clean clean-all