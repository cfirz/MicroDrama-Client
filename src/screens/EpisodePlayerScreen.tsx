import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import type { StackScreenProps } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useQuery } from '@tanstack/react-query';
import { getShowEpisodes } from '../api/shows.api';
import type { EpisodeWithWatchStatus } from '../types/episode';
import { useShowStore } from '../stores/useShowStore';
import { useWatchHistoryStore } from '../stores/useWatchHistoryStore';
import { useTheme } from '../theme/useTheme';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { Video } from 'expo-video';

type Props = StackScreenProps<RootStackParamList, 'EpisodePlayer'>;

const EpisodePlayerScreen: React.FC<Props> = ({ route, navigation }) => {
	const { colors } = useTheme();
	const { setCurrentEpisode } = useShowStore();
	const { markAsWatched } = useWatchHistoryStore();
	const { showId, episodeId } = route.params;

	const videoRef = useRef<Video>(null);
	const preloadRef = useRef<Video>(null);
	const [currentIndex, setCurrentIndex] = useState<number>(0);
	const [preloadedIndex, setPreloadedIndex] = useState<number | null>(null);
	const [hasTriggeredPreload, setHasTriggeredPreload] = useState(false);

	const { data: episodes = [] } = useQuery({
		queryKey: ['episodes', showId, 'player'],
		queryFn: () => getShowEpisodes(showId, { sortBy: 'order', orderBy: 'asc' }),
	});

	useEffect(() => {
		if (!episodes.length) return;
		const idx = episodes.findIndex((e) => e.id === episodeId);
		setCurrentIndex(idx >= 0 ? idx : 0);
	}, [episodes, episodeId]);

	const current: EpisodeWithWatchStatus | null = useMemo(() => {
		if (!episodes.length) return null;
		return episodes[Math.min(Math.max(currentIndex, 0), episodes.length - 1)] ?? null;
	}, [episodes, currentIndex]);

	const next: EpisodeWithWatchStatus | null = useMemo(() => {
		if (!episodes.length) return null;
		return currentIndex + 1 < episodes.length ? episodes[currentIndex + 1] : null;
	}, [episodes, currentIndex]);

	useEffect(() => {
		setCurrentEpisode(current ?? null);
		setHasTriggeredPreload(false);
		setPreloadedIndex(null);
	}, [current, setCurrentEpisode]);

	const uri = current ? `https://stream.mux.com/${current.muxPlaybackId}.m3u8` : undefined;
	const nextUri = next ? `https://stream.mux.com/${next.muxPlaybackId}.m3u8` : undefined;

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

	const onEnd = useCallback(() => {
		if (current) {
			markAsWatched(current.id);
		}
		goNext();
	}, [current, markAsWatched, goNext]);

	const onGestureEvent = useRef((event: any) => {}).current;

	const onHandlerStateChange = useCallback(
		(event: any) => {
			if (event.nativeEvent.state === State.END) {
				const { translationY, velocityY } = event.nativeEvent;
				const threshold = 50;
				const fast = Math.abs(velocityY) > 600;
				if (translationY < -threshold || (fast && velocityY < 0)) {
					goNext();
				} else if (translationY > threshold || (fast && velocityY > 0)) {
					goPrev();
				}
			}
		},
		[goNext, goPrev]
	);

	const onPlaybackStatusUpdate = useCallback(
		(status: any) => {
			if (!status.isLoaded) return;
			const duration = (status.durationMillis ?? status.duration ?? 0) as number;
			const position = (status.positionMillis ?? status.position ?? status.currentTime ?? 0) as number;
			if (!hasTriggeredPreload && duration > 0 && position / duration >= 0.8 && nextUri && next && preloadRef.current) {
				// Attempt to set source on hidden preloader to warm up next video
				// @ts-ignore - method compatibility between expo-av and expo-video
				preloadRef.current.setSource?.({ uri: nextUri }, {});
				setHasTriggeredPreload(true);
				setPreloadedIndex(currentIndex + 1);
			}
		},
		[hasTriggeredPreload, nextUri, next, currentIndex]
	);

	if (!current || !uri) {
		return (
			<View style={[styles.center, { backgroundColor: colors.background }]}>
				<Text style={{ color: colors.text }}>Loading…</Text>
			</View>
		);
	}

	return (
		<PanGestureHandler onGestureEvent={onGestureEvent} onHandlerStateChange={onHandlerStateChange}>
			<View style={[styles.container, { backgroundColor: colors.background }]}> 
				<Video
					ref={videoRef}
					source={{ uri }}
					style={styles.video}
					shouldPlay
					contentFit="cover"
					useNativeControls={false}
					isLooping={false}
					onPlaybackStatusUpdate={onPlaybackStatusUpdate}
					onError={() => {}}
					onEnd={onEnd}
				/>
				{/* Hidden preloader */}
				{nextUri ? (
					<Video
						ref={preloadRef}
						source={{ uri: nextUri }}
						style={styles.preload}
						shouldPlay={false}
						contentFit="cover"
						isMuted
					/>
				) : null}
				<View style={styles.overlay}> 
					<Text style={styles.title} numberOfLines={1}>
						{current.order}. {current.title}
					</Text>
				</View>
			</View>
		</PanGestureHandler>
	);
};

export default EpisodePlayerScreen;

const { height, width } = Dimensions.get('window');
const styles = StyleSheet.create({
	container: { flex: 1 },
	center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
	video: { width, height },
	preload: { position: 'absolute', width: 1, height: 1, opacity: 0.01, left: -10, top: -10 },
	overlay: { position: 'absolute', top: 32, left: 16, right: 16 },
	title: { color: '#fff', fontSize: 16, fontWeight: '700', textShadowColor: 'rgba(0,0,0,0.6)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 },
});


