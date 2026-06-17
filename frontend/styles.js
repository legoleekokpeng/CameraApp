import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
export const CARD_WIDTH = (width - 52) / 2; 
export const SILHOUETTE_BOX_SIZE = 82; 

// --- RETRO DESIGN SYSTEM PALETTE ---
export const SUNLIGHT_ORANGE = '#FF9233';    
export const BUTTERMILK_CREAM = '#FFFDF6';   
export const TOASTED_ESPRESSO = '#1E1610';   
export const SOL_GOLD = '#D97D24';           
export const BURNT_SIENNA = '#A64B00';       

export const styles = StyleSheet.create({
  viewfinderContainer: { flex: 1, backgroundColor: TOASTED_ESPRESSO },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: SUNLIGHT_ORANGE },
  permissionText: { color: TOASTED_ESPRESSO, fontFamily: 'Georgia', fontSize: 13, textAlign: 'center', padding: 24, lineHeight: 20 },

  filmLightLeakOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'transparent', opacity: 0.15, borderRightWidth: width * 0.45, borderBottomWidth: height * 0.4, borderRightColor: '#FFF', borderBottomColor: SOL_GOLD, zIndex: 1 },
  foregroundContentLayer: { zIndex: 10 },
  texturedMainContainer: { flex: 1, backgroundColor: SUNLIGHT_ORANGE },
  hardwareSystemHeader: { marginTop: 24, marginBottom: 16, borderBottomWidth: 1.5, borderBottomColor: SOL_GOLD, paddingBottom: 14, alignItems: 'center' },
  steveSlantedLogo: { fontSize: 54, fontWeight: '900', color: TOASTED_ESPRESSO, fontStyle: 'italic', letterSpacing: -2.5, textTransform: 'lowercase' },
  hardwareSubscript: { fontSize: 10, fontWeight: '800', color: TOASTED_ESPRESSO, opacity: 0.8, marginTop: 4, letterSpacing: 0.8, fontFamily: 'monospace', textAlign: 'center' },

  texturedCalibrationBanner: { backgroundColor: BUTTERMILK_CREAM, padding: 14, borderRadius: 2, borderWidth: 1.5, borderColor: TOASTED_ESPRESSO, marginBottom: 20, position: 'relative', overflow: 'hidden' },
  woodAccentTrimmingEdge: { width: '100%', height: 3, backgroundColor: SOL_GOLD, position: 'absolute', top: 0, left: 0 },
  calibrationCardTitle: { color: BURNT_SIENNA, fontWeight: '900', fontSize: 15, fontFamily: 'Georgia' }, 
  calibrationCardDesc: { color: TOASTED_ESPRESSO, opacity: 0.6, fontSize: 11, lineHeight: 15, fontFamily: 'Courier', marginTop: 6, fontWeight: '600' },

  systemSectionDividerLabel: { color: TOASTED_ESPRESSO, fontSize: 11, fontWeight: '900', marginVertical: 12, letterSpacing: 1.2, textTransform: 'uppercase', textAlign: 'center', fontFamily: 'monospace' },
  twoColumnGridDeck: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between', paddingBottom: 30 },
  squareGridCard: { backgroundColor: BUTTERMILK_CREAM, width: CARD_WIDTH, borderRadius: 2, padding: 8, borderWidth: 1.5, borderColor: TOASTED_ESPRESSO, shadowColor: TOASTED_ESPRESSO, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  squareCardImagePlaceholder: { width: '100%', height: CARD_WIDTH - 16, position: 'relative', overflow: 'hidden', borderRadius: 1, backgroundColor: 'rgba(30,22,16,0.05)' },
  cardInternalVignette: { ...StyleSheet.absoluteFillObject, borderWidth: 6, borderColor: 'rgba(30, 22, 16, 0.08)', backgroundColor: 'transparent' },
  squareCardTextContainer: { paddingTop: 10, paddingHorizontal: 2 },
  squareCardTitle: { color: BURNT_SIENNA, fontWeight: '900', fontSize: 15, fontFamily: 'Georgia' }, 
  squareCardDesc: { color: TOASTED_ESPRESSO, opacity: 0.85, fontSize: 11, lineHeight: 15, fontFamily: 'Courier', marginTop: 5, fontWeight: '600' }, 

  hardwarePrimaryBtn: { backgroundColor: TOASTED_ESPRESSO, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 2, borderWidth: 1, borderColor: SOL_GOLD },
  btnText: { color: BUTTERMILK_CREAM, fontSize: 11, fontWeight: '800', fontFamily: 'monospace', letterSpacing: 0.5 },

  hudFlexMechanics: { flex: 1, justifyContent: 'space-between', alignItems: 'center', width: '100%', height: '100%' },
  lcdTelemetryStripHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: 'transparent', width: '100%' },
  lcdOverlayText: { color: BUTTERMILK_CREAM, fontSize: 13, fontWeight: '800', fontFamily: 'monospace', backgroundColor: 'rgba(30, 22, 16, 0.75)', paddingHorizontal: 10, paddingVertical: 4 },
  
  mechanicalCoachWrapper: { paddingHorizontal: 24, width: '100%', alignItems: 'center' },
  mechanicalCoachCard: { backgroundColor: 'rgba(255, 253, 246, 0.92)', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 4, borderWidth: 1.5, borderColor: TOASTED_ESPRESSO },
  mechanicalCoachBodyString: { color: TOASTED_ESPRESSO, fontSize: 13, fontWeight: '700', fontFamily: 'monospace', textAlign: 'center' },

  hardwareBottomDeckCasing: { backgroundColor: 'rgba(255, 253, 246, 0.95)', paddingVertical: 24, alignItems: 'center', position: 'relative', borderTopWidth: 1.5, borderColor: TOASTED_ESPRESSO, width: '100%' },
  woodAccentTrimmingEdgeTop: { width: '100%', height: 4, backgroundColor: SOL_GOLD, position: 'absolute', top: 0, left: 0 },
  deckHardwareInstructionSubText: { color: TOASTED_ESPRESSO, opacity: 0.8, fontSize: 11, marginTop: 12, fontWeight: '800', fontFamily: 'monospace', letterSpacing: 0.5 },
  
  circularMechanicalShutterOuter: { width: 80, height: 80, borderRadius: 40, borderWidth: 2.5, borderColor: SOL_GOLD, justifyContent: 'center', alignItems: 'center' },
  circularMechanicalShutterInner: { width: 62, height: 62, borderRadius: 31 },
  shutterCalmGreyBg: { backgroundColor: TOASTED_ESPRESSO },
  shutterPulseAmberBg: { backgroundColor: SUNLIGHT_ORANGE },

  processingScrimBackground: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255, 146, 51, 0.98)', justifyContent: 'center', alignItems: 'center', padding: 24, zIndex: 99 },
  mechanicalProcessingBox: { padding: 24, alignItems: 'center', borderWidth: 1.5, borderColor: TOASTED_ESPRESSO, backgroundColor: BUTTERMILK_CREAM },
  mechanicalProcessingTitle: { color: BURNT_SIENNA, fontSize: 14, fontWeight: '900', fontFamily: 'monospace', letterSpacing: 0.5 },
  mechanicalProcessingDesc: { color: TOASTED_ESPRESSO, fontSize: 12, textAlign: 'center', marginTop: 10, lineHeight: 18, fontWeight: '700', fontFamily: 'Courier' },

  cleanThemeHeaderContainer: { marginTop: 20, backgroundColor: 'rgba(30, 22, 16, 0.85)', paddingVertical: 8, paddingHorizontal: 18, borderRadius: 2, borderWidth: 1, borderColor: 'rgba(255,253,246,0.2)' },
  cleanThemeHeaderText: { color: BUTTERMILK_CREAM, fontSize: 13, fontWeight: '800', fontFamily: 'monospace', letterSpacing: 1 },

  transparentLiveFeedbackCard: { backgroundColor: 'rgba(30, 22, 16, 0.65)', paddingVertical: 14, paddingHorizontal: 20, borderRadius: 4, borderWidth: 1, borderColor: 'rgba(255,253,246,0.35)', maxWidth: width * 0.85 },
  liveFeedbackBodyString: { color: BUTTERMILK_CREAM, fontSize: 13, fontWeight: '700', fontFamily: 'monospace', textAlign: 'center', lineHeight: 18 },

  silhouetteOverlayContainer: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', zIndex: 5 },
  stylizedChassisTracingFrame: { width: width * 0.7, height: height * 0.45, borderWidth: 2, borderColor: SOL_GOLD, borderStyle: 'dashed', borderRadius: 8, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255, 146, 51, 0.05)' },
  silhouetteTraceTextLabel: { color: SOL_GOLD, fontSize: 10, fontWeight: '800', fontFamily: 'monospace', backgroundColor: 'rgba(30, 22, 16, 0.8)', paddingHorizontal: 8, paddingVertical: 4, position: 'absolute', top: -12 },
  silhouetteVectorGraphicCore: { width: '55%', height: '70%', borderRadius: 80, borderWidth: 2, borderColor: 'rgba(255, 146, 51, 0.6)', backgroundColor: 'transparent' },

  carouselContainerRow: { width: '100%', backgroundColor: 'rgba(30, 22, 16, 0.6)', paddingVertical: 12, borderTopWidth: 1, borderColor: 'rgba(255,253,246,0.15)' },
  carouselScrollContent: { paddingHorizontal: 16, alignItems: 'center', gap: 12 },
  squarishCarouselCard: { width: SILHOUETTE_BOX_SIZE, height: SILHOUETTE_BOX_SIZE, backgroundColor: 'rgba(30, 22, 16, 0.6)', borderRadius: 6, borderWidth: 1.5, borderColor: 'rgba(255,253,246,0.2)', justifyContent: 'space-between', alignItems: 'center', padding: 6 },
  squarishCarouselCardActive: { borderColor: SUNLIGHT_ORANGE, backgroundColor: 'rgba(30, 22, 16, 0.85)' },
  squarishCardVisualPreviewChassis: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' },
  carouselTextFallbackBadge: { fontSize: 22, textAlign: 'center' },
  squarishCardLabel: { color: 'rgba(255,253,246,0.65)', fontSize: 9, fontFamily: 'monospace', fontWeight: '700', textAlign: 'center', width: '100%' },
  squarishCardLabelActive: { color: SUNLIGHT_ORANGE, fontWeight: '900' },

  texturedNotebookDeck: { backgroundColor: BUTTERMILK_CREAM, paddingVertical: 18, borderTopWidth: 1.5, borderColor: TOASTED_ESPRESSO, width: '100%' },
  notebookFooterActionWrapper: { alignItems: 'center' },
  mechanicalTriggerButtonOuter: { width: 70, height: 70, borderRadius: 35, borderWidth: 2.5, borderColor: TOASTED_ESPRESSO, justifyContent: 'center', alignItems: 'center' },
  mechanicalTriggerButtonInner: { width: 54, height: 54, borderRadius: 27, backgroundColor: SUNLIGHT_ORANGE },

  previewWorkbenchWrapper: { flex: 1, backgroundColor: SUNLIGHT_ORANGE, padding: 16 },
  viewfinderLightLeakOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'transparent', opacity: 0.12, borderRightWidth: width * 0.45, borderBottomWidth: height * 0.4, borderRightColor: '#FFF', borderBottomColor: SOL_GOLD, zIndex: 1 },
  previewForegroundContainer: { flex: 1, justifyContent: 'space-between', zIndex: 10 },
  previewActionHeaderBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingVertical: 10 },
  vintageLabelFont: { color: TOASTED_ESPRESSO, fontSize: 15, fontWeight: '900', fontFamily: 'monospace', letterSpacing: 0.5 },
  
  lcdPreviewMatteChassis: { alignSelf: 'center', backgroundColor: BUTTERMILK_CREAM, width: '100%', flex: 0.84, padding: 14, borderWidth: 1.5, borderColor: TOASTED_ESPRESSO, shadowColor: TOASTED_ESPRESSO, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 },
  lcdPreviewScreenImageArea: { backgroundColor: '#EBE5D3', flex: 1, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(30,22,16,0.1)' },
  previewSimulationPlaceholderLabel: { color: BURNT_SIENNA, fontSize: 11, fontFamily: 'monospace', fontWeight: '800', marginTop: 10, letterSpacing: 0.5 },
  lcdPreviewBottomSubscriptSection: { height: 48, justifyContent: 'center', alignItems: 'center', paddingTop: 10 },
  lcdMetadataText: { color: TOASTED_ESPRESSO, fontSize: 13, fontFamily: 'monospace', fontWeight: '800', letterSpacing: 1.5 },
  
  dualSplitActionContainerFooter: { flexDirection: 'row', width: '100%', backgroundColor: BUTTERMILK_CREAM, borderWidth: 1.5, borderColor: TOASTED_ESPRESSO, borderRadius: 2 },
  splitBoxActionItemButton: { flex: 1, paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
  leftSplitBorder: { borderRightWidth: 1.5, borderRightColor: TOASTED_ESPRESSO },
  splitBoxButtonText: { color: TOASTED_ESPRESSO, fontSize: 13, fontWeight: '900', fontFamily: 'monospace', textTransform: 'uppercase' }
});