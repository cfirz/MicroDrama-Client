import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated } from 'react-native';
import type { StackScreenProps } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useFocusEffect } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { getShowEpisodes } from '../api/shows.api';
import type { EpisodeWithWatchStatus } from '../types/episode';
import { useShowStore } from '../stores/useShowStore';
import { useWatchHistoryStore } from '../stores/useWatchHistoryStore';
import { useTheme } from '../theme/useTheme';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useSessionStore } from '../stores/useSessionStore';

type Props = StackScreenProps<RootStackParamList, 'EpisodePlayer'>;

const EpisodePlayerScreen: React.FC<Props> = ({ route, navigation }) => {
	const { colors } = useTheme();
    const { setCurrentEpisode } = useShowStore();
    const markShowStarted = useSessionStore((s) => s.markShowStarted);
	const { markAsWatched } = useWatchHistoryStore();
	const { showId, episodeId } = route.params;

	const [currentIndex, setCurrentIndex] = useState<number>(0);
	const [preloadedIndex, setPreloadedIndex] = useState<number | null>(null);
	const [hasTriggeredPreload, setHasTriggeredPreload] = useState(false);
	const [playerError, setPlayerError] = useState<string | null>(null);
	const [isPlaying, setIsPlaying] = useState<boolean>(false);
	const [showControls, setShowControls] = useState<boolean>(false);
	// Track the current URI to avoid unnecessary replaces
	const currentUriRef = useRef<string | undefined>(undefined);
	// Timeout ref for auto-hiding controls
	const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	// Track if a replace operation is in progress to prevent race conditions
	const isReplacingRef = useRef<boolean>(false);
	// Track the latest URI that should be loaded (to cancel stale operations)
	const targetUriRef = useRef<string | null>(null);
	// Force re-check of URI after replace completes (triggers useEffect)
	const [replaceCheckTrigger, setReplaceCheckTrigger] = useState(0);

	const { data: episodesRaw = [], isLoading: episodesLoading } = useQuery({
		queryKey: ['episodes', showId, 'player'],
		queryFn: () => getShowEpisodes(showId, { sortBy: 'order', orderBy: 'asc' }),
	});

	// Merge client-side watch status with server data (client-side takes precedence for session)
	const watchedEpisodes = useWatchHistoryStore((s) => s.watchedEpisodes);
	const isWatched = useWatchHistoryStore((s) => s.isWatched);
	const episodes = useMemo(() => {
		return episodesRaw.map((ep) => ({
			...ep,
			watched: isWatched(ep.id) || ep.watched, // Client-side status OR server status
		}));
	}, [episodesRaw, watchedEpisodes]);

	// Animated value for swipe translation (declared early for use in effects)
	const translateY = useRef(new Animated.Value(0)).current;
	const gestureHandlerRef = useRef({ x: 0, y: 0 }).current;

    useEffect(() => {
		if (!episodes.length) return;
		const idx = episodes.findIndex((e) => e.id === episodeId);
		const newIndex = idx >= 0 ? idx : 0;
		setCurrentIndex(newIndex);
		// Reset URI ref when episode changes
		currentUriRef.current = undefined;
		// Reset animation when episode changes
		translateY.setValue(0);
		gestureHandlerRef.y = 0;
	}, [episodes, episodeId]);

	const current: EpisodeWithWatchStatus | null = useMemo(() => {
		if (!episodes.length) return null;
		const idx = Math.min(Math.max(currentIndex, 0), episodes.length - 1);
		const ep = episodes[idx];
		return (ep as EpisodeWithWatchStatus) ?? null;
	}, [episodes, currentIndex]);

	const next: EpisodeWithWatchStatus | null = useMemo(() => {
		if (!episodes.length) return null;
		if (currentIndex + 1 >= episodes.length) return null;
		const ep = episodes[currentIndex + 1];
		return (ep as EpisodeWithWatchStatus) ?? null;
	}, [episodes, currentIndex]);

	const prev: EpisodeWithWatchStatus | null = useMemo(() => {
		if (!episodes.length) return null;
		if (currentIndex <= 0) return null;
		const ep = episodes[currentIndex - 1];
		return (ep as EpisodeWithWatchStatus) ?? null;
	}, [episodes, currentIndex]);

	useEffect(() => {
		setCurrentEpisode(current ?? null);
		setHasTriggeredPreload(false);
		setPreloadedIndex(null);
        if (current) {
            // Track that this show's playback started during this session
            markShowStarted(current.showId);
        }
    }, [current, setCurrentEpisode, markShowStarted]);

	// Use signed playback URL from server if available, otherwise construct from playback ID
	const uri = current?.muxPlaybackUrl || (current?.muxPlaybackId 
		? `https://stream.mux.com/${current.muxPlaybackId}.m3u8` 
		: undefined);
	const nextUri = next?.muxPlaybackUrl || (next?.muxPlaybackId 
		? `https://stream.mux.com/${next.muxPlaybackId}.m3u8` 
		: undefined);
	const prevUri = prev?.muxPlaybackUrl || (prev?.muxPlaybackId 
		? `https://stream.mux.com/${prev.muxPlaybackId}.m3u8` 
		: undefined);

	// Create video player for current episode
	// Only include uri in config if we have a valid one to avoid initialization errors
	const playerConfig = uri ? { uri } : {};
	const player = useVideoPlayer(playerConfig, (p) => {
		p.loop = false;
		p.muted = false;
		p.timeUpdateEventInterval = 0.5; // Emit timeUpdate every 500ms for preloading logic
		// Don't auto-play here - we'll handle it in the useEffect after replace()
	});

	// Create video player for next episode (preload)
	const preloadPlayerConfig = nextUri ? { uri: nextUri } : {};
	const preloadPlayer = useVideoPlayer(preloadPlayerConfig, (p) => {
		p.muted = true;
		p.loop = false;
	});

	// Create video player for previous episode (for swipe down)
	const prevPlayerConfig = prevUri ? { uri: prevUri } : {};
	const prevPlayer = useVideoPlayer(prevPlayerConfig, (p) => {
		p.muted = true;
		p.loop = false;
	});

	// Create video player for next episode (for swipe up animation)
	const nextPlayerConfig = nextUri ? { uri: nextUri } : {};
	const nextPlayer = useVideoPlayer(nextPlayerConfig, (p) => {
		p.muted = true;
		p.loop = false;
	});

	// Additional animation state
	const swipeDirection = useRef<'up' | 'down' | null>(null);
	const isAnimating = useRef(false);

	// Debug logging
	useEffect(() => {
		if (current) {
			console.log('[EpisodePlayer] Current episode:', {
				id: current.id,
				title: current.title,
				muxPlaybackId: current.muxPlaybackId,
				uri,
			});
		}
	}, [current, uri]);

	// Track if we need to auto-play after source is ready
	const shouldAutoPlayRef = useRef(false);
	const pendingUriRef = useRef<string | null>(null);

	// Helper function to show controls and auto-hide after 1 second
	const showControlsWithAutoHide = useCallback(() => {
		// Clear any existing timeout
		if (controlsTimeoutRef.current) {
			clearTimeout(controlsTimeoutRef.current);
			controlsTimeoutRef.current = null;
		}

		// Show controls
		setShowControls(true);

		// Auto-hide after 1 second
		controlsTimeoutRef.current = setTimeout(() => {
			setShowControls(false);
			controlsTimeoutRef.current = null;
		}, 1000);
	}, []);

	// Listen to player status for debugging and auto-play when ready
	useEffect(() => {
		if (!player) return;

		const handleStatusChange = (payload: { status: string }) => {
			console.log('[EpisodePlayer] Player status:', payload.status);
			
			// Log error details when status is error
			if (payload.status === 'error') {
				const errorDetails = {
					payload: JSON.stringify(payload, null, 2),
					playerError: (player as any).error,
					currentUri: currentUriRef.current,
					duration: player.duration,
				};
				console.error('[EpisodePlayer] Player error - Full details:', errorDetails);
				setPlayerError(`Video playback error. URI: ${currentUriRef.current || 'none'}`);
			} else if (payload.status === 'readyToPlay') {
				// Clear error when player becomes ready
				setPlayerError(null);
			}
			
			// Auto-play when player becomes ready
			if (payload.status === 'readyToPlay' && shouldAutoPlayRef.current && pendingUriRef.current) {
				console.log('[EpisodePlayer] Player is ready, attempting to play...');
				shouldAutoPlayRef.current = false;
				pendingUriRef.current = null;
				
				try {
					// Optimistically set isPlaying to true before play() to ensure UI is correct
					setIsPlaying(true);
					player.play();
					console.log('[EpisodePlayer] Video play command sent successfully');
					// Don't show controls immediately - let playingChange event confirm play state first
					// Controls will be shown when user taps the video or when playingChange confirms
				} catch (err) {
					console.error('[EpisodePlayer] Failed to play:', err);
					// Revert isPlaying on error
					setIsPlaying(false);
				}
			}
		};

		const handlePlayingChange = (payload: { isPlaying: boolean }) => {
			console.log('[EpisodePlayer] Player isPlaying:', payload.isPlaying);
			setIsPlaying(payload.isPlaying);
			// When video starts playing, show controls for 1 second then auto-hide
			if (payload.isPlaying) {
				showControlsWithAutoHide();
			}
		};

		player.addListener('statusChange', handleStatusChange);
		player.addListener('playingChange', handlePlayingChange);

		return () => {
			player.removeListener('statusChange', handleStatusChange);
			player.removeListener('playingChange', handlePlayingChange);
		};
	}, [player, showControlsWithAutoHide]);

	// Update player source when episode changes and ensure it plays automatically
	useEffect(() => {
		if (!uri || !player || !current?.muxPlaybackId) {
			if (!uri) console.log('[EpisodePlayer] No URI yet, waiting...');
			return;
		}
		
		// Only replace if URI actually changed (skip if it's the same or if current is empty/placeholder)
		if (currentUriRef.current === uri) {
			console.log('[EpisodePlayer] URI unchanged, skipping replace');
			return;
		}

		// Update target URI ref to track what we're trying to load
		targetUriRef.current = uri;
		
		// If a replace is already in progress, just update the target and return
		// The replace completion will trigger a re-check via replaceCheckTrigger
		if (isReplacingRef.current) {
			console.log('[EpisodePlayer] Replace already in progress, updating target to:', uri);
			return;
		}

		console.log('[EpisodePlayer] Setting player source:', uri);
		
		const updateSource = async () => {
			// Mark that we're replacing
			isReplacingRef.current = true;
			
			// Use the latest target URI (might have changed)
			let targetUri = targetUriRef.current || uri;
			
			try {
				// Pause player first to ensure it's in a stable state
				try {
					if (player.status !== 'idle' && player.status !== 'error') {
						await player.pause();
					}
				} catch (pauseErr) {
					// Player might already be paused or released - continue anyway
					if (__DEV__) {
						console.debug('[EpisodePlayer] Failed to pause before replace (non-critical):', pauseErr);
					}
				}

				// Reset playing state when switching episodes
				setIsPlaying(false);

				// Get the latest target URI (might have changed during pause)
				targetUri = targetUriRef.current || uri;
				
				// Use replaceAsync instead of replace to avoid blocking the main thread
				shouldAutoPlayRef.current = true;
				pendingUriRef.current = targetUri;
				await player.replaceAsync({ uri: targetUri });
				
				// Check if target changed after replace
				const finalTarget = targetUriRef.current;
				if (finalTarget && finalTarget !== targetUri) {
					console.log('[EpisodePlayer] Target URI changed after replace, will process new target');
					currentUriRef.current = undefined; // Force re-process
					isReplacingRef.current = false;
					// Trigger re-check
					setReplaceCheckTrigger((prev) => prev + 1);
					return;
				}

				currentUriRef.current = targetUri;
				console.log('[EpisodePlayer] Player source replaced successfully with:', targetUri);
				
				// If player is already ready, play immediately
				if (player.status === 'readyToPlay') {
					console.log('[EpisodePlayer] Player already ready, attempting to play...');
					shouldAutoPlayRef.current = false;
					pendingUriRef.current = null;
					try {
						// Optimistically set isPlaying to true before play() to ensure UI is correct
						setIsPlaying(true);
						player.play();
						console.log('[EpisodePlayer] Video play command sent successfully');
					} catch (err) {
						console.error('[EpisodePlayer] Failed to play:', err);
						// Revert isPlaying on error
						setIsPlaying(false);
					}
				}

				// Check if there's a newer target queued after successful replace
				const queuedTarget = targetUriRef.current;
				if (queuedTarget && queuedTarget !== targetUri) {
					console.log('[EpisodePlayer] New target URI queued, will process next');
					currentUriRef.current = undefined; // Force re-process
					setReplaceCheckTrigger((prev) => prev + 1);
				}
			} catch (err) {
				console.error('[EpisodePlayer] Failed to replace source:', err);
				// Check if we should retry with a new target
				const latestTarget = targetUriRef.current;
				if (latestTarget && latestTarget !== targetUri) {
					console.log('[EpisodePlayer] Will retry with new target URI');
					currentUriRef.current = undefined; // Force re-process
					setReplaceCheckTrigger((prev) => prev + 1);
				} else {
					currentUriRef.current = undefined;
					shouldAutoPlayRef.current = false;
					pendingUriRef.current = null;
					setPlayerError('Failed to load video. Try swiping again.');
				}
			} finally {
				// Clear the flag - if there's a new target, the effect will run again
				isReplacingRef.current = false;
			}
		};
		
		updateSource();
	}, [uri, player, current?.muxPlaybackId, replaceCheckTrigger]);

	const goNext = useCallback(() => {
		if (currentIndex < episodes.length - 1) {
			setCurrentIndex((i) => i + 1);
		}
	}, [currentIndex, episodes.length]);

	const goPrev = useCallback(() => {
		if (currentIndex > 0) {
			setCurrentIndex((i) => i - 1);
		}
	}, [currentIndex]);


	// Track gesture translation in real-time
	const onGestureEvent = useCallback((event: any) => {
		const { translationY } = event.nativeEvent;
		gestureHandlerRef.y = translationY;
		translateY.setValue(translationY);
		// Determine swipe direction
		if (Math.abs(translationY) > 10) {
			swipeDirection.current = translationY < 0 ? 'up' : 'down';
		}
	}, [translateY]);

	const onHandlerStateChange = useCallback(
		(event: any) => {
			const { state, velocityY } = event.nativeEvent;
			const translationY = gestureHandlerRef.y;
			const screenHeight = Dimensions.get('window').height;
			const threshold = screenHeight * 0.25; // 25% of screen height
			const fast = Math.abs(velocityY) > 600;

			if (state === State.ACTIVE) {
				isAnimating.current = true;
			} else if (state === State.END) {
				// Determine if we should commit to the new episode
				const shouldCommit = Math.abs(translationY) > threshold || fast;
				const shouldGoNext = (translationY < -threshold || (fast && velocityY < 0)) && next;
				const shouldGoPrev = (translationY > threshold || (fast && velocityY > 0)) && prev;

				if (shouldCommit && (shouldGoNext || shouldGoPrev)) {
					// Animate to completion
					Animated.timing(translateY, {
						toValue: shouldGoNext ? -screenHeight : screenHeight,
						duration: 200,
						useNativeDriver: true,
					}).start(() => {
						// Commit to new episode
						if (shouldGoNext) {
							goNext();
						} else if (shouldGoPrev) {
							goPrev();
						}
						// Reset animation
						translateY.setValue(0);
						gestureHandlerRef.y = 0;
						swipeDirection.current = null;
						isAnimating.current = false;
					});
				} else {
					// Snap back to current episode
					Animated.spring(translateY, {
						toValue: 0,
						useNativeDriver: true,
						tension: 50,
						friction: 7,
					}).start(() => {
						gestureHandlerRef.y = 0;
						swipeDirection.current = null;
						isAnimating.current = false;
					});
				}
			} else if (state === State.CANCELLED || state === State.FAILED) {
				// Reset on cancellation
				Animated.spring(translateY, {
					toValue: 0,
					useNativeDriver: true,
					tension: 50,
					friction: 7,
				}).start(() => {
					gestureHandlerRef.y = 0;
					swipeDirection.current = null;
					isAnimating.current = false;
				});
			}
		},
		[goNext, goPrev, next, prev, translateY, gestureHandlerRef]
	);

	// Update preload player source when next episode changes
	useEffect(() => {
		if (!nextUri || !preloadPlayer) return;
		preloadPlayer.replaceAsync({ uri: nextUri }).catch((err) => {
			console.error('[EpisodePlayer] Failed to replace preload source:', err);
		});
	}, [nextUri, preloadPlayer]);

	// Update next player source for swipe animation
	useEffect(() => {
		if (!nextUri || !nextPlayer) return;
		nextPlayer.replaceAsync({ uri: nextUri }).catch((err) => {
			console.error('[EpisodePlayer] Failed to replace next player source:', err);
		});
	}, [nextUri, nextPlayer]);

	// Update prev player source for swipe animation
	useEffect(() => {
		if (!prevUri || !prevPlayer) return;
		prevPlayer.replaceAsync({ uri: prevUri }).catch((err) => {
			console.error('[EpisodePlayer] Failed to replace prev player source:', err);
		});
	}, [prevUri, prevPlayer]);

	// Listen to player events for preloading
	useEffect(() => {
		if (!player || !nextUri || !next || hasTriggeredPreload) return;

		const handleTimeUpdate = (payload: { currentTime: number }) => {
			const duration = player.duration;
			const position = payload.currentTime;
			if (duration > 0 && position / duration >= 0.8) {
				// Start preloading next video
				if (preloadPlayer) {
					preloadPlayer.play();
					setHasTriggeredPreload(true);
					setPreloadedIndex(currentIndex + 1);
				}
			}
		};

		player.addListener('timeUpdate', handleTimeUpdate);
		return () => {
			player.removeListener('timeUpdate', handleTimeUpdate);
		};
	}, [player, nextUri, next, hasTriggeredPreload, currentIndex, preloadPlayer]);

	// Listen to end event
	useEffect(() => {
		if (!player) return;

		const handlePlayToEnd = () => {
			if (current) {
				markAsWatched(current.id);
			}
			goNext();
		};

		player.addListener('playToEnd', handlePlayToEnd);
		return () => {
			player.removeListener('playToEnd', handlePlayToEnd);
		};
	}, [player, current, markAsWatched, goNext]);

	// Pause video when screen loses focus (navigating away or switching tabs)
	useFocusEffect(
		useCallback(() => {
			// Screen is focused - video can play
			return () => {
				// Screen is blurred - pause video
				// Note: Players may already be released when cleanup runs, so we handle errors gracefully
				if (player && isPlaying) {
					try {
						player.pause();
						setIsPlaying(false);
					} catch (err) {
						// Player may already be released - this is expected during cleanup
						// Only log if in development mode to avoid noise in production
						if (__DEV__) {
							console.debug('[EpisodePlayer] Player already released, skipping pause');
						}
					}
				}
				// Also pause preload player
				if (preloadPlayer) {
					try {
						preloadPlayer.pause();
					} catch (err) {
						// Preload player may already be released - this is expected during cleanup
						if (__DEV__) {
							console.debug('[EpisodePlayer] Preload player already released, skipping pause');
						}
					}
				}
			};
		}, [player, preloadPlayer, isPlaying])
	);

	// Toggle play/pause
	const togglePlayPause = useCallback(() => {
		if (!player) return;
		
		const wasPlaying = isPlaying;
		try {
			if (isPlaying) {
				setIsPlaying(false);
				player.pause();
			} else {
				setIsPlaying(true);
				player.play();
			}
			// After toggling, show controls and auto-hide after 1 second
			showControlsWithAutoHide();
		} catch (err) {
			console.error('[EpisodePlayer] Failed to toggle play/pause:', err);
			// Revert to previous state on error
			setIsPlaying(wasPlaying);
		}
	}, [player, isPlaying, showControlsWithAutoHide]);

	// Handle tap anywhere on screen to show controls
	const handleVideoTap = useCallback(() => {
		showControlsWithAutoHide();
	}, [showControlsWithAutoHide]);

	// Cleanup controls timeout
	useEffect(() => {
		return () => {
			if (controlsTimeoutRef.current) {
				clearTimeout(controlsTimeoutRef.current);
			}
		};
	}, []);

	// Show loading if episodes are still loading, or if we don't have episodes/episode data yet
	if (episodesLoading || !episodes.length || !current) {
		return (
			<View style={[styles.center, { backgroundColor: colors.background }]}>
				<Text style={{ color: colors.text }}>Loading…</Text>
			</View>
		);
	}

	// Show error if episode doesn't have a valid muxPlaybackId
	if (!current.muxPlaybackId) {
		return (
			<View style={[styles.center, { backgroundColor: colors.background }]}>
				<Text style={{ color: colors.text }}>Episode video not available</Text>
			</View>
		);
	}

	if (!uri || !player) {
		return (
			<View style={[styles.center, { backgroundColor: colors.background }]}>
				<Text style={{ color: colors.text }}>Initializing player…</Text>
			</View>
		);
	}

	if (!VideoView) {
		return (
			<View style={[styles.center, { backgroundColor: colors.background }]}>
				<Text style={{ color: colors.text }}>Video component not available</Text>
			</View>
		);
	}

	const screenHeight = Dimensions.get('window').height;

	// Calculate animated styles for videos
	const currentVideoStyle = {
		transform: [{ translateY: translateY }],
	};

	// Next video comes from below when swiping up
	const nextVideoTranslateY = translateY.interpolate({
		inputRange: [-screenHeight, 0],
		outputRange: [0, screenHeight],
		extrapolate: 'clamp',
	});
	const nextVideoStyle = {
		transform: [{ translateY: nextVideoTranslateY }],
	};

	// Previous video comes from above when swiping down
	const prevVideoTranslateY = translateY.interpolate({
		inputRange: [0, screenHeight],
		outputRange: [-screenHeight, 0],
		extrapolate: 'clamp',
	});
	const prevVideoStyle = {
		transform: [{ translateY: prevVideoTranslateY }],
	};

	return (
		<PanGestureHandler 
			onGestureEvent={onGestureEvent} 
			onHandlerStateChange={onHandlerStateChange}
			activeOffsetY={[-10, 10]}
			failOffsetX={[-50, 50]}
			minPointers={1}
			maxPointers={1}
		>
			<View style={[styles.container, { backgroundColor: colors.background }]}>
				{/* Previous video (shows when swiping down) */}
				{prev && prevPlayer && prevUri && (
					<Animated.View style={[styles.videoContainer, prevVideoStyle]}>
						<VideoView
							player={prevPlayer}
							style={styles.video}
							contentFit="cover"
							nativeControls={false}
						/>
						<View style={styles.overlay}>
							<Text style={styles.title} numberOfLines={1}>
								{prev.order}. {prev.title}
							</Text>
						</View>
					</Animated.View>
				)}
				
				{/* Current video */}
				<Animated.View style={[styles.videoContainer, currentVideoStyle]}>
					{player ? (
						<TouchableOpacity 
							activeOpacity={1} 
							onPress={handleVideoTap}
							style={styles.videoTouchable}
						>
							<VideoView
								player={player}
								style={styles.video}
								contentFit="cover"
								nativeControls={false}
							/>
						</TouchableOpacity>
					) : (
						<View style={[styles.video, styles.center, { backgroundColor: '#000' }]}>
							<Text style={{ color: '#fff' }}>Initializing player...</Text>
						</View>
					)}
					<View style={styles.overlay}> 
						<Text style={styles.title} numberOfLines={1}>
							{current.order}. {current.title}
						</Text>
						{playerError && (
							<View style={styles.errorContainer}>
								<Text style={styles.errorText}>{playerError}</Text>
								<Text style={styles.errorSubtext}>Check logs for details</Text>
							</View>
						)}
					</View>
					{/* Play/Pause Controls */}
					{showControls && (
						<View style={styles.controlsOverlay} pointerEvents="box-none">
							<TouchableOpacity
								style={styles.playPauseButton}
								onPress={togglePlayPause}
								activeOpacity={0.8}
							>
								<Text style={styles.playPauseIcon}>
									{isPlaying ? '⏸' : '▶'}
								</Text>
							</TouchableOpacity>
						</View>
					)}
				</Animated.View>

				{/* Next video (shows when swiping up) */}
				{next && nextPlayer && nextUri && (
					<Animated.View style={[styles.videoContainer, nextVideoStyle]}>
						<VideoView
							player={nextPlayer}
							style={styles.video}
							contentFit="cover"
							nativeControls={false}
						/>
						<View style={styles.overlay}>
							<Text style={styles.title} numberOfLines={1}>
								{next.order}. {next.title}
							</Text>
						</View>
					</Animated.View>
				)}
				
				{/* Hidden preloader (still used for background preloading) */}
				{preloadPlayer && nextUri ? (
					<VideoView
						player={preloadPlayer}
						style={styles.preload}
						contentFit="cover"
						nativeControls={false}
					/>
				) : null}
			</View>
		</PanGestureHandler>
	);
};

