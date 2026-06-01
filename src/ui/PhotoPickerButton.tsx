import React from 'react';
import { Pressable, Text, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Directory, File, Paths } from 'expo-file-system';
import { useAppStore } from '../store/useAppStore';
import { ThemeId } from '../core/types';

type Props = {
  themeId: ThemeId;
};

export function PhotoPickerButton({ themeId }: Props) {
  const addUserPhoto = useAppStore((s) => s.addUserPhoto);

  const handlePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission needed',
        'Please allow photo access in Settings to add personal photos.',
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsMultipleSelection: true,
      selectionLimit: 10,
    });

    if (result.canceled || !result.assets?.length) return;

    const photosDir = new Directory(Paths.document, 'photos');
    if (!photosDir.exists) {
      photosDir.create();
    }

    for (const asset of result.assets) {
      const filename = `${themeId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.jpg`;
      const srcFile = new File(asset.uri);
      srcFile.copy(new File(photosDir, filename));
      const destUri = new File(photosDir, filename).uri;
      addUserPhoto(themeId, destUri);
    }
  };

  return (
    <Pressable onPress={handlePick} style={styles.btn}>
      <Text style={styles.btnText}>+ Add Photos</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    borderStyle: 'dashed',
    alignItems: 'center',
    marginTop: 12,
  },
  btnText: {
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
  },
});
