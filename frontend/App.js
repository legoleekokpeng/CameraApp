import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ActivityIndicator, Dimensions, ScrollView, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';

// Add your ngrok URL here (do not include a trailing slash)
const API_BASE_URL = 'https://YOUR_NGROK_URL_HERE.ngrok-free.app';

const { width, height } = Dimensions.get('window');

const STYLE_OPTIONS = [
  { id: 'cinematic', title: '🎬 Cinematic', desc: 'Deep shadows, golden lighting.', emoji: '🍿' },
  { id: 'streetwear', title: '👟 Streetwear', desc: 'Low angle, high dynamic edge.', emoji: '🛹' },
  { id: 'minimalist', title: '🖼 Minimalist', desc: 'Soft pastel clean backdrops.', emoji: '🌿' },
  { id: 'vintage', title: '🎞 Retro 90s', desc: 'Grainy film, nostalgic warmth.', emoji: '📸' },
];

const REALTIME_SCAN_ALERTS = [
  "📱 Keep rotating horizontal and steady...",
  "⚠️ MOVE SLOWER — RekaAI needs depth mapping data",
  "⬅️ SHIFT MORE TO THE LEFT to capture background wall",
  "📱 KEEP HORIZONTAL — avoid tilting device down",
  "✨ Sufficient data captured! Processing..."
];

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  
  // State Machine
  const [phase, setPhase] = useState('style_selection');
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [directives, setDirectives] = useState(null);
  
  // Scanning States
  const [isRecording, setIsRecording] = useState(false);
  const [scanTimer, setScanTimer] = useState(0);
  const [alertIndex, setAlertIndex] = useState(0);
  
  // Coaching Milestone State
  const [coachingStep, setCoachingStep] = useState(0);

  const cameraRef = useRef(null);

  // --- API INTEGRATION: Upload Moodboard ---
  const handleMoodboardUpload = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhase('processing_moodboard');
      
      const localUri = result.assets[0].uri;
      const filename = localUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;

      const formData = new FormData();
      formData.append('image', { uri: localUri, name: filename, type });

      try {
        const response = await fetch(`${API_BASE_URL}/analyze-moodboard`, {
          method: 'POST',
          body: formData,
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        
        const data = await response.json();
        
        setSelectedStyle({ 
          title: data.name, 
          style_id: data.style_id,
          metrics: data.derived_metrics 
        });
        
        setScanTimer(0);
        setAlertIndex(0);
        setIsRecording(false);
        setPhase('scan_ready');
      } catch (error) {
        console.error('Moodboard upload failed:', error);
        Alert.alert('Error', 'Failed to connect to backend.');
        setPhase('style_selection');
      }
    }
  };

  // Active Environmental Recording Scanning Loop
  useEffect(() => {
    if (phase !== 'scan_ready' || !isRecording) return;

    // Running timestamp counter matching native iPhone UX
    const secondsTracker = setInterval(() => {
      setScanTimer(prev => prev + 1);
    }, 1000);

    // Sequence through the dynamic RekaAI context alerts every 2 seconds
    const alertTracker = setInterval(() => {
      setAlertIndex(prevIndex => {
        if (prevIndex < REALTIME_SCAN_ALERTS.length - 1) {
          return prevIndex + 1;
        } else {
          // AUTO CUT-OFF ENGINE: Clear intervals cleanly and let watcher shift state
          clearInterval(secondsTracker);
          clearInterval(alertTracker);
          return prevIndex;
        }
      });
    }, 2000);

    return () => {
      clearInterval(secondsTracker);
      clearInterval(alertTracker);
    };
  }, [phase, isRecording]);

  // Watch alertIndex to handle clean transition out of scanning
  useEffect(() => {
    if (isRecording && alertIndex === REALTIME_SCAN_ALERTS.length - 1) {
      const cutoffTimeout = setTimeout(() => {
        setIsRecording(false);
        setPhase('processing');
      }, 1500);
      return () => clearTimeout(cutoffTimeout);
    }
  }, [alertIndex, isRecording]);

  // --- API INTEGRATION: Fetch Directives ---
  useEffect(() => {
    if (phase !== 'processing') return;

    const processEnvironmentAndDirectives = async () => {
      try {
        // 1. Mock the environment scan (you will replace this with actual video later)
        const envFormData = new FormData();
        envFormData.append('video', { uri: 'dummy_path', name: 'dummy.mp4', type: 'video/mp4' });

        await fetch(`${API_BASE_URL}/analyze-environment`, {
          method: 'POST',
          body: envFormData,
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        // 2. Fetch the coaching directives based on the session
        const directivesResponse = await fetch(`${API_BASE_URL}/get-directives`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            style_id: selectedStyle?.style_id || 'default' 
          })
        });

        const directivesData = await directivesResponse.json();
        setDirectives(directivesData);
        setPhase('coaching');

      } catch (error) {
        console.error('Directives fetch failed:', error);
        Alert.alert('Error', 'Failed to retrieve coaching directives.');
        setPhase('style_selection');
      }
    };

    processEnvironmentAndDirectives();
  }, [phase, selectedStyle]);

  if (!permission) return <View style={styles.centerContainer}><ActivityIndicator size="large" /></View>;
  if (!permission.granted) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.text}>We need permission to demonstrate the camera workflow</Text>
        <TouchableOpacity style={styles.actionButton} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Access</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const formatVideoTime = (secs) => {
    return `00:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Helper to determine the alert box styling based on text context content safely
  const getAlertStyle = () => {
    const currentAlert = REALTIME_SCAN_ALERTS[alertIndex];
    if (currentAlert.includes("WARN") || currentAlert.includes("SLOWER")) {
      return [styles.realtimeAlertCard, { borderColor: '#FF3B30', backgroundColor: 'rgba(255, 59, 48, 0.9)' }];
    }
    if (currentAlert.includes("LEFT") || currentAlert.includes("SHIFT")) {
      return [styles.realtimeAlertCard, { borderColor: '#FF9500', backgroundColor: 'rgba(255, 149, 0, 0.9)' }];
    }
    return styles.realtimeAlertCard;
  };

  // --- PHASE 1: GRID STYLE SELECTION ---
  if (phase === 'style_selection') {
    return (
      <SafeAreaView style={styles.darkContainer}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.headerBlock}>
            <Text style={styles.brandTitle}>rekaAI Director</Text>
            <Text style={styles.brandSubtitle}>Select a layout style context or upload reference anchors</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.moodboardFullCard}
            onPress={handleMoodboardUpload}
          >
            <Text style={styles.moodboardTitleText}>🖼 Upload Reference Moodboard</Text>
            <Text style={styles.moodboardDescText}>Extract complex lighting geometries directly from custom graphics.</Text>
          </TouchableOpacity>

          <Text style={styles.sectionDividerText}>STYLING GRID TEMPLATES</Text>

          <View style={styles.styleGridWrapper}>
            {STYLE_OPTIONS.map((style) => (
              <TouchableOpacity 
                key={style.id} 
                style={styles.squareStyleBox} 
                onPress={() => {
                  setSelectedStyle(style);
                  setScanTimer(0);
                  setAlertIndex(0);
                  setIsRecording(false);
                  setPhase('scan_ready');
                }}
              >
                <View style={styles.squareImagePlaceholder}>
                  <Text style={styles.placeholderEmoji}>{style.emoji}</Text>
                  <View style={styles.imageOverlayWatermark}>
                    <Text style={styles.watermarkText}>REKAAI PREVIEW</Text>
                  </View>
                </View>
                
                <View style={styles.squareMetaBlock}>
                  <Text style={styles.squareBoxTitle}>{style.title}</Text>
                  <Text style={styles.squareBoxDesc} numberOfLines={2}>{style.desc}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // --- CORE CAMERA VIEWPORTS ---
  return (
    <View style={styles.container}>
      <CameraView style={StyleSheet.absoluteFillObject} ref={cameraRef}>
        
        {/* --- PHASE 2: INTEGRATED ENVIRONMENT VIEWPORT --- */}
        {phase === 'scan_ready' && (
          <SafeAreaView style={StyleSheet.absoluteFillObject}>
            <View style={styles.iphoneRecordingContainer}>
              
              {/* Top Row Banner */}
              <View style={styles.iphoneVideoTopHeader}>
                {isRecording ? (
                  <View style={styles.redTimerPill}>
                    <View style={styles.blinkingRedDot} />
                    <Text style={styles.timerDigitsText}>{formatVideoTime(scanTimer)}</Text>
                  </View>
                ) : (
                  <View style={styles.whiteStatusPill}>
                    <Text style={styles.statusPillText}>STANDBY</Text>
                  </View>
                )}
              </View>

              {/* Real-time Instructions Dashboard Area */}
              <View style={styles.floatingGuidanceSystemArea}>
                {isRecording ? (
                  <View style={getAlertStyle()}>
                    <Text style={styles.realtimeAlertText}>{REALTIME_SCAN_ALERTS[alertIndex]}</Text>
                  </View>
                ) : (
                  <View style={[styles.realtimeAlertCard, { backgroundColor: 'rgba(0,0,0,0.75)', borderColor: '#fff' }]}>
                    <Text style={styles.realtimeAlertText}>Press record below to begin mapping your environment layout.</Text>
                  </View>
                )}
              </View>

              {/* Bottom Tray Deck */}
              <View style={styles.iphoneCameraControlDeck}>
                <Text style={styles.iphoneModeTextTag}>ENVIRONMENTAL SCAN</Text>
                
                {isRecording ? (
                  <TouchableOpacity style={styles.iphoneOuterShutterBorder} onPress={() => { setIsRecording(false); setPhase('processing'); }}>
                    <View style={styles.iphoneInnerSquareStopIcon} />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={styles.iphoneOuterShutterBorder} onPress={() => setIsRecording(true)}>
                    <View style={styles.iphoneInnerRedCircleShutter} />
                  </TouchableOpacity>
                )}
                
                <Text style={styles.iphoneSubtextTag}>
                  {isRecording ? "Panning room landscape..." : "Ready to scan surrounds"}
                </Text>
              </View>

            </View>
          </SafeAreaView>
        )}

        {/* --- PHASE 2.5: COMPILING MOODBOARD SCREEN --- */}
        {phase === 'processing_moodboard' && (
          <View style={styles.fullscreenOverlayBlur}>
            <View style={styles.scanModal}>
              <ActivityIndicator size="large" color="#007AFF" style={{ marginBottom: 15 }} />
              <Text style={styles.instructionTitle}>Analysing Moodboard...</Text>
              <Text style={styles.instructionSub}>
                Extracting lighting geometries and depth maps via RekaAI.
              </Text>
            </View>
          </View>
        )}

        {/* --- PHASE 3: COMPILING LOADING SCREEN --- */}
        {phase === 'processing' && (
          <View style={styles.fullscreenOverlayBlur}>
            <View style={styles.scanModal}>
              <ActivityIndicator size="large" color="#007AFF" style={{ marginBottom: 15 }} />
              <Text style={styles.instructionTitle}>Processing Environment Frame...</Text>
              <Text style={styles.instructionSub}>
                RekaAI is calculating focal metrics, matching structural depths, and finalizing instructions.
              </Text>
            </View>
          </View>
        )}

        {/* --- PHASE 4: THE STEP-BY-STEP DYNAMIC COACHING VIEWFINDER --- */}
        {phase === 'coaching' && (
          <SafeAreaView style={StyleSheet.absoluteFillObject}>
            
            {coachingStep === 0 && (
              <View style={styles.fullscreenHardwareCues}>
                <Text style={styles.bigIndicatorArrow}>Aesthetic: {selectedStyle?.title}</Text>
                <Text style={styles.bigIndicatorArrow}>⬆    TILT UP 5°</Text>
                <Text style={styles.zoomLabelBadge}>Target Focus: 1.5x Zoom</Text>
              </View>
            )}

            {coachingStep === 1 && (
              <View style={styles.silhouetteContainer}>
                <View style={styles.mockHumanSilhouette}>
                  <View style={styles.silhouetteHead} />
                  <View style={styles.silhouetteTorso} />
                  <View style={styles.silhouetteArmsRow}>
                    <View style={styles.silhouetteArm} />
                    <View style={styles.silhouetteArm} />
                  </View>
                  <Text style={styles.silhouetteFrameLabel}>Align Model Silhouette Here</Text>
                </View>
              </View>
            )}

            {coachingStep === 2 && (
              <View style={[styles.visualGuideOutline, { top: '25%', left: '35%', width: '30%', height: '20%' }]}>
                <View style={styles.tagBadge}>
                  <Text style={styles.tagText}>Tracking Micro-Expressions via RekaAI</Text>
                </View>
              </View>
            )}

            {/* Dynamic Instructional Dashboard Footer Panel */}
            <View style={styles.coachingFooterPanel}>
              
              {coachingStep === 0 && (
                <View style={styles.directiveCard}>
                  <Text style={styles.directiveLabel}>STEP 1/3: {directives?.phase_control?.step?.toUpperCase() || 'CAMERAMAN PLACEMENT'}</Text>
                  <Text style={styles.directiveValue}>{directives?.phase_control?.coaching || 'Loading...'}</Text>
                </View>
              )}

              {coachingStep === 1 && (
                <View style={[styles.directiveCard, { backgroundColor: 'rgba(255, 149, 0, 0.15)', borderColor: '#FF9500' }]}>
                  <Text style={[styles.directiveLabel, { color: '#FF9500' }]}>STEP 2/3: {directives?.visual_cues?.step?.toUpperCase() || 'MODEL PLACEMENT'}</Text>
                  <Text style={styles.directiveValue}>{directives?.visual_cues?.coaching || 'Loading...'}</Text>
                </View>
              )}

              {coachingStep === 2 && (
                <View style={[styles.directiveCard, { backgroundColor: 'rgba(0, 255, 204, 0.15)', borderColor: '#00FFCC' }]}>
                  <Text style={[styles.directiveLabel, { color: '#00FFCC' }]}>STEP 3/3: {directives?.facial_guides?.step?.toUpperCase() || 'MICRO-EXPRESSIONS'}</Text>
                  <Text style={styles.directiveValue}>{directives?.facial_guides?.coaching || 'Loading...'}</Text>
                </View>
              )}

              {/* Navigation Control Buttons */}
              <View style={styles.controlRow}>
                {coachingStep < 2 ? (
                  <TouchableOpacity 
                    style={styles.nextStepBtn} 
                    onPress={() => setCoachingStep(coachingStep + 1)}
                  >
                    <Text style={styles.buttonText}>Next Step: Advance Directive ➡️</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity 
                    style={styles.shutterBtn} 
                    onPress={() => setPhase('preview')}
                  >
                    <View style={styles.innerShutterCircle} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </SafeAreaView>
        )}

        {/* --- PHASE 5: FOUR-CORNERS PREVIEW REVIEW OVERLAY PANEL --- */}
        {phase === 'preview' && (
          <SafeAreaView style={StyleSheet.absoluteFillObject}>
            <View style={styles.previewContainerLayout}>
              
              {/* TOP ACTIONS */}
              <View style={styles.previewTopRow}>
                <TouchableOpacity style={[styles.cornerActionBtn, { backgroundColor: '#FF3B30' }]} onPress={() => setPhase('coaching')}>
                  <Text style={styles.cornerBtnText}>🔄 Retake</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.cornerActionBtn, { backgroundColor: '#34C759' }]} onPress={() => setPhase('saved_menu')}>
                  <Text style={styles.cornerBtnText}>💾 Save Photo</Text>
                </TouchableOpacity>
              </View>

              {/* Photo Preview Center Mock Area */}
              <View style={styles.capturedPhotoPlaceholderBlock}>
                <Text style={styles.capturedPhotoWatermarkText}>📸 MOCK CAPTURED IMAGE VIEW</Text>
                <Text style={styles.capturedPhotoSubText}>Coaching metrics verified successfully via RekaAI</Text>
              </View>

              {/* BOTTOM ACTIONS */}
              <View style={styles.previewBottomRow}>
                <TouchableOpacity style={[styles.cornerActionBtn, { backgroundColor: '#007AFF' }]} onPress={() => { setCoachingStep(0); setPhase('style_selection'); }}>
                  <Text style={styles.cornerBtnText}>🎨 Change Style</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.cornerActionBtn, { backgroundColor: '#5856D6' }]} onPress={() => { setCoachingStep(0); setPhase('style_selection'); }}>
                  <Text style={styles.cornerBtnText}>🚪 Quit Session</Text>
                </TouchableOpacity>
              </View>

            </View>
          </SafeAreaView>
        )}

        {/* --- PHASE 6: POST-SAVE NAVIGATION ROUTING DASHBOARD --- */}
        {phase === 'saved_menu' && (
          <View style={styles.fullscreenOverlayBlur}>
            <View style={styles.scanModal}>
              <Text style={{ fontSize: 44, marginBottom: 10 }}>🎉</Text>
              <Text style={styles.instructionTitle}>Photo Saved Successfully!</Text>
              <Text style={styles.instructionSub}>What would you like to build or shoot next with your configuration?</Text>
              
              <View style={styles.postSaveMenuBlock}>
                <TouchableOpacity style={styles.menuRouteOptionRow} onPress={() => setPhase('coaching')}>
                  <Text style={styles.menuRouteText}>📸 Take Another Photo (Keep Setup)</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.menuRouteOptionRow} onPress={() => { setCoachingStep(0); setPhase('scan_ready'); }}>
                  <Text style={styles.menuRouteText}>📍 Change Place / Scan New Room</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.menuRouteOptionRow} onPress={() => { setCoachingStep(0); setPhase('style_selection'); }}>
                  <Text style={styles.menuRouteText}>🎨 Change Style / Moodboard Template</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  darkContainer: { flex: 1, backgroundColor: '#000', padding: 16 },
  text: { fontSize: 16, textAlign: 'center', marginBottom: 20, color: '#666' },
  
  headerBlock: { marginTop: 45, marginBottom: 15, paddingHorizontal: 4 },
  brandTitle: { fontSize: 26, fontWeight: 'bold', color: '#fff' },
  brandSubtitle: { fontSize: 13, color: '#8e8e93', marginTop: 4 },
  sectionDividerText: { color: '#48484a', fontSize: 11, fontWeight: 'bold', letterSpacing: 1.5, textAlign: 'center', marginVertical: 15 },
  
  moodboardFullCard: { backgroundColor: '#1c1c1e', padding: 18, borderRadius: 14, borderWidth: 1, borderColor: '#34c759', marginBottom: 10 },
  moodboardTitleText: { color: '#34c759', fontSize: 16, fontWeight: 'bold' },
  moodboardDescText: { color: '#aeaeb2', fontSize: 12, marginTop: 4, lineHeight: 16 },

  styleGridWrapper: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, paddingBottom: 30 },
  squareStyleBox: { width: (width - 44) / 2, backgroundColor: '#1c1c1e', borderRadius: 14, overflow: 'hidden', borderColor: '#2c2c2e', borderWidth: 1 },
  squareImagePlaceholder: { width: '100%', height: 115, backgroundColor: '#2c2c2e', justifyContent: 'center', alignItems: 'center' },
  placeholderEmoji: { fontSize: 38 },
  imageOverlayWatermark: { position: 'absolute', bottom: 6, left: 6, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4 },
  watermarkText: { color: 'rgba(255,255,255,0.4)', fontSize: 8, fontWeight: 'bold', letterSpacing: 0.5 },
  squareMetaBlock: { padding: 10 },
  squareBoxTitle: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  squareBoxDesc: { color: '#8e8e93', fontSize: 11, marginTop: 2, lineHeight: 14 },
  
  actionButton: { backgroundColor: '#007AFF', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: 'bold', textAlign: 'center' },
  
  fullscreenOverlayBlur: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 25 },
  scanModal: { backgroundColor: '#1c1c1e', borderRadius: 16, padding: 25, width: '100%', alignItems: 'center', borderColor: '#2c2c2e', borderWidth: 1 },
  instructionTitle: { fontSize: 19, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
  instructionSub: { fontSize: 13, color: '#aeaeb2', textAlign: 'center', marginTop: 8, lineHeight: 19 },
  
  iphoneRecordingContainer: { flex: 1, justifyContent: 'space-between' },
  iphoneVideoTopHeader: { width: '100%', alignItems: 'center', paddingTop: 10 },
  redTimerPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.8)', paddingVertical: 4, paddingHorizontal: 12, borderRadius: 15, gap: 6 },
  whiteStatusPill: { backgroundColor: 'rgba(255,255,255,0.2)', paddingVertical: 4, paddingHorizontal: 12, borderRadius: 15 },
  statusPillText: { color: '#fff', fontSize: 11, fontWeight: 'bold', letterSpacing: 1 },
  blinkingRedDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ff3b30' },
  timerDigitsText: { color: '#fff', fontSize: 14, fontWeight: '600', fontVariant: ['tabular-nums'] },
  
  floatingGuidanceSystemArea: { width: '100%', paddingHorizontal: 20, alignItems: 'center', marginTop: 20 },
  realtimeAlertCard: { width: '100%', backgroundColor: 'rgba(52, 199, 89, 0.9)', borderWidth: 1.5, borderColor: '#34C759', padding: 14, borderRadius: 12 },
  realtimeAlertText: { color: '#fff', fontWeight: 'bold', fontSize: 13, textAlign: 'center', lineHeight: 18 },
  
  iphoneCameraControlDeck: { width: '100%', backgroundColor: 'rgba(0,0,0,0.75)', paddingVertical: 25, alignItems: 'center', gap: 12 },
  iphoneModeTextTag: { color: '#ffcc00', fontSize: 11, fontWeight: 'bold', letterSpacing: 1 },
  iphoneSubtextTag: { color: '#8e8e93', fontSize: 12 },
  iphoneOuterShutterBorder: { width: 72, height: 72, borderRadius: 36, borderWidth: 4, borderColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  iphoneInnerSquareStopIcon: { width: 24, height: 24, backgroundColor: '#ff3b30', borderRadius: 4 },
  iphoneInnerRedCircleShutter: { width: 54, height: 54, backgroundColor: '#ff3b30', borderRadius: 27 },

  fullscreenHardwareCues: { position: 'absolute', top: 60, left: 0, right: 0, alignItems: 'center', gap: 10 },
  bigIndicatorArrow: { fontSize: 15, fontWeight: 'bold', color: '#00FFCC', backgroundColor: 'rgba(0,0,0,0.75)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  zoomLabelBadge: { color: '#fff', fontSize: 13, fontWeight: '600', backgroundColor: '#1c1c1e', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  
  silhouetteContainer: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  mockHumanSilhouette: { width: width * 0.52, height: height * 0.44, borderWidth: 2, borderColor: '#00FFCC', borderStyle: 'dashed', borderRadius: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 255, 204, 0.04)' },
  silhouetteHead: { width: 54, height: 54, borderRadius: 27, borderWidth: 2, borderColor: '#00FFCC', marginBottom: 10 },
  silhouetteTorso: { width: 85, height: 115, borderRadius: 20, borderWidth: 2, borderColor: '#00FFCC' },
  silhouetteArmsRow: { flexDirection: 'row', gap: 95, position: 'absolute', top: 85 },
  silhouetteArm: { width: 14, height: 95, borderWidth: 2, borderColor: '#00FFCC', borderRadius: 10 },
  silhouetteFrameLabel: { color: '#00FFCC', fontSize: 10, fontWeight: 'bold', marginTop: 15, backgroundColor: '#000', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },

  visualGuideOutline: { position: 'absolute', borderStyle: 'dashed', borderWidth: 2, borderColor: '#FF9500', borderRadius: 8 },
  tagBadge: { backgroundColor: '#FF9500', paddingVertical: 2, paddingHorizontal: 8, borderRadius: 4, marginTop: -20, marginLeft: 5 },
  tagText: { color: '#000', fontWeight: 'bold', fontSize: 9 },
  
  coachingFooterPanel: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: 'rgba(0,0,0,0.9)', borderTopLeftRadius: 20, borderTopRightRadius: 20, gap: 12 },
  directiveCard: { backgroundColor: 'rgba(0, 122, 255, 0.1)', borderWidth: 1, borderColor: '#007AFF', borderRadius: 8, padding: 14 },
  directiveLabel: { fontSize: 11, fontWeight: 'bold', color: '#007AFF', letterSpacing: 1, marginBottom: 4 },
  directiveValue: { fontSize: 13, color: '#fff', lineHeight: 19 },
  
  controlRow: { alignItems: 'center', marginVertical: 5 },
  nextStepBtn: { backgroundColor: '#007AFF', paddingVertical: 12, paddingHorizontal: 22, borderRadius: 25 },
  shutterBtn: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  innerShutterCircle: { width: 58, height: 58, borderRadius: 29, backgroundColor: '#fff', borderWidth: 2, borderColor: '#000' },
  
  previewContainerLayout: { flex: 1, justifyContent: 'space-between', padding: 20 },
  previewTopRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  previewBottomRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  cornerActionBtn: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 20, minWidth: 120, alignItems: 'center' },
  cornerBtnText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  capturedPhotoPlaceholderBlock: { alignSelf: 'center', alignItems: 'center', padding: 20, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', width: '90%' },
  capturedPhotoWatermarkText: { color: '#fff', fontWeight: 'bold', fontSize: 14, letterSpacing: 1 },
  capturedPhotoSubText: { color: '#aaa', fontSize: 11, marginTop: 4 },
  
  postSaveMenuBlock: { width: '100%', gap: 10, marginTop: 20 },
  menuRouteOptionRow: { backgroundColor: '#2C2C2E', padding: 15, borderRadius: 10, width: '100%', borderWidth: 1, borderColor: '#3A3A3C' },
  menuRouteText: { color: '#fff', fontSize: 14, fontWeight: '600', textAlign: 'center' }
});