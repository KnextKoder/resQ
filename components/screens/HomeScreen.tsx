import React, { useEffect } from 'react'
import { Text, View, Alert, TouchableOpacity } from 'react-native'
import { SignOutButton } from '@/components/SignOutButton'
import { useUser } from '@clerk/clerk-expo'
import {
    useAudioRecorder,
    AudioModule,
    RecordingPresets,
    setAudioModeAsync,
    useAudioRecorderState
} from 'expo-audio'
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    Easing,
    interpolateColor
} from 'react-native-reanimated'

export default function HomeScreen() {
    const { user } = useUser()
    const [isSending, setIsSending] = React.useState(false)

    const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY)
    const recorderState = useAudioRecorderState(audioRecorder)

    const ringScale = useSharedValue(1)
    const ringOpacity = useSharedValue(0)
    const colorProgress = useSharedValue(0)
    useEffect(() => {
        (async () => {
            await setAudioModeAsync({
                playsInSilentMode: true,
                allowsRecording: true,
            })
        })()
    }, [])

    useEffect(() => {
        if (recorderState.isRecording) {
            colorProgress.value = withTiming(1, { duration: 300 })
        } else if (isSending) {
            colorProgress.value = withTiming(2, { duration: 300 })
        } else {
            colorProgress.value = withTiming(0, { duration: 300 })
        }

        if (recorderState.isRecording || isSending) {
            ringScale.value = withRepeat(
                withSequence(
                    withTiming(1.2, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
                    withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                true
            )
            ringOpacity.value = withRepeat(
                withSequence(
                    withTiming(0.1, { duration: 1000 }),
                    withTiming(0.3, { duration: 1000 })
                ),
                -1,
                true
            )
        } else {
            ringScale.value = withTiming(1)
            ringOpacity.value = withTiming(0)
        }
    }, [recorderState.isRecording, isSending, ringOpacity, ringScale, colorProgress])

    const animatedRingStyle = useAnimatedStyle(() => ({
        transform: [{ scale: ringScale.value }],
        opacity: ringOpacity.value,
    }))

    const animatedButtonStyle = useAnimatedStyle(() => {
        const backgroundColor = interpolateColor(
            colorProgress.value,
            [0, 1, 2],
            ['#cbd5e1', '#000000', '#3b82f6']
        )
        return { backgroundColor }
    })

    const uploadAudio = async (uri: string) => {
        setIsSending(true)
        console.log('Uploading audio from:', uri)

        try {
            const formData = new FormData();
            formData.append('audio', {
                uri: uri,
                type: 'audio/m4a',
                name: 'emergency_audio.m4a',
            } as any);

            const serverUrl = process.env.EXPO_PUBLIC_SERVER_URL || 'http://localhost:3000';
            const vercelBypass = process.env.EXPO_PUBLIC_VERCEL_DEPLOYMENT_BYPASS_SECRET
            console.log('Server URL and Vercel Bypass:', serverUrl, vercelBypass);

            console.log("Sending request to server...")
            const baseUrl = serverUrl.replace(/\/$/, '');
            const targetUrl = `${baseUrl}/emergency`;
            console.log("Sending request to:", targetUrl);

            const response = await fetch(targetUrl, {
                method: 'POST',
                body: formData,
                headers: {
                    'x-vercel-protection-bypass': vercelBypass || ''
                },
            });
            console.log("Response from server:", response);
            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}`);
            }

            const result = await response.json();
            console.log('Server response:', result);

            Alert.alert('Dispatched', 'Emergency response services have been dispatched to your location.')
        } catch (err) {
            console.log('Upload failed:', err)
            Alert.alert('Error', 'Could not connect to the server. Signal not sent.')
        } finally {
            setIsSending(false)
        }
    }

    const startRecording = async () => {
        try {
            const permission = await AudioModule.requestRecordingPermissionsAsync()
            if (!permission.granted) {
                Alert.alert('Permission denied', 'Allow microphone access to record.')
                return
            }
            await audioRecorder.prepareToRecordAsync()
            audioRecorder.record()
        } catch (err) {
            console.error('Failed to start recording', err)
        }
    }

    const stopRecording = async () => {
        try {
            await audioRecorder.stop()
            const uri = audioRecorder.uri
            console.log('Audio saved locally at:', uri)
            if (uri) {
                await uploadAudio(uri)
            }
        } catch (err) {
            console.error('Failed to stop recording', err)
            setIsSending(false)
        }
    }

    const handlePress = () => {
        if (isSending) return
        if (recorderState.isRecording) { stopRecording() } else { startRecording() }
    }

    return (
        <View className="flex-1 bg-white">

            {/* Top Bar */}
            <View className="pt-16 px-8 flex-row justify-between items-center">
                <View className="flex-row items-center gap-3">
                    <View className="w-10 h-10 bg-slate-100 rounded-full items-center justify-center border border-slate-200">
                        <Text className="text-lg font-bold text-slate-600">
                            {user?.firstName?.[0] || user?.emailAddresses[0].emailAddress[0].toUpperCase()}
                        </Text>
                    </View>
                    <View>
                        <Text className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-3">System</Text>
                        <Text className={`text-xs font-bold ${recorderState.isRecording ? 'text-red-600' : isSending ? 'text-blue-600' : 'text-slate-800'}`}>
                            {recorderState.isRecording ? 'RECORDING...' : isSending ? 'DISPATCHING...' : 'STANDBY'}
                        </Text>
                    </View>
                </View>
                <SignOutButton />
            </View>

            <View className="flex-1 items-center justify-center">
            </View>

            <View className="items-center pb-20">
                <Animated.View
                    className="absolute w-44 h-44 rounded-full"
                    style={[{ backgroundColor: recorderState.isRecording ? '#262525' : isSending ? '#3b82f6' : '#a7adb5' }, animatedRingStyle]}
                />
                <TouchableOpacity
                    onPress={handlePress}
                    activeOpacity={isSending ? 1 : 0.8}
                    disabled={isSending}
                >
                    <Animated.View
                        style={animatedButtonStyle}
                        className="w-36 h-36 rounded-full items-center justify-center"
                    >
                        <Text className="text-white font-bold text-xs tracking-[4px] uppercase">
                            {recorderState.isRecording ? 'SEND' : isSending ? '...' : 'RECORD'}
                        </Text>
                    </Animated.View>
                </TouchableOpacity>
            </View>
        </View>
    )
}