import React from 'react';
import { View, Text, StyleSheet, Platform, Button } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

import { useAppSelector } from '../../store/hooks';
import { selectConnectivity } from '../../store/slices/connectivitySlice';
import { useAppDispatch } from '../../store/hooks';
import { setOnline } from '../../store/slices/connectivitySlice';

export default function HomeScreen() {
  const dispatch = useAppDispatch();
  const connectivity = useAppSelector(selectConnectivity);

  React.useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      dispatch(setOnline(Boolean(state.isConnected)));
    });
    return unsubscribe;
  }, [dispatch]);

  return (
    <View style={styles.root}>
      <Text accessibilityRole="header" style={styles.title}>
        NexaSphere Mobile
      </Text>

      <Text accessibilityLabel="connectivity-status" style={styles.subtitle}>
        {connectivity.isOnline ? 'Online' : 'Offline'}
      </Text>

      <Text style={styles.body}>This is the initial Expo/React Navigation scaffold for #1806.</Text>

      <View style={styles.btnRow}>
        <Button
          title={Platform.OS === 'ios' ? 'iOS Action' : 'Android Action'}
          accessibilityLabel="platform-action"
          onPress={() => {
            // placeholder for future feature parity
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: 16,
    gap: 12,
    backgroundColor: '#0A0A0A',
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.9,
  },
  body: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.8,
  },
  btnRow: {
    marginTop: 10,
  },
});
