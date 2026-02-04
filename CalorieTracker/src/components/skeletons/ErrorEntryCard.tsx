import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { AlertCircle, RefreshCw } from "lucide-react-native";

type ErrorEntryCardProps = {
  userText: string;
  errorMessage: string;
  onRetry: () => void;
  onDismiss: () => void;
};

export default function ErrorEntryCard({ 
  userText, 
  errorMessage, 
  onRetry, 
  onDismiss 
}: ErrorEntryCardProps) {
  return (
    <View style={[styles.card, styles.errorCard]}>
      {/* User Text */}
      <Text style={styles.userText}>{userText}</Text>
      
      {/* Error Title */}
      <View style={styles.errorHeader}>
        <AlertCircle size={20} color="#EF4444" />
        <Text style={[styles.title, styles.errorText]}>Analysis Failed</Text>
      </View>
      <View style={styles.titleLine} />

      {/* Error Message */}
      <Text style={styles.errorMessage}>{errorMessage}</Text>

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <RefreshCw size={16} color="#4A90E2" />
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
          <Text style={styles.dismissText}>Dismiss</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Row */}
      <View style={styles.bottomRow}>
        <Text style={styles.time}>
          {new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    borderColor: "black",
    marginVertical: 8,
    elevation: 1,
  },

  errorCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },

  userText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
    fontWeight: "400",
  },

  title: {
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 6,
  },

  errorHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  errorText: {
    color: "#EF4444",
  },

  titleLine: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginBottom: 8,
  },

  errorMessage: {
    fontSize: 14,
    color: "#7F1D1D",
    marginBottom: 16,
    lineHeight: 20,
  },

  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },

  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },

  retryText: {
    color: "#4A90E2",
    fontWeight: "500",
    fontSize: 14,
  },

  dismissButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },

  dismissText: {
    color: "#6B7280",
    fontWeight: "500",
    fontSize: 14,
  },

  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    alignItems: "center",
  },

  time: {
    fontSize: 12,
    color: "#888",
  },
});