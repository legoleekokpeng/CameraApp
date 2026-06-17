import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ActivityIndicator, ScrollView, Image, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';

// Pull styling design blocks cleanly
import { 
  styles, 
  CARD_WIDTH, 
  SILHOUETTE_BOX_SIZE, 
  TOASTED_ESPRESSO, 
  SUNLIGHT_ORANGE 
} from './styles';

// --- FIXED IMAGE FILE ASSETS FROM FOLDER ---
import goldenHourImg from './assets/preset_golden_hour.jpeg';
import streetStrollImg from './assets/preset_street_stroll.png';
import y2kFlashImg from './assets/preset_y2k_flash.png';
import vintageCafeImg from './assets/preset_vintage_cafe.png';

const LENS_PROFILES = [
  { id: 'golden_hour', title: '☀️ Sun Drenched', desc: 'Warm hazy golden hour radiance.', image: goldenHourImg },
  { id: 'street_stroll', title: '🌿 Retro Chrome', desc: 'Cinematic vintage film grain look.', image: streetStrollImg },
  { id: 'y2k_flash', title: '📸 Digicam CCD', desc: 'High exposure city nightlife vibes.', image: y2kFlashImg },
  { id: 'vintage_cafe', title: '☕ Warm Matte', desc: 'Cozy interior low contrast textures.', image: vintageCafeImg },
];

const STEVE_THINKING_LOGS = [
  "🔍 Analysing the best angle...",
  "🖼️ Choosing the best background...",
  "⚙️ Changing camera configuration...",
  "🧠 Steve is calculating background structures..."
];

