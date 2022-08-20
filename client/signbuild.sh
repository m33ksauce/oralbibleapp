#!/bin/bash
ARTIFACT_PATH=./artifacts
APK_PATH=./platforms/android/app/build/outputs/apk/release
SIGNED_APK=$APK_PATH/app-release.apk
UNSIGNED_APK=$APK_PATH/app-release-unsigned.apk

$ANDROID_HOME/build-tools/27.0.3/apksigner sign --key crypto/debug/encKey.pk8 --cert crypto/debug/certificate.crt --out $SIGNED_APK $UNSIGNED_APK
mkdir -p $ARTIFACT_PATH

cp $SIGNED_APK $ARTIFACT_PATH