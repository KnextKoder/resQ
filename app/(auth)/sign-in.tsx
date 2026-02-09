import { useSignIn } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'
import { Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native'
import React from 'react'

export default function Page() {
    const { signIn, setActive, isLoaded } = useSignIn()
    const router = useRouter()

    const [emailAddress, setEmailAddress] = React.useState('')
    const [password, setPassword] = React.useState('')
    const [error, setError] = React.useState<string | null>(null)
    const [isLoading, setIsLoading] = React.useState(false)

    const onSignInPress = async () => {
        if (!isLoaded) return
        setError(null)
        setIsLoading(true)

        try {
            const signInAttempt = await signIn.create({
                identifier: emailAddress,
                password,
            })

            if (signInAttempt.status === 'complete') {
                await setActive({ session: signInAttempt.createdSessionId })
                router.replace('/')
            } else {
                console.error(JSON.stringify(signInAttempt, null, 2))
                setIsLoading(false)
            }
        } catch (err: any) {
            const errorMessage = err.errors?.[0]?.longMessage || err.errors?.[0]?.message || 'An error occurred during sign in.'
            setError(errorMessage)
            console.error(JSON.stringify(err, null, 2))
            setIsLoading(false)
        }
    }

    return (
        <View className="flex-1 justify-center p-8 bg-white">
            <View className="mb-10 items-center">
                <Text className="text-4xl font-black text-slate-900 tracking-tighter italic">resQ</Text>
                <Text className="text-slate-500 font-medium">Sign in to your account</Text>
            </View>

            {error && (
                <View className="bg-red-50 border border-red-100 p-4 rounded-xl mb-6">
                    <Text className="text-red-600 text-sm font-semibold">{error}</Text>
                </View>
            )}

            <View className="gap-4">
                <TextInput
                    autoCapitalize="none"
                    value={emailAddress}
                    placeholder="Email address"
                    placeholderTextColor="#94a3b8"
                    className="bg-white border border-slate-200 rounded-2xl p-4 text-slate-900 font-medium shadow-sm"
                    onChangeText={(emailAddress) => setEmailAddress(emailAddress)}
                />
                <TextInput
                    value={password}
                    placeholder="Password"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry={true}
                    className="bg-white border border-slate-200 rounded-2xl p-4 text-slate-900 font-medium shadow-sm"
                    onChangeText={(password) => setPassword(password)}
                />

                <TouchableOpacity
                    onPress={onSignInPress}
                    disabled={isLoading}
                    className={`bg-slate-900 rounded-2xl p-5 items-center mt-2 shadow-lg shadow-slate-300 ${isLoading ? 'opacity-70' : ''}`}
                >
                    {isLoading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-bold text-lg">Sign In</Text>
                    )}
                </TouchableOpacity>
            </View>

            <View className="mt-8 flex-row justify-center items-center gap-2">
                <Text className="text-slate-500 font-medium">Don&apos;t have an account?</Text>
                <Link href="/sign-up">
                    <Text className="text-slate-900 font-bold decoration-slate-900 underline">Sign up</Text>
                </Link>
            </View>
        </View>
    )
}
