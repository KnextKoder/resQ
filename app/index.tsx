import { SignedIn, SignedOut, useUser } from '@clerk/clerk-expo'
import { Link } from 'expo-router'
import { Text, View } from 'react-native'
import { SignOutButton } from '@/components/SignOutButton'

export default function Page() {
  const { user } = useUser()

  return (
    <View className="flex-1 items-center justify-center p-6 bg-white">
      <SignedIn>
        <Text className="text-xl font-bold mb-4">Hello {user?.emailAddresses[0].emailAddress}</Text>
        <SignOutButton />
      </SignedIn>
      <SignedOut>
        <View className="items-center gap-4">
          <Text className="text-2xl font-bold mb-4">Welcome</Text>
          <Link href="/(auth)/sign-in" className="bg-blue-500 text-white font-bold py-3 px-6 rounded-lg text-center overflow-hidden">
            <Text>Sign in</Text>
          </Link>
          <Link href="/(auth)/sign-up" className="bg-gray-800 text-white font-bold py-3 px-6 rounded-lg text-center overflow-hidden">
            <Text>Sign up</Text>
          </Link>
        </View>
      </SignedOut>
    </View>
  )
}
