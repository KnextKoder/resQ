import { useClerk } from '@clerk/clerk-expo'
import * as Linking from 'expo-linking'
import { Text, TouchableOpacity } from 'react-native'

export const SignOutButton = () => {
    const { signOut } = useClerk()
    const handleSignOut = async () => {
        try {
            await signOut()
            Linking.openURL(Linking.createURL('/'))
        } catch (err) {
            console.error(JSON.stringify(err, null, 2))
        }
    }
    return (
        <TouchableOpacity onPress={handleSignOut} className="bg-red-500 px-4 py-2 rounded-lg mt-4">
            <Text className="text-white font-bold">Sign out</Text>
        </TouchableOpacity>
    )
}
