import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { AgentConnection, AgentEvent } from '@golf-concierge/shared';

interface Props {
  connection: React.MutableRefObject<AgentConnection | null>;
  onPaymentConfirmed: (paymentIntentId: string, bookingId: string) => void;
}

interface PaymentData {
  clientSecret: string;
  bookingId: string;
  amount: number;
  currency: string;
  courseName: string;
  date: string;
  teeTime: string;
}

/**
 * PaymentSheet listens for 'paymentRequired' events from the agent.
 * When triggered, it shows a payment UI and calls back on success.
 *
 * Note: Full Stripe PaymentSheet integration requires @stripe/stripe-react-native
 * and native build setup. This component provides the wiring scaffold —
 * swap the mock confirm button for StripeProvider + useStripe().presentPaymentSheet()
 * once native deps are configured.
 */
export default function PaymentSheet({ connection, onPaymentConfirmed }: Props) {
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!connection.current) return;

    const unsubscribe = connection.current.on('paymentRequired', (event: AgentEvent) => {
      if (event.type === 'paymentRequired') {
        setPaymentData({
          clientSecret: event.clientSecret,
          bookingId: event.bookingId,
          amount: event.amount,
          currency: event.currency,
          courseName: event.courseName,
          date: event.date,
          teeTime: event.teeTime,
        });
      }
    });

    return unsubscribe;
  }, [connection]);

  if (!paymentData) return null;

  const handleConfirm = async () => {
    setProcessing(true);
    try {
      // TODO: Replace with Stripe PaymentSheet when native deps are configured:
      // const stripe = useStripe();
      // const { error } = await stripe.initPaymentSheet({ paymentIntentClientSecret: paymentData.clientSecret });
      // const { error: presentError } = await stripe.presentPaymentSheet();
      // if (!presentError) { onPaymentConfirmed(extractIntentId(paymentData.clientSecret), paymentData.bookingId); }

      // Extract paymentIntentId from clientSecret (format: "pi_xxx_secret_xxx")
      const paymentIntentId = paymentData.clientSecret.split('_secret_')[0];
      onPaymentConfirmed(paymentIntentId, paymentData.bookingId);
      setPaymentData(null);
    } finally {
      setProcessing(false);
    }
  };

  const handleDismiss = () => {
    setPaymentData(null);
  };

  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: paymentData.currency.toUpperCase(),
  }).format(paymentData.amount / 100);

  return (
    <View style={styles.overlay}>
      <View style={styles.sheet}>
        <Text style={styles.title}>Complete Booking</Text>
        <Text style={styles.courseName}>{paymentData.courseName}</Text>
        <Text style={styles.details}>
          {paymentData.date} at {paymentData.teeTime}
        </Text>
        <Text style={styles.amount}>{formattedAmount}</Text>

        <Pressable
          style={[styles.confirmButton, processing && styles.disabledButton]}
          onPress={handleConfirm}
          disabled={processing}
        >
          {processing ? (
            <ActivityIndicator color="#0F2E23" />
          ) : (
            <Text style={styles.confirmText}>Confirm &amp; Pay</Text>
          )}
        </Pressable>

        <Pressable style={styles.cancelButton} onPress={handleDismiss} disabled={processing}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      </View>
    </View>
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
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  courseName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#A8C5B8',
    textAlign: 'center',
  },
  details: {
    fontSize: 14,
    color: '#6B9B87',
    textAlign: 'center',
  },
  amount: {
    fontSize: 36,
    fontWeight: '700',
    color: '#C4A35A',
    textAlign: 'center',
    marginVertical: 8,
  },
  confirmButton: {
    backgroundColor: '#C4A35A',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  confirmText: {
    color: '#0F2E23',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelButton: {
    alignItems: 'center',
    padding: 12,
  },
  cancelText: {
    color: '#6B9B87',
    fontSize: 15,
  },
});
