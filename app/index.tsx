import { SignedIn, SignedOut } from '@clerk/clerk-expo'
import { Link } from 'expo-router'
import { Text, View } from 'react-native'
import HomeScreen from '@/components/screens/HomeScreen'

export default function Page() {
  return (
    <View className="flex-1 bg-white">
      <SignedIn>
        <HomeScreen />
      </SignedIn>
      <SignedOut>
        <View className="flex-1 items-center justify-center p-6">
          <View className="items-center gap-4">
            <Text className="text-2xl font-bold mb-4">Welcome</Text>
            <Link href="/(auth)/sign-in" className="bg-blue-500 text-white font-bold py-3 px-6 rounded-lg text-center overflow-hidden w-64">
              <Text>Sign in</Text>
            </Link>
            <Link href="/(auth)/sign-up" className="bg-gray-800 text-white font-bold py-3 px-6 rounded-lg text-center overflow-hidden w-64">
              <Text>Sign up</Text>
            </Link>
          </View>
        </View>
      </SignedOut>
    </View>
  )
}
