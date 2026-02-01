import * as React from 'react'
import { Text, TextInput, TouchableOpacity, View } from 'react-native'
import { useSignUp } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'

export default function SignUpScreen() {
    const { isLoaded, signUp, setActive } = useSignUp()
    const router = useRouter()

    const [emailAddress, setEmailAddress] = React.useState('')
    const [password, setPassword] = React.useState('')
    const [error, setError] = React.useState<string | null>(null)

    const onSignUpPress = async () => {
        if (!isLoaded) return
        setError(null)

        try {
            const signUpAttempt = await signUp.create({
                emailAddress,
                password,
            })

            if (signUpAttempt.status === 'complete') {
                await setActive({ session: signUpAttempt.createdSessionId })
                router.replace('/')
            } else {
                console.warn('Sign up status not complete:', signUpAttempt.status)
            }
        } catch (err: any) {
            const errorMessage = err.errors?.[0]?.longMessage || err.errors?.[0]?.message || 'An error occurred during sign up.'
            setError(errorMessage)
            console.error(JSON.stringify(err, null, 2))
        }
    }

    return (
        <View className="flex-1 justify-center p-8 bg-white">
            <Text className="text-3xl font-bold mb-8 text-center">Sign up</Text>

            {error && (
                <View className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6">
                    <Text className="text-red-600 text-sm font-medium">{error}</Text>
                </View>
            )}

            <TextInput
                autoCapitalize="none"
                value={emailAddress}
                placeholder="Enter email"
                className="border border-gray-300 rounded-lg p-4 mb-4 focus:border-blue-500"
                onChangeText={(email) => setEmailAddress(email)}
            />
            <TextInput
                value={password}
                placeholder="Enter password"
                secureTextEntry={true}
                className="border border-gray-300 rounded-lg p-4 mb-6 focus:border-blue-500"
                onChangeText={(password) => setPassword(password)}
            />
            <TouchableOpacity
                onPress={onSignUpPress}
                className="bg-blue-600 rounded-lg p-4 items-center mb-4 active:bg-blue-700 shadow-sm"
            >
                <Text className="text-white font-bold text-lg">Continue</Text>
            </TouchableOpacity>
            <View className="flex-row justify-center gap-2">
                <Text className="text-gray-600">Already have an account?</Text>
                <Link href="/sign-in">
                    <Text className="text-blue-600 font-bold">Sign in</Text>
                </Link>
            </View>
        </View>
    )
}
