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
	build-tangko \
	build-bahasa_kimki \
	build-bahasa_dou \
	build-bahasa_fayu \
	build-bahasa_sikari \
	build-bahasa_walak \
	build-abawiri

build-yetfa: prep-yetfa cycle-cordova-platform package-yetfa

build-papuan_malay: prep-papuan_malay cycle-cordova-platform package-papuan_malay

build-tangko: prep-tangko cycle-cordova-platform package-tangko

build-bahasa_kimki: prep-bahasa_kimki cycle-cordova-platform package-bahasa_kimki

build-bahasa_dou: prep-bahasa_dou cycle-cordova-platform package-bahasa_dou

build-bahasa_fayu: prep-bahasa_fayu cycle-cordova-platform package-bahasa_fayu

build-bahasa_sikari: prep-bahasa_sikari cycle-cordova-platform package-bahasa_sikari

build-bahasa_walak: prep-bahasa_walak cycle-cordova-platform package-bahasa_walak

build-abawiri: prep-abawiri cycle-cordova-platform package-abawiri

prep-all: \
	prep-yetfa \
	prep-papuan_malay \
	prep-tangko \
	prep-bahasa_kimki \
	prep-bahasa_dou \
	prep-bahasa_fayu \
	prep-bahasa_sikari \
	prep-bahasa_walak \
	prep-abawiri

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

package-bahasa_kimki: dist/bahasa_kimki.prod.aab

package-bahasa_dou: dist/bahasa_dou.prod.aab

package-bahasa_fayu: dist/bahasa_fayu.prod.aab

package-bahasa_sikari: dist/bahasa_sikari.prod.aab

package-bahasa_walak: dist/bahasa_walak.prod.aab

package-abawiri: dist/abawiri.prod.aab

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