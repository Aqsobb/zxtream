#!/bin/bash
# Z.XTREAM APK Builder - raw Android tools, no Gradle
set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
ANDROID_APP="$PROJECT_DIR/android-app"
BUILD_DIR="$ANDROID_APP/build"
SDK_PLATFORM=$(find /data/data/com.termux/files/usr/share -name "android.jar" 2>/dev/null | head -1)

echo "=== Z.XTREAM APK Builder ==="

# Check tools
for tool in aapt javac jarsigner zipalign keytool apksigner; do
    if ! command -v $tool &>/dev/null; then
        echo "ERROR: $tool not found"
        exit 1
    fi
done

# Find android.jar
if [ -z "$SDK_PLATFORM" ]; then
    # Try common Termux paths
    for p in \
        /data/data/com.termux/files/usr/share/android.jar \
        /data/data/com.termux/files/usr/lib/android.jar \
        "$ANDROID_HOME/platforms/android-33/android.jar" \
        "$ANDROID_HOME/platforms/android-34/android.jar"; do
        if [ -f "$p" ]; then
            SDK_PLATFORM="$p"
            break
        fi
    done
fi

if [ -z "$SDK_PLATFORM" ] || [ ! -f "$SDK_PLATFORM" ]; then
    echo "WARNING: android.jar not found. Attempting without..."
    SDK_PLATFORM=""
fi

# Clean
echo "[1/7] Cleaning..."
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"/{gen,obj,classes,dex}

# Generate R.java
echo "[2/7] Generating R.java..."
AAPT_ARGS=(
    package -f -m
    -J "$BUILD_DIR/gen"
    -M "$ANDROID_APP/AndroidManifest.xml"
    -S "$ANDROID_APP/res"
)
if [ -n "$SDK_PLATFORM" ]; then
    AAPT_ARGS+=(-I "$SDK_PLATFORM")
fi
aapt "${AAPT_ARGS[@]}" 2>&1

# Compile Java
echo "[3/7] Compiling Java..."
JAVA_FILES=$(find "$ANDROID_APP/src" -name "*.java")
if [ -n "$SDK_PLATFORM" ]; then
    javac -source 11 -target 11 \
        -bootclasspath "$SDK_PLATFORM" \
        -classpath "$SDK_PLATFORM" \
        -d "$BUILD_DIR/classes" \
        -sourcepath "$BUILD_DIR/gen:$ANDROID_APP/src" \
        $JAVA_FILES 2>&1
else
    javac -source 11 -target 11 \
        -d "$BUILD_DIR/classes" \
        -sourcepath "$BUILD_DIR/gen:$ANDROID_APP/src" \
        $JAVA_FILES 2>&1
fi

# Convert to dex
echo "[4/7] Converting to DEX..."
# Find dx or d8
DX_TOOL=""
if command -v d8 &>/dev/null; then
    DX_TOOL="d8"
elif command -v dx &>/dev/null; then
    DX_TOOL="dx"
elif [ -f "$ANDROID_HOME/build-tools/33.0.2/d8" ]; then
    DX_TOOL="$ANDROID_HOME/build-tools/33.0.2/d8"
elif [ -f "$ANDROID_HOME/build-tools/33.0.2/dx" ]; then
    DX_TOOL="$ANDROID_HOME/build-tools/33.0.2/dx"
fi

CLASS_FILES=$(find "$BUILD_DIR/classes" -name "*.class")
if [ "$DX_TOOL" = "d8" ]; then
    d8 --output "$BUILD_DIR/dex" --lib "$SDK_PLATFORM" $CLASS_FILES 2>&1
elif [ "$DX_TOOL" = "dx" ]; then
    dx --dex --output="$BUILD_DIR/dex/classes.dex" $CLASS_FILES 2>&1
else
    echo "ERROR: No dx/d8 tool found"
    exit 1
fi

# Package APK
echo "[5/7] Packaging APK..."
AAPT_PACK_ARGS=(
    package -f
    -M "$ANDROID_APP/AndroidManifest.xml"
    -S "$ANDROID_APP/res"
    -A "$ANDROID_APP/assets"
    -F "$BUILD_DIR/zxtream-unsigned.apk"
)
if [ -n "$SDK_PLATFORM" ]; then
    AAPT_PACK_ARGS+=(-I "$SDK_PLATFORM")
fi
aapt "${AAPT_PACK_ARGS[@]}" 2>&1

# Add dex to APK
cd "$BUILD_DIR/dex"
zip -j "$BUILD_DIR/zxtream-unsigned.apk" classes.dex
cd "$PROJECT_DIR"

# Align
echo "[6/7] Aligning APK..."
zipalign -f 4 "$BUILD_DIR/zxtream-unsigned.apk" "$BUILD_DIR/zxtream-aligned.apk"

# Sign
echo "[7/7] Signing APK..."
KEYSTORE="$PROJECT_DIR/zxtream-key.jks"
if [ ! -f "$KEYSTORE" ]; then
    echo "Generating signing key..."
    keytool -genkey -v -keystore "$KEYSTORE" \
        -keyalg RSA -keysize 2048 -validity 10000 \
        -alias zxtream \
        -storepass zxtream123 -keypass zxtream123 \
        -dname "CN=Z.XTREAM, OU=Dev, O=Z.XTREAM, L=ID, S=ID, C=ID" 2>&1
fi

apksigner sign \
    --ks "$KEYSTORE" \
    --ks-key-alias zxtream \
    --ks-pass pass:zxtream123 \
    --key-pass pass:zxtream123 \
    --out "$BUILD_DIR/zxtream.apk" \
    "$BUILD_DIR/zxtream-aligned.apk" 2>&1

# Copy to project root
cp "$BUILD_DIR/zxtream.apk" "$PROJECT_DIR/zxtream.apk"

echo ""
echo "=== BUILD SUCCESS ==="
echo "APK: $PROJECT_DIR/zxtream.apk"
echo "Size: $(du -h "$PROJECT_DIR/zxtream.apk" | cut -f1)"
echo "Package: com.zxtream.app"
