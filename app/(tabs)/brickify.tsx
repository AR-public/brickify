import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRef, useState } from 'react';
import {
  Animated,
  BackHandler,
  Dimensions,
  Linking,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

// Define a type for valid icon names
type MaterialIconName = 'phone' | 'message' | 'whatsapp' | 'map' | 'camera'; // Add other icon names you need

// Use this type in your app interface
interface App {
  name: string;
  url: string;
  icon: MaterialIconName;
}

// Then define your apps array with valid icons
const apps: App[] = [
  { name: 'Phone', url: 'tel:', icon: 'phone' },
  { name: 'Messages', url: 'sms:', icon: 'message' },
  // { name: 'WhatsApp', url: 'whatsapp://send', icon: 'whatsapp' },
  { name: 'Map', url: 'geo:0,0', icon: 'map' },
  { name: 'Camera', url: 'camera', icon: 'camera' }, // Changed url to 'camera'
];

export default function TabTwoScreen() {
  const [showModal, setShowModal] = useState(false);
  const pan = useRef(new Animated.ValueXY()).current;
  const screenWidth = Dimensions.get('window').width;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > screenWidth * 0.7) {
          // If brick is dragged more than 70% of screen width
          setShowModal(true);
        } else {
          // Reset position
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  const handleCloseApp = () => {
    if (Platform.OS === 'android') {
      BackHandler.exitApp();
    } else {
      // For iOS, we can only minimize the app
      // This will send it to background
      Linking.openURL('app-settings:');
    }
  };

  const handleKeepOpen = () => {
    setShowModal(false);
    Animated.spring(pan, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
    }).start();
  };

  const openApp = async (url: string) => {
    try {
      if (url === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status === 'granted') {
          await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 1,
          });
        }
      } else {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error('Failed to open app:', error);
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#974c0a' }}
      headerImage={
        <Animated.View
          style={[styles.headerContainer, pan.getLayout()]}
          {...panResponder.panHandlers}
        >
          <MaterialCommunityIcons
            name="toy-brick"
            size={200}
            color="red"
            style={styles.brickLogo}
          />
        </Animated.View>
      }
    >
      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleKeepOpen}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ThemedText style={styles.modalText}>
              Would you like to close the application?
            </ThemedText>
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={handleKeepOpen}
              >
                <ThemedText>No</ThemedText>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handleCloseApp}
              >
                <ThemedText>Yes</ThemedText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Apps</ThemedText>
      </ThemedView>
      <ThemedView style={styles.appList}>
        {apps.map((app) => (
          <Pressable
            key={app.name}
            style={styles.appItem}
            onPress={() => openApp(app.url)}
          >
            <MaterialCommunityIcons name={app.icon} size={24} color="gray" />
            <ThemedText>{app.name}</ThemedText>
          </Pressable>
        ))}
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  brickLogo: {
    height: 200,
    width: 250,
    alignSelf: 'flex-start',
    marginBottom: -42,
    marginLeft: -20,
  },
  appList: {
    padding: 16,
    gap: 16,
  },
  appItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    minWidth: 100,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#e0e0e0',
  },
  modalButtonConfirm: {
    backgroundColor: '#ff6b6b',
  },
  headerContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    width: '100%',
    height: '100%',
    paddingBottom: 20,
  },
});