const SILHOUETTE_VARIATIONS = [
  { id: 'none', label: 'No Outline', icon: '🚫' },
  { id: 'portrait_close', label: 'Close-Up', icon: '👤' },
  { id: 'full_body', label: 'Full Body', icon: '🧍' },
  { id: 'sitting_pose', label: 'Sitting', icon: '🧎' },
  { id: 'candid_walk', label: 'Candid Walk', icon: '🚶' },
];

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [libraryPermission, requestLibraryPermission] = MediaLibrary.usePermissions();
  
  const [phase, setPhase] = useState('style_selection'); // style_selection, scan_ready, processing, coaching, preview, post_save
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [alertIndex, setAlertIndex] = useState(0);
  
  const [backendFeedback] = useState("Slowly scan the surrounding");
  const [photoTakingFeedback] = useState("Adjust the frame to balance the composition");

  const [activeSilhouette, setActiveSilhouette] = useState('none');
  const [timestampString, setTimestampString] = useState('');
  const [capturedPhotoUri, setCapturedPhotoUri] = useState(null);

  const cameraRef = useRef(null);

  // Re-architected thinking engine runner without any background time tracking loops
  useEffect(() => {
    if (phase !== 'scan_ready' || !isRecording) return;
    
    const alerts = setInterval(() => {
      setAlertIndex(p => {
        if (p < STEVE_THINKING_LOGS.length - 1) return p + 1;
        return p;
      });
    }, 1800);
    
    return () => clearInterval(alerts);
  }, [phase, isRecording]);

  useEffect(() => {
    if (isRecording && alertIndex === STEVE_THINKING_LOGS.length - 1) {
      const timeout = setTimeout(() => {
        setIsRecording(false);
        setPhase('processing');
      }, 1200);
      return () => clearTimeout(timeout);
    }
  }, [alertIndex, isRecording]);

  useEffect(() => {
    if (phase !== 'processing') return;
    const timeout = setTimeout(() => setPhase('coaching'), 2200);
    return () => clearTimeout(timeout);
  }, [phase]);

  // Unified reset method to clear previous dynamic configurations
  const navigateToStyleSelection = () => {
    setIsRecording(false);
    setAlertIndex(0);
    setCapturedPhotoUri(null);
    setPhase('style_selection');
  };

  const executePhotoCapture = async () => {
    if (cameraRef.current) {
      try {
        const options = { quality: 0.85, skipProcessing: false };
        const photo = await cameraRef.current.takePictureAsync(options);
        setCapturedPhotoUri(photo.uri);
        
        const now = new Date();
        const formattedDate = now.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
        const formattedTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
        setTimestampString(`${formattedDate}  ${formattedTime}`);
        
        setPhase('preview');
      } catch (error) {
        console.log("Error capturing local photo file structure:", error);
      }
    }
  };

  const handleSaveToGallery = async () => {
    try {
      let currentPermission = libraryPermission;
      if (!currentPermission || currentPermission.status !== 'granted') {
        currentPermission = await requestLibraryPermission();
      }

      if (currentPermission.status === 'granted') {
        if (capturedPhotoUri) {
          await MediaLibrary.createAssetAsync(capturedPhotoUri);
          setPhase('post_save');
        }
      } else {
        Alert.alert(
          "Permission Denied", 
          "Cannot save picture without device storage system approvals.",
          [{ text: "OK" }]
        );
      }
    } catch (err) {
      console.log("Failed to write asset onto camera roll:", err);
      Alert.alert("Error", "Failed to commit image conversion safely.");
    }
  };

  if (!permission) return <View style={styles.centerContainer}><ActivityIndicator size="small" color={TOASTED_ESPRESSO} /></View>;
  if (!permission.granted) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.permissionText}>[FILM ADVANCE FAILURE] Allow lens access to expose the vintage backing plates.</Text>
        <TouchableOpacity style={styles.hardwarePrimaryBtn} onPress={requestPermission}>
          <Text style={styles.btnText}>OPEN LENS BARREL</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (phase === 'style_selection') {
    return (
      <SafeAreaView style={styles.texturedMainContainer}>
        <View style={styles.filmLightLeakOverlay} pointerEvents="none" />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 16 }} style={styles.foregroundContentLayer}>
          <View style={styles.hardwareSystemHeader}>
            <Text style={styles.steveSlantedLogo}>steve</Text>
            <Text style={styles.hardwareSubscript}>MAKE EVERY MEMORY SHINE</Text>
          </View>

          <TouchableOpacity style={styles.texturedCalibrationBanner} onPress={() => { setSelectedStyle({ id: 'custom', title: "Uploaded Style" }); setPhase('scan_ready'); }}>
            <View style={styles.woodAccentTrimmingEdge} />
            <Text style={styles.calibrationCardTitle}>Upload your style</Text>
            <Text style={styles.calibrationCardDesc}>Take photo of similar style to that of your uploaded image</Text>
          </TouchableOpacity>

          <Text style={styles.systemSectionDividerLabel}>Select Atmosphere Core</Text>

          <View style={styles.twoColumnGridDeck}>
            {LENS_PROFILES.map((profile) => (
              <TouchableOpacity key={profile.id} style={styles.squareGridCard} onPress={() => { setSelectedStyle(profile); setPhase('scan_ready'); }}>
                <View style={styles.squareCardImagePlaceholder}>
                  <Image source={profile.image} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                  <View style={styles.cardInternalVignette} />
                </View>
                <View style={styles.squareCardTextContainer}>
                  <Text style={styles.squareCardTitle}>{profile.title}</Text>
                  <Text style={styles.squareCardDesc}>{profile.desc}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // --- POST SAVE CONFIRMATION INTERFACE ---
  if (phase === 'post_save') {
    return (
      <SafeAreaView style={styles.texturedMainContainer}>
        <View style={styles.filmLightLeakOverlay} pointerEvents="none" />
        <View style={[styles.foregroundContentLayer, localStyles.postSaveContentCasing]}>
          
          <View style={localStyles.statusBadgeContainer}>
            <Text style={localStyles.successCheckmarkIcon}>💾</Text>
            <Text style={localStyles.successTitleLabel}>SAVED TO GALLERY!</Text>
          </View>

          <View style={localStyles.enlargedActionStackVertical}>
            <TouchableOpacity 
              style={localStyles.giantCasingButton} 
              onPress={navigateToStyleSelection}
            >
              <Text style={localStyles.giantButtonText}>Change Style</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={localStyles.giantCasingButton} 
              onPress={() => { setAlertIndex(0); setIsRecording(false); setPhase('coaching'); }}
            >
              <Text style={localStyles.giantButtonText}>Retake Image</Text>
            </TouchableOpacity>
          </View>

        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.viewfinderContainer}>
      {phase !== 'preview' ? (
        <View style={StyleSheet.absoluteFillObject}>
          <CameraView style={StyleSheet.absoluteFillObject} ref={cameraRef}>
            {phase === 'scan_ready' && (
              <SafeAreaView style={StyleSheet.absoluteFillObject}>
                <View style={styles.hudFlexMechanics}>
                  <View style={styles.lcdTelemetryStripHeader}>
                    <View />
                    <Text style={styles.lcdOverlayText}>{isRecording ? 'SCANNING' : 'READY'}</Text>
                  </View>
                  <View style={styles.mechanicalCoachWrapper}>
                    <View style={styles.mechanicalCoachCard}>
                      <Text style={styles.mechanicalCoachBodyString}>{backendFeedback}</Text>
                    </View>
                  </View>
                  <View style={styles.hardwareBottomDeckCasing}>
                    <View style={styles.woodAccentTrimmingEdgeTop} />
                    <TouchableOpacity style={styles.circularMechanicalShutterOuter} onPress={() => setIsRecording(!isRecording)}>
                      <View style={[styles.circularMechanicalShutterInner, isRecording ? styles.shutterPulseAmberBg : styles.shutterCalmGreyBg]} />
                    </TouchableOpacity>
                    <Text style={styles.deckHardwareInstructionSubText}>TAP TO START ENVIRONMENT SCAN</Text>
                  </View>
                </View>
              </SafeAreaView>
            )}

            {phase === 'processing' && (
              <View style={styles.processingScrimBackground}>
                <View style={styles.mechanicalProcessingBox}>
                  <ActivityIndicator size="small" color={TOASTED_ESPRESSO} style={{ marginBottom: 14 }} />
                  <Text style={styles.mechanicalProcessingTitle}>STEVE IS THINKING...</Text>
                  <Text style={styles.mechanicalProcessingDesc}>{STEVE_THINKING_LOGS[alertIndex]}</Text>
                </View>
              </View>
            )}

            {phase === 'coaching' && (
              <SafeAreaView style={StyleSheet.absoluteFillObject}>
                <View style={styles.hudFlexMechanics}>
                  <View style={styles.cleanThemeHeaderContainer}>
                    <Text style={styles.cleanThemeHeaderText}>{selectedStyle?.title.toUpperCase()}</Text>
                  </View>
                  <View style={styles.mechanicalCoachWrapper}>
                    <View style={styles.transparentLiveFeedbackCard}>
                      <Text style={styles.liveFeedbackBodyString}>{photoTakingFeedback}</Text>
                    </View>
                  </View>

                  {activeSilhouette !== 'none' && (
                    <View style={styles.silhouetteOverlayContainer} pointerEvents="none">
                      <View style={styles.stylizedChassisTracingFrame}>
                        <Text style={styles.silhouetteTraceTextLabel}>[ POSE TRACE GUIDE ]</Text>
                        <View style={styles.silhouetteVectorGraphicCore} />
                      </View>
                    </View>
                  )}

                  <View style={{ width: '100%' }}>
                    <View style={styles.carouselContainerRow}>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carouselScrollContent}>
                        {SILHOUETTE_VARIATIONS.map((item) => (
                          <TouchableOpacity
                            key={item.id}
                            style={[styles.squarishCarouselCard, activeSilhouette === item.id && styles.squarishCarouselCardActive]}
                            onPress={() => setActiveSilhouette(item.id)}
                          >
                            <View style={styles.squarishCardVisualPreviewChassis}>
                              <Text style={styles.carouselTextFallbackBadge}>{item.icon}</Text>
                            </View>
                            <Text style={[styles.squarishCardLabel, activeSilhouette === item.id && styles.squarishCardLabelActive]} numberOfLines={1}>
                              {item.label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                    <View style={styles.texturedNotebookDeck}>
                      <View style={styles.woodAccentTrimmingEdgeTop} />
                      <View style={styles.notebookFooterActionWrapper}>
                        <TouchableOpacity style={styles.mechanicalTriggerButtonOuter} onPress={executePhotoCapture}>
                          <View style={styles.mechanicalTriggerButtonInner} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              </SafeAreaView>
            )}
          </CameraView>
        </View>
      ) : (
        <View style={styles.previewWorkbenchWrapper}>
          <View style={styles.viewfinderLightLeakOverlay} pointerEvents="none" />
          <SafeAreaView style={styles.previewForegroundContainer}>
            <View style={styles.previewActionHeaderBar}>
              <Text style={styles.vintageLabelFont}>{selectedStyle?.title.toUpperCase()}</Text>
              <TouchableOpacity style={styles.hardwarePrimaryBtn} onPress={handleSaveToGallery}>
                <Text style={styles.btnText}>SAVE PHOTO 💾</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.lcdPreviewMatteChassis}>
              <View style={styles.lcdPreviewScreenImageArea}>
                {capturedPhotoUri ? (
                  <Image source={{ uri: capturedPhotoUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                ) : (
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 64, textAlign: 'center' }}>📸</Text>
                    <Text style={styles.previewSimulationPlaceholderLabel}>IMAGE CAPTURE ERROR</Text>
                  </View>
                )}
              </View>
              <View style={styles.lcdPreviewBottomSubscriptSection}>
                <Text style={styles.lcdMetadataText}>{timestampString}</Text>
              </View>
            </View>
            <View style={styles.dualSplitActionContainerFooter}>
              <TouchableOpacity style={[styles.splitBoxActionItemButton, styles.leftSplitBorder]} onPress={navigateToStyleSelection}>
                <Text style={styles.splitBoxButtonText}>Change Style</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.splitBoxActionItemButton} onPress={() => { setAlertIndex(0); setIsRecording(false); setPhase('coaching'); }}>
                <Text style={styles.splitBoxButtonText}>Retake Image</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      )}
    </View>
  );
}

// Local scoping styles dedicated to the clean Post-Save Menu
const localStyles = StyleSheet.create({
  postSaveContentCasing: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  statusBadgeContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  successCheckmarkIcon: {
    fontSize: 56,
    marginBottom: 16,
  },
  successTitleLabel: {
    fontSize: 18,
    fontWeight: '900',
    color: TOASTED_ESPRESSO,
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  enlargedActionStackVertical: {
    width: '100%',
    alignItems: 'center',
    gap: 20,
    marginBottom: 80,
  },
  giantCasingButton: {
    width: '90%',
    paddingVertical: 24, 
    borderRadius: 4,
    borderWidth: 2,
    borderColor: TOASTED_ESPRESSO,
    backgroundColor: '#FFFDF6', 
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: TOASTED_ESPRESSO,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
  },
  giantButtonText: {
    fontSize: 15,
    fontWeight: '900',
    color: TOASTED_ESPRESSO, 
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
