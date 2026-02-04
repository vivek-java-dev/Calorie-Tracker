import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";

// Skeleton Entry Card for loading state
export default function SkeletonEntryCard({ userText }: { userText: string }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const dotsAnim = useRef(new Animated.Value(0)).current;
  const [showTimeout, setShowTimeout] = useState(false);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.6,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    const dots = Animated.loop(
      Animated.timing(dotsAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    );

    // Show timeout message after 8 seconds
    const timeoutTimer = setTimeout(() => {
      setShowTimeout(true);
    }, 8000);

    pulse.start();
    dots.start();

    return () => {
      pulse.stop();
      dots.stop();
      clearTimeout(timeoutTimer);
    };
  }, [pulseAnim, dotsAnim]);

  return (
    <View style={[styles.card, styles.skeletonCard]}>
      {/* User Text */}
      <Text style={styles.userText}>{userText}</Text>
      
      {/* Analyzing Title */}
      <View style={styles.analyzingContainer}>
        <Text style={[styles.title, styles.analyzingText]}>
          {showTimeout ? "Still analyzing" : "Analyzing"}
        </Text>
        <Animated.Text 
          style={[
            styles.analyzingDots, 
            { 
              opacity: dotsAnim.interpolate({
                inputRange: [0, 0.33, 0.66, 1],
                outputRange: [0, 1, 0, 1]
              })
            }
          ]}
        >
          ...
        </Animated.Text>
      </View>
      <View style={styles.titleLine} />

      {/* Timeout message */}
      {showTimeout && (
        <Text style={styles.timeoutMessage}>
          This is taking longer than usual. Please check your connection.
        </Text>
      )}

      {/* Skeleton Macros */}
      <View style={styles.macrosRow}>
        <SkeletonMacro label="Calories" pulseAnim={pulseAnim} />
        <SkeletonMacro label="Carbs" pulseAnim={pulseAnim} />
        <SkeletonMacro label="Protein" pulseAnim={pulseAnim} />
        <SkeletonMacro label="Fat" pulseAnim={pulseAnim} />
      </View>

      {/* Bottom Row */}
      <View style={styles.bottomRow}>
        <Text style={styles.time}>
          {new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>

        <View style={styles.actionButtons}>
          <Animated.View style={[styles.actionButton, styles.skeletonButton, { opacity: pulseAnim }]} />
          <Animated.View style={[styles.actionButton, styles.skeletonButton, { opacity: pulseAnim }]} />
        </View>
      </View>
    </View>
  );
}

function SkeletonMacro({ label, pulseAnim }: { label: string; pulseAnim: Animated.Value }) {
  return (
    <View style={styles.macroBox}>
      <Text style={styles.macroLabel}>{label}</Text>
      <Animated.View style={[styles.skeletonMacroValue, { opacity: pulseAnim }]} />
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

  titleLine: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginBottom: 8,
  },

  macrosRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },

  macroBox: {
    alignItems: "center",
    flex: 1,
  },

  macroLabel: {
    fontSize: 12,
    color: "#777",
  },

  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    alignItems: "center",
  },

  time: {
    fontSize: 12,
    color: "#888",
  },

  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },

  actionButton: {
    padding: 4,
  },

  // Skeleton specific styles
  skeletonCard: {
    opacity: 0.8,
  },

  analyzingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  analyzingText: {
    color: "#4A90E2",
    fontStyle: "italic",
  },

  analyzingDots: {
    color: "#4A90E2",
    fontStyle: "italic",
    fontSize: 18,
    fontWeight: "500",
    marginLeft: 2,
  },

  skeletonMacroValue: {
    height: 20,
    width: 40,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    marginTop: 2,
  },

  skeletonButton: {
    width: 24,
    height: 24,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
  },

  timeoutMessage: {
    fontSize: 13,
    color: "#F59E0B",
    marginBottom: 12,
    fontStyle: "italic",
    textAlign: "center",
  },
});