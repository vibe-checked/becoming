import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';
import { THEMES } from '../core/themes';
import { ThemeId } from '../core/types';

type Props = {
  visible: boolean;
  themeId: ThemeId;
  onClose: () => void;
};

export function CustomAffirmationsModal({ visible, themeId, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const customAffirmations = useAppStore((s) => s.customAffirmations);
  const addCustomAffirmation = useAppStore((s) => s.addCustomAffirmation);
  const removeCustomAffirmation = useAppStore((s) => s.removeCustomAffirmation);
  const editCustomAffirmation = useAppStore((s) => s.editCustomAffirmation);

  const [newText, setNewText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const theme = THEMES[themeId];
  const themeAffs = customAffirmations.filter((a) => a.themeId === themeId);

  const handleAdd = () => {
    const trimmed = newText.trim();
    if (!trimmed) return;
    addCustomAffirmation(themeId, trimmed);
    setNewText('');
  };

  const handleSaveEdit = () => {
    if (!editingId) return;
    const trimmed = editText.trim();
    if (!trimmed) {
      removeCustomAffirmation(editingId);
    } else {
      editCustomAffirmation(editingId, trimmed);
    }
    setEditingId(null);
    setEditText('');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {theme.emoji} {theme.label} Affirmations
            </Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Text style={styles.doneText}>Done</Text>
            </Pressable>
          </View>

          <View style={styles.addRow}>
            <TextInput
              style={styles.addInput}
              placeholder="Write your own affirmation..."
              placeholderTextColor="#555"
              value={newText}
              onChangeText={setNewText}
              maxLength={200}
              returnKeyType="done"
              onSubmitEditing={handleAdd}
              blurOnSubmit={false}
            />
            <Pressable
              onPress={handleAdd}
              style={[styles.addBtn, !newText.trim() && styles.addBtnDisabled]}
              disabled={!newText.trim()}
            >
              <Text style={styles.addBtnText}>Add</Text>
            </Pressable>
          </View>

          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {themeAffs.length === 0 ? (
              <Text style={styles.emptyText}>
                Your custom affirmations will appear here and be mixed with the library during sessions.
              </Text>
            ) : (
              themeAffs.map((aff) => (
                <View key={aff.id} style={styles.affRow}>
                  {editingId === aff.id ? (
                    <View style={styles.editRow}>
                      <TextInput
                        style={styles.editInput}
                        value={editText}
                        onChangeText={setEditText}
                        autoFocus
                        maxLength={200}
                        returnKeyType="done"
                        onSubmitEditing={handleSaveEdit}
                      />
                      <Pressable onPress={handleSaveEdit} style={styles.saveBtn}>
                        <Text style={styles.saveBtnText}>Save</Text>
                      </Pressable>
                    </View>
                  ) : (
                    <>
                      <Pressable
                        onPress={() => {
                          setEditingId(aff.id);
                          setEditText(aff.text);
                        }}
                        style={styles.affTextContainer}
                      >
                        <Text style={styles.affText}>{aff.text}</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => removeCustomAffirmation(aff.id)}
                        hitSlop={8}
                      >
                        <Text style={styles.deleteText}>✕</Text>
                      </Pressable>
                    </>
                  )}
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: '#14141f',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f0f0f5',
  },
  doneText: {
    fontSize: 16,
    color: '#b088e0',
    fontWeight: '600',
  },
  addRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  addInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#e0e0e8',
  },
  addBtn: {
    backgroundColor: '#b088e0',
    borderRadius: 12,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  addBtnDisabled: {
    opacity: 0.4,
  },
  addBtnText: {
    color: '#0a0a12',
    fontWeight: '700',
    fontSize: 14,
  },
  list: {
    flex: 1,
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 24,
    lineHeight: 22,
  },
  affRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    gap: 12,
  },
  affTextContainer: {
    flex: 1,
  },
  affText: {
    fontSize: 15,
    color: '#ccc',
    lineHeight: 22,
  },
  deleteText: {
    fontSize: 14,
    color: '#666',
  },
  editRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 10,
  },
  editInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#b088e0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#e0e0e8',
  },
  saveBtn: {
    backgroundColor: '#b088e0',
    borderRadius: 10,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#0a0a12',
    fontWeight: '700',
    fontSize: 13,
  },
});