export default EpisodePlayerScreen;

const { height, width } = Dimensions.get('window');
const styles = StyleSheet.create({
	container: { flex: 1, overflow: 'hidden' },
	center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
	videoContainer: { 
		position: 'absolute',
		width, 
		height,
		top: 0,
		left: 0,
	},
	videoTouchable: {
		width,
		height,
	},
	video: { width, height },
	preload: { position: 'absolute', width: 1, height: 1, opacity: 0.01, left: -10, top: -10 },
	overlay: { position: 'absolute', top: 32, left: 16, right: 16 },
	title: { color: '#fff', fontSize: 16, fontWeight: '700', textShadowColor: 'rgba(0,0,0,0.6)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 },
	errorContainer: { marginTop: 16, padding: 12, backgroundColor: 'rgba(255, 0, 0, 0.8)', borderRadius: 8 },
	errorText: { color: '#fff', fontSize: 14, fontWeight: '600' },
	errorSubtext: { color: '#fff', fontSize: 12, marginTop: 4, opacity: 0.9 },
	controlsOverlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'rgba(0, 0, 0, 0.3)',
	},
	playPauseButton: {
		width: 80,
		height: 80,
		borderRadius: 40,
		backgroundColor: 'rgba(0, 0, 0, 0.6)',
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 3,
		borderColor: 'rgba(255, 255, 255, 0.8)',
	},
	playPauseIcon: {
		fontSize: 32,
		color: '#fff',
	},
});


