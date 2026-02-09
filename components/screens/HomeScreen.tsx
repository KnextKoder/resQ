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
import * as Location from 'expo-location'
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
    const [location, setLocation] = React.useState<Location.LocationObject | null>(null)
    const locationPromiseRef = React.useRef<Promise<Location.LocationObject> | null>(null)

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

            // Request permissions and fetch initial location on mount
            const { status } = await Location.requestForegroundPermissionsAsync()
            if (status === 'granted') {
                try {
                    console.log('Fetching initial location...')
                    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High })
                    console.log('Initial location fetched:', loc.coords.latitude, loc.coords.longitude)
                    setLocation(loc)
                } catch (err) {
                    console.error('Failed to fetch initial location', err)
                }
            }
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

    const uploadFunc = async (uri: string, loc: Location.LocationObject | null = null) => {
        setIsSending(true)
        console.log('Uploading audio from:', uri)

        try {
            const formData = new FormData()
            formData.append('audio', {
                uri: uri,
                type: 'audio/m4a',
                name: 'emergency_audio.m4a',
            } as any)

            const locationToSend = loc || location
            if (locationToSend) {
                formData.append('latitude', locationToSend.coords.latitude.toString())
                formData.append('longitude', locationToSend.coords.longitude.toString())
                console.log('Attaching location:', locationToSend.coords.latitude, locationToSend.coords.longitude)
            }

            const serverUrl = process.env.EXPO_PUBLIC_SERVER_URL
            const vercelBypass = process.env.EXPO_PUBLIC_VERCEL_DEPLOYMENT_BYPASS_SECRET
            console.log('Server URL and Vercel Bypass:', serverUrl, vercelBypass)

            console.log("Sending request to server...")
            const baseUrl = serverUrl.replace(/\/$/, '')
            const targetUrl = `${baseUrl}/emergency`
            console.log("Sending request to:", targetUrl)

            const response = await fetch(targetUrl, {
                method: 'POST',
                body: formData,
                headers: {
                    'x-vercel-protection-bypass': vercelBypass || ''
                },
            })
            console.log("Response from server:", response)
            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}`)
            }

            const result = await response.json()
            console.log('Server response:', result)

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
            const [audioPermission, locationPermission] = await Promise.all([
                AudioModule.requestRecordingPermissionsAsync(),
                Location.requestForegroundPermissionsAsync()
            ])

            if (!audioPermission.granted) {
                Alert.alert('Permission denied', 'Allow microphone access to record.')
                return
            }

            if (!locationPermission.granted) {
                Alert.alert('Location required', 'Sending location is essential for emergency response.')
                // We proceed but with a warning, or you could return here
            }

            locationPromiseRef.current = Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High })

            locationPromiseRef.current
                .then(loc => {
                    console.log('Refreshed location fetched:', loc.coords.latitude, loc.coords.longitude)
                    setLocation(loc)
                })
                .catch(err => console.error('Failed to fetch location', err))

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
                let finalLocation = location
                if (!finalLocation && locationPromiseRef.current) {
                    try {
                        console.log('Waiting for location...')
                        finalLocation = await Promise.race([
                            locationPromiseRef.current,
                            new Promise<null>(resolve => setTimeout(() => resolve(null), 2000))
                        ])
                    } catch (e) {
                        console.log('Error awaiting location:', e)
                    }
                }

                if (finalLocation) {
                    setLocation(finalLocation)
                    await uploadFunc(uri, finalLocation)
                } else {
                    Alert.alert(
                        'Location Missing',
                        'Could not determine your location. Please ensure GPS is enabled and try again.',
                        [{ text: 'OK', onPress: () => setIsSending(false) }]
                    )
                }
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