import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import {
  styles,
  TOASTED_ESPRESSO,
} from './styles';

// --- PRESET STYLE IMAGES ---
import goldenHourImg from './assets/preset_golden_hour.jpeg';
import streetStrollImg from './assets/preset_street_stroll.png';
import y2kFlashImg from './assets/preset_y2k_flash.png';
import vintageCafeImg from './assets/preset_vintage_cafe.png';

// --- WARM MATTE TRANSPARENT POSE FRAMES ---
import warmCafe from './assets/warm matte_caffe.png';
import warmCutePose from './assets/warm_cute_pose.png';
import warmHoldingDrink from './assets/warm_holding_drink.png';

// --- RETRO TRANSPARENT POSE FRAMES ---
import retroTouchHair from './assets/retro_touch hair.png';
import retroHandUp from './assets/retro_hand_up.png';
import retroHandOnWaist from './assets/retro_hand_on_waist.png';

// --- SUN DRENCHED TRANSPARENT POSE FRAMES ---
import sunHoldingFlower from './assets/sun_holding_flower.png';
import sunLookback from './assets/sun_lookback.png';
import sunOpenArm from './assets/sun_open_arm.png';
import sunTurnHead from './assets/sun_turnhead.png';

// --- DIGICAM TRANSPARENT POSE FRAMES ---
import digicamHandUp from './assets/digicam_hand_up.png';
import digicamOpenArm from './assets/digicam_open_arm.png';
import digicamSitting from './assets/digicam_sitting.png';
import digicamNightStanding from './assets/digicam_night_standing.png';

// Your current ngrok URL.
// Update this when ngrok gives you a new URL.
const BACKEND_BASE_URL = 'https://distract-pamphlet-factsheet.ngrok-free.dev';

const LENS_PROFILES = [
  {
    id: 'golden_hour',
    title: '☀️ Sun Drenched',
    desc: 'Warm hazy golden hour radiance.',
    image: goldenHourImg,
  },
  {
    id: 'street_stroll',
    title: '🌿 Retro Chrome',
    desc: 'Cinematic vintage film grain look.',
    image: streetStrollImg,
  },
  {
    id: 'y2k_flash',
    title: '📸 Digicam CCD',
    desc: 'High exposure city nightlife vibes.',
    image: y2kFlashImg,
  },
  {
    id: 'vintage_cafe',
    title: '☕ Warm Matte',
    desc: 'Cozy interior low contrast textures.',
    image: vintageCafeImg,
  },
];

const STEVE_THINKING_LOGS = [
  '🔍 Analysing the best angle...',
  '🖼️ Choosing the best background...',
  '⚙️ Changing camera configuration...',
  '🧠 Steve is calculating background structures...',
];

const NO_FRAME_OPTION = {
  id: 'none',
  label: 'No Frame',
  image: null,
  guideWidth: 0,
  guideHeight: 0,
  instruction: '',
};

