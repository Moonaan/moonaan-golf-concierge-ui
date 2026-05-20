import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { AgentConnection, AgentEvent } from '@golf-concierge/shared';

interface Props {
  connection: React.MutableRefObject<AgentConnection | null>;
}

interface OtpState {
  identifier: string;
  identifierType: 'phone' | 'email';
}

export default function OtpInput({ connection }: Props) {
  const [otpState, setOtpState] = useState<OtpState | null>(null);
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [verified, setVerified] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (!connection.current) return;

    const unsubOtp = connection.current.on('otpRequired', (event: AgentEvent) => {
      if (event.type === 'otpRequired') {
        setOtpState({ identifier: event.identifier, identifierType: event.identifierType });
        setDigits(['', '', '', '', '', '']);
        setVerified(false);
      }
    });

    const unsubVerified = connection.current.on('otpVerified', (event: AgentEvent) => {
      if (event.type === 'otpVerified') {
        setVerified(true);
        setTimeout(() => {
          setOtpState(null);
          setVerified(false);
        }, 1500);
      }
    });

    return () => {
      unsubOtp();
      unsubVerified();
    };
  }, [connection]);

  if (!otpState) return null;

  const handleDigitChange = (value: string, index: number) => {
    // Only accept digits
    const digit = value.replace(/[^0-9]/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);

    // Auto-advance
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits entered
    if (digit && index === 5) {
      const code = [...newDigits.slice(0, 5), digit].join('');
      if (code.length === 6) {
        handleSubmit(code);
      }
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (code?: string) => {
    const otp = code ?? digits.join('');
    if (otp.length !== 6) return;

    // Send OTP back to agent as a text message so the agent tool can verify it
    connection.current?.sendText(otp);
  };

  const formatIdentifier = () => {
    if (otpState.identifierType === 'phone') {
      // Mask middle digits: +1 (555) ***-1234
      return otpState.identifier.replace(/(\+?\d{1,3})\s?(\d{3})\s?(\d{3})(\d{4})/, '$1 ($2) ***-$4');
    }
    // Mask email: u***@example.com
    const [user, domain] = otpState.identifier.split('@');
    return `${user[0]}***@${domain}`;
  };

  if (verified) {
    return (
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.verifiedIcon}>✓</Text>
          <Text style={styles.title}>Verified!</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.overlay}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.sheet}>
        <Text style={styles.title}>Enter Verification Code</Text>
        <Text style={styles.subtitle}>
          We sent a 6-digit code to {formatIdentifier()}
        </Text>

        <View style={styles.digitRow}>
          {digits.map((digit: string, i: number) => (
            <TextInput
              key={i}
              ref={(ref: TextInput | null) => {
                inputRefs.current[i] = ref;
              }}
              style={[styles.digitBox, digit ? styles.digitBoxFilled : undefined]}
              value={digit}
              onChangeText={(val: string) => handleDigitChange(val, i)}
              onKeyPress={({ nativeEvent }: NativeSyntheticEvent<TextInputKeyPressEventData>) => handleKeyPress(nativeEvent.key, i)}
              keyboardType="number-pad"
              maxLength={1}
              textAlign="center"
              autoFocus={i === 0}
              selectTextOnFocus
            />
          ))}
        </View>

        <Pressable
          style={[
            styles.submitButton,
            digits.join('').length !== 6 && styles.disabledButton,
          ]}
          onPress={() => handleSubmit()}
          disabled={digits.join('').length !== 6}
        >
          <Text style={styles.submitText}>Verify</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#163B2E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
    alignItems: 'center',
    gap: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    color: '#A8C5B8',
    textAlign: 'center',
  },
  digitRow: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 8,
  },
  digitBox: {
    width: 44,
    height: 52,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#1E4F3D',
    backgroundColor: '#0F2E23',
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
  },
  digitBoxFilled: {
    borderColor: '#C4A35A',
  },
  submitButton: {
    backgroundColor: '#C4A35A',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 48,
    alignItems: 'center',
    marginTop: 4,
  },
  disabledButton: {
    opacity: 0.4,
  },
  submitText: {
    color: '#0F2E23',
    fontSize: 16,
    fontWeight: '700',
  },
  verifiedIcon: {
    fontSize: 48,
    color: '#4CAF50',
  },
});
