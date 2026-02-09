import { SignedIn, SignedOut } from '@clerk/clerk-expo'
import { Link } from 'expo-router'
import { Text, View, Image, TouchableOpacity } from 'react-native'
import HomeScreen from '@/components/screens/HomeScreen'

export default function Page() {
  return (
    <View className="flex-1 bg-white">
      <SignedIn>
        <HomeScreen />
      </SignedIn>
      <SignedOut>
        <View className="flex-1 items-center justify-between p-10 py-24">
          <View className="items-center mt-12">
            <View className="shadow-2xl shadow-slate-300">
              <Image
                source={require('../assets/icon.png')}
                style={{ width: 120, height: 120, borderRadius: 30 }}
                resizeMode="contain"
              />
            </View>
          </View>

          <View className="w-full gap-4">
            <Link href="/(auth)/sign-in" asChild>
              <TouchableOpacity className="bg-slate-900 p-5 rounded-2xl items-center shadow-lg shadow-slate-400">
                <Text className="text-white font-bold text-lg">Sign In</Text>
              </TouchableOpacity>
            </Link>

            <Link href="/(auth)/sign-up" asChild>
              <TouchableOpacity className="border-2 border-slate-200 p-5 rounded-2xl items-center">
                <Text className="text-slate-900 font-bold text-lg">Create Account</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </SignedOut>
    </View>
  )
}