const THEME_POSE_FRAMES = {
  // ☕ Warm Matte
  vintage_cafe: [
    {
      id: 'warm_cafe',
      label: 'Cafe Lean',
      image: warmCafe,
      guideWidth: 230,
      guideHeight: 370,
      instruction: 'Lean softly forward and rest your hand near your face.',
    },
    {
      id: 'warm_cute_pose',
      label: 'Cute Paw Pose',
      image: warmCutePose,
      guideWidth: 240,
      guideHeight: 370,
      instruction: 'Raise both hands near your face for a playful look.',
    },
    {
      id: 'warm_holding_drink',
      label: 'Coffee Hold',
      image: warmHoldingDrink,
      guideWidth: 230,
      guideHeight: 370,
      instruction: 'Hold the drink near your chest and face the camera softly.',
    },
  ],

  // 🌿 Retro Chrome
  street_stroll: [
    {
      id: 'retro_touch_hair',
      label: 'Retro Hair Touch',
      image: retroTouchHair,
      guideWidth: 240,
      guideHeight: 380,
      instruction: 'Touch your hair and angle your body slightly sideways.',
    },
    {
      id: 'retro_hand_up',
      label: 'Stretch Pose',
      image: retroHandUp,
      guideWidth: 210,
      guideHeight: 430,
      instruction: 'Raise both arms overhead and stretch your body upward.',
    },
    {
      id: 'retro_hand_on_waist',
      label: 'Waist Pose',
      image: retroHandOnWaist,
      guideWidth: 230,
      guideHeight: 380,
      instruction: 'Place both hands near your waist and tilt your shoulders.',
    },
  ],

  // ☀️ Sun Drenched
  golden_hour: [
    {
      id: 'sun_holding_flower',
      label: 'Flower Side',
      image: sunHoldingFlower,
      guideWidth: 230,
      guideHeight: 380,
      instruction: 'Turn sideways and hold the flowers close to your body.',
    },
    {
      id: 'sun_lookback',
      label: 'Look Back',
      image: sunLookback,
      guideWidth: 220,
      guideHeight: 390,
      instruction: 'Turn your body away and look back toward the camera.',
    },
    {
      id: 'sun_open_arm',
      label: 'Open Arms',
      image: sunOpenArm,
      guideWidth: 260,
      guideHeight: 410,
      instruction: 'Open your arms wide and lean slightly toward the light.',
    },
    {
      id: 'sun_turnhead',
      label: 'Sunlit Turn',
      image: sunTurnHead,
      guideWidth: 240,
      guideHeight: 390,
      instruction: 'Tilt your head naturally and let your hair frame your face.',
    },
  ],

  // 📸 Digicam CCD
  y2k_flash: [
    {
      id: 'digicam_hand_up',
      label: 'Hand Up',
      image: digicamHandUp,
      guideWidth: 210,
      guideHeight: 430,
      instruction: 'Raise both arms overhead and bend one leg slightly.',
    },
    {
      id: 'digicam_open_arm',
      label: 'Flash Energy',
      image: digicamOpenArm,
      guideWidth: 250,
      guideHeight: 430,
      instruction: 'Open your arms wide and keep your pose energetic.',
    },
    {
      id: 'digicam_sitting',
      label: 'Stair Sit',
      image: digicamSitting,
      guideWidth: 260,
      guideHeight: 400,
      instruction: 'Sit with knees bent and rest one hand near your face.',
    },
    {
      id: 'digicam_night_standing',
      label: 'Night Stand',
      image: digicamNightStanding,
      guideWidth: 220,
      guideHeight: 430,
      instruction: 'Stand relaxed with one knee slightly bent.',
    },
  ],
};

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [libraryPermission, requestLibraryPermission] = MediaLibrary.usePermissions();

  const [phase, setPhase] = useState('style_selection');
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [alertIndex, setAlertIndex] = useState(0);

  const [backendFeedback] = useState('Slowly scan the surrounding');

  const [aiFeedback, setAiFeedback] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const [liveAdvice, setLiveAdvice] = useState(
    'Move your camera slowly and keep the subject in frame.'
  );
  const [isLiveAdviceLoading, setIsLiveAdviceLoading] = useState(false);
  const [liveAdviceEnabled, setLiveAdviceEnabled] = useState(false);

  const [activeSilhouette, setActiveSilhouette] = useState('none');
  const [timestampString, setTimestampString] = useState('');
  const [capturedPhotoUri, setCapturedPhotoUri] = useState(null);

  const cameraRef = useRef(null);

  const currentThemeFrames = selectedStyle?.id
    ? [NO_FRAME_OPTION, ...(THEME_POSE_FRAMES[selectedStyle.id] || [])]
    : [NO_FRAME_OPTION];

  const currentPoseGuide = currentThemeFrames.find(
    (item) => item.id === activeSilhouette
  );

  useEffect(() => {
    if (phase !== 'scan_ready' || !isRecording) return;

    const alerts = setInterval(() => {
      setAlertIndex((p) => {
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

    const timeout = setTimeout(() => {
      setPhase('coaching');
      setLiveAdvice('Steve is checking your frame...');
      setLiveAdviceEnabled(true);
    }, 2200);

    return () => clearTimeout(timeout);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'coaching' || !liveAdviceEnabled) {
      return;
    }

    let stopped = false;
    let timeoutId = null;

    const runLiveAdviceLoop = async () => {
      if (stopped || phase !== 'coaching' || !liveAdviceEnabled) {
        return;
      }

      await analyzeLiveFrame();

      if (!stopped) {
        timeoutId = setTimeout(runLiveAdviceLoop, 5000);
      }
    };

    timeoutId = setTimeout(runLiveAdviceLoop, 1000);

    return () => {
      stopped = true;

      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [phase, liveAdviceEnabled]);

  const navigateToStyleSelection = () => {
    setIsRecording(false);
    setAlertIndex(0);
    setCapturedPhotoUri(null);
    setAiFeedback(null);
    setIsAiLoading(false);
    setLiveAdviceEnabled(false);
    setIsLiveAdviceLoading(false);
    setLiveAdvice('Move your camera slowly and keep the subject in frame.');
    setActiveSilhouette('none');
    setPhase('style_selection');
  };

  const analyzeLiveFrame = async () => {
    if (!cameraRef.current || isLiveAdviceLoading || phase !== 'coaching') {
      return;
    }

    try {
      setIsLiveAdviceLoading(true);

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.35,
        skipProcessing: true,
      });

      const formData = new FormData();

      formData.append('image', {
        uri: photo.uri,
        name: 'live-frame.jpg',
        type: 'image/jpeg',
      });

      const response = await fetch(`${BACKEND_BASE_URL}/analyze-live-frame`, {
        method: 'POST',
        body: formData,
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
      });

      const responseText = await response.text();
      console.log('Live backend raw response:', responseText);

      let data;

      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.log('Live JSON parse error:', jsonError);
        return;
      }

      if (data.live_advice) {
        setLiveAdvice(data.live_advice);
      } else if (data.phase_control?.coaching) {
        setLiveAdvice(data.phase_control.coaching);
      } else {
        setLiveAdvice('Hold steady and keep the subject clearly framed.');
      }
    } catch (error) {
      console.log('Live AI advice error:', error);
      setLiveAdvice('Hold steady and keep the subject in frame.');
    } finally {
      setIsLiveAdviceLoading(false);
    }
  };

  const executePhotoCapture = async () => {
    setLiveAdviceEnabled(false);

    if (cameraRef.current) {
      try {
        const options = {
          quality: 0.85,
          skipProcessing: false,
        };

        const photo = await cameraRef.current.takePictureAsync(options);

        setCapturedPhotoUri(photo.uri);

        const now = new Date();

        const formattedDate = now.toLocaleDateString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });

        const formattedTime = now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });

        setTimestampString(`${formattedDate}  ${formattedTime}`);
        setPhase('preview');

        setAiFeedback(null);
        setIsAiLoading(true);

        const formData = new FormData();

        formData.append('image', {
          uri: photo.uri,
          name: 'capture.jpg',
          type: 'image/jpeg',
        });

        try {
          const response = await fetch(`${BACKEND_BASE_URL}/analyze-moodboard`, {
            method: 'POST',
            body: formData,
            headers: {
              'ngrok-skip-browser-warning': 'true',
            },
          });

          const responseText = await response.text();
          console.log('Backend raw response:', responseText);

          let aiData;

          try {
            aiData = JSON.parse(responseText);
          } catch (jsonError) {
            throw new Error('Backend did not return JSON. Check your ngrok URL.');
          }

          if (!response.ok) {
            throw new Error(
              aiData.error || aiData.error_debug || `Backend returned ${response.status}`
            );
          }

          if (aiData.error) {
            throw new Error(aiData.error);
          }

          const feedbackText = `🎥 Frame: ${
            aiData.phase_control?.coaching || 'No frame advice'
          }

🧍 Pose: ${aiData.visual_cues?.coaching || 'No pose advice'}

🎭 Face: ${aiData.facial_guides?.coaching || 'No facial advice'}`;

          setAiFeedback(feedbackText);
          Alert.alert("🎬 Steve's Directives", feedbackText);
        } catch (err) {
          console.log('Backend error:', err);

          const errorMessage = `AI server error: ${err.message}

Check:
1. node server.js is running
2. ngrok http 5000 is running
3. BACKEND_BASE_URL is your real ngrok HTTPS URL
4. Open /health using your ngrok URL`;

          setAiFeedback(errorMessage);
          Alert.alert('Network Error', errorMessage);
        } finally {
          setIsAiLoading(false);
        }
      } catch (error) {
        console.log('Error capturing local photo file structure:', error);
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
          'Permission Denied',
          'Cannot save picture without device storage approval.',
          [{ text: 'OK' }]
        );
      }
    } catch (err) {
      console.log('Failed to write asset onto camera roll:', err);
      Alert.alert('Error', 'Failed to save image.');
    }
  };

  if (!permission) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="small" color={TOASTED_ESPRESSO} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.permissionText}>
          [FILM ADVANCE FAILURE] Allow lens access to expose the vintage backing plates.
        </Text>

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

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 40,
            paddingHorizontal: 16,
          }}
          style={styles.foregroundContentLayer}
        >
          <View style={styles.hardwareSystemHeader}>
            <Text style={styles.steveSlantedLogo}>steve</Text>
            <Text style={styles.hardwareSubscript}>MAKE EVERY MEMORY SHINE</Text>
          </View>

          <TouchableOpacity
            style={styles.texturedCalibrationBanner}
            onPress={() => {
              setSelectedStyle({
                id: 'custom',
                title: 'Uploaded Style',
              });
              setActiveSilhouette('none');
              setPhase('scan_ready');
            }}
          >
            <View style={styles.woodAccentTrimmingEdge} />
            <Text style={styles.calibrationCardTitle}>Upload your style</Text>
            <Text style={styles.calibrationCardDesc}>
              Take photo of similar style to that of your uploaded image
            </Text>
          </TouchableOpacity>

          <Text style={styles.systemSectionDividerLabel}>Select Atmosphere Core</Text>

          <View style={styles.twoColumnGridDeck}>
            {LENS_PROFILES.map((profile) => (
              <TouchableOpacity
                key={profile.id}
                style={styles.squareGridCard}
                onPress={() => {
                  setSelectedStyle(profile);
                  setActiveSilhouette('none');
                  setPhase('scan_ready');
                }}
              >
                <View style={styles.squareCardImagePlaceholder}>
                  <Image
                    source={profile.image}
                    style={{
                      width: '100%',
                      height: '100%',
                    }}
                    resizeMode="cover"
                  />
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
              onPress={() => {
                setAlertIndex(0);
                setIsRecording(false);
                setAiFeedback(null);
                setCapturedPhotoUri(null);
                setLiveAdvice('Move your camera slowly and keep the subject in frame.');
                setLiveAdviceEnabled(true);
                setPhase('coaching');
              }}
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
                    <Text style={styles.lcdOverlayText}>
                      {isRecording ? 'SCANNING' : 'READY'}
                    </Text>
                  </View>

                  <View style={styles.mechanicalCoachWrapper}>
                    <View style={styles.mechanicalCoachCard}>
                      <Text style={styles.mechanicalCoachBodyString}>
                        {backendFeedback}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.hardwareBottomDeckCasing}>
                    <View style={styles.woodAccentTrimmingEdgeTop} />

                    <TouchableOpacity
                      style={styles.circularMechanicalShutterOuter}
                      onPress={() => setIsRecording(!isRecording)}
                    >
                      <View
                        style={[
                          styles.circularMechanicalShutterInner,
                          isRecording
                            ? styles.shutterPulseAmberBg
                            : styles.shutterCalmGreyBg,
                        ]}
                      />
                    </TouchableOpacity>

                    <Text style={styles.deckHardwareInstructionSubText}>
                      TAP TO START ENVIRONMENT SCAN
                    </Text>
                  </View>
                </View>
              </SafeAreaView>
            )}

            {phase === 'processing' && (
              <View style={styles.processingScrimBackground}>
                <View style={styles.mechanicalProcessingBox}>
                  <ActivityIndicator
                    size="small"
                    color={TOASTED_ESPRESSO}
                    style={{ marginBottom: 14 }}
                  />

                  <Text style={styles.mechanicalProcessingTitle}>
                    STEVE IS THINKING...
                  </Text>

                  <Text style={styles.mechanicalProcessingDesc}>
                    {STEVE_THINKING_LOGS[alertIndex]}
                  </Text>
                </View>
              </View>
            )}

            {phase === 'coaching' && (
              <SafeAreaView style={StyleSheet.absoluteFillObject}>
                <View style={styles.hudFlexMechanics}>
                  <View style={styles.cleanThemeHeaderContainer}>
                    <Text style={styles.cleanThemeHeaderText}>
                      {selectedStyle?.title?.toUpperCase()}
                    </Text>
                  </View>

                  <View style={styles.mechanicalCoachWrapper}>
                    <View style={styles.transparentLiveFeedbackCard}>
                      <Text style={styles.liveFeedbackBodyString}>
                        {isLiveAdviceLoading
                          ? 'Steve is checking your frame...'
                          : liveAdvice}
                      </Text>
                    </View>
                  </View>

                  {activeSilhouette !== 'none' && currentPoseGuide?.image && (
                    <View style={localStyles.poseGuideOverlay} pointerEvents="none">
                      <Text style={localStyles.poseGuideTitle}>
                        {currentPoseGuide.label}
                      </Text>

                      <Image
                        source={currentPoseGuide.image}
                        style={[
                          localStyles.poseGuideImage,
                          {
                            width: currentPoseGuide.guideWidth,
                            height: currentPoseGuide.guideHeight,
                          },
                        ]}
                        resizeMode="contain"
                      />

                      <View style={localStyles.poseInstructionBox}>
                        <Text style={localStyles.poseInstructionText}>
                          {currentPoseGuide.instruction}
                        </Text>
                      </View>
                    </View>
                  )}

                  <View style={{ width: '100%' }}>
                    <View style={styles.carouselContainerRow}>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.carouselScrollContent}
                      >
                        {currentThemeFrames.map((item) => (
                          <TouchableOpacity
                            key={item.id}
                            style={[
                              styles.squarishCarouselCard,
                              activeSilhouette === item.id &&
                                styles.squarishCarouselCardActive,
                            ]}
                            onPress={() => setActiveSilhouette(item.id)}
                          >
                            <View style={styles.squarishCardVisualPreviewChassis}>
                              {item.image ? (
                                <Image
                                  source={item.image}
                                  style={localStyles.poseThumbnail}
                                  resizeMode="contain"
                                />
                              ) : (
                                <Text style={styles.carouselTextFallbackBadge}>
                                  🚫
                                </Text>
                              )}
                            </View>

                            <Text
                              style={[
                                styles.squarishCardLabel,
                                activeSilhouette === item.id &&
                                  styles.squarishCardLabelActive,
                              ]}
                              numberOfLines={1}
                            >
                              {item.label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>

                    <View style={styles.texturedNotebookDeck}>
                      <View style={styles.woodAccentTrimmingEdgeTop} />

                      <View style={styles.notebookFooterActionWrapper}>
                        <TouchableOpacity
                          style={styles.mechanicalTriggerButtonOuter}
                          onPress={executePhotoCapture}
                        >
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
              <Text style={styles.vintageLabelFont}>
                {selectedStyle?.title?.toUpperCase()}
              </Text>

              <TouchableOpacity style={styles.hardwarePrimaryBtn} onPress={handleSaveToGallery}>
                <Text style={styles.btnText}>SAVE PHOTO 💾</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.lcdPreviewMatteChassis}>
              <View style={styles.lcdPreviewScreenImageArea}>
                {capturedPhotoUri ? (
                  <Image
                    source={{ uri: capturedPhotoUri }}
                    style={{
                      width: '100%',
                      height: '100%',
                    }}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 64, textAlign: 'center' }}>📸</Text>
                    <Text style={styles.previewSimulationPlaceholderLabel}>
                      IMAGE CAPTURE ERROR
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.lcdPreviewBottomSubscriptSection}>
                <Text style={styles.lcdMetadataText}>{timestampString}</Text>
              </View>
            </View>

            <View style={localStyles.aiFeedbackCard}>
              <Text style={localStyles.aiFeedbackTitle}>
                {isAiLoading ? 'STEVE IS ANALYSING...' : 'STEVE DIRECTIVES'}
              </Text>

              {isAiLoading ? (
                <ActivityIndicator size="small" color={TOASTED_ESPRESSO} />
              ) : (
                <Text style={localStyles.aiFeedbackText}>
                  {aiFeedback || 'Take a photo to receive AI coaching.'}
                </Text>
              )}
            </View>

            <View style={styles.dualSplitActionContainerFooter}>
              <TouchableOpacity
                style={[styles.splitBoxActionItemButton, styles.leftSplitBorder]}
                onPress={navigateToStyleSelection}
              >
                <Text style={styles.splitBoxButtonText}>Change Style</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.splitBoxActionItemButton}
                onPress={() => {
                  setAlertIndex(0);
                  setIsRecording(false);
                  setAiFeedback(null);
                  setCapturedPhotoUri(null);
                  setLiveAdvice('Move your camera slowly and keep the subject in frame.');
                  setLiveAdviceEnabled(true);
                  setPhase('coaching');
                }}
              >
                <Text style={styles.splitBoxButtonText}>Retake Image</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      )}
    </View>
  );
}

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

  aiFeedbackCard: {
    width: '100%',
    backgroundColor: '#FFFDF6',
    borderWidth: 1.5,
    borderColor: TOASTED_ESPRESSO,
    padding: 12,
    marginVertical: 10,
  },

  aiFeedbackTitle: {
    color: TOASTED_ESPRESSO,
    fontSize: 12,
    fontWeight: '900',
    fontFamily: 'monospace',
    marginBottom: 8,
  },

  aiFeedbackText: {
    color: TOASTED_ESPRESSO,
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'Courier',
    lineHeight: 16,
  },

  poseGuideOverlay: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    bottom: 170,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },

  poseGuideTitle: {
    position: 'absolute',
    top: 8,
    color: '#FFFDF6',
    backgroundColor: 'rgba(30, 22, 16, 0.72)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 11,
    fontWeight: '900',
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },

  poseGuideImage: {
    opacity: 0.68,
  },

  poseInstructionBox: {
    position: 'absolute',
    bottom: 8,
    backgroundColor: 'rgba(30, 22, 16, 0.72)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    maxWidth: '84%',
  },

  poseInstructionText: {
    color: '#FFFDF6',
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'monospace',
    textAlign: 'center',
    lineHeight: 16,
  },

  poseThumbnail: {
    width: 46,
    height: 46,
    opacity: 0.95,
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
    shadowOffset: {
      width: 0,
      height: 4,
    },
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