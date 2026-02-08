import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Trash2, Edit3 } from "lucide-react-native";
import { API_ENDPOINTS } from '../config/api' 
import { apiRequest } from '../services/apiClient';

type Item = {
  name: string;
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
};

type Entry = {
  _id: string;
  userText: string;
  name: string;
  type: string;
  items?: Item[];
  proteins?: number;
  carbs?: number;
  fats?: number;
  calories: number;
  duration?: number;
  healthAnalysis?: string;
  createdAt: string;
};

type EntryCardProps = {
  entry: Entry;
  onDeleteSuccess?: () => void;
};


export default function EntryCard({
  entry,
  onDeleteSuccess,
}: EntryCardProps) {
  
  const isMeal = entry.type === "meal";
  const hasItems = entry.items && entry.items.length > 0;

  const handleDelete = async (_id : string ) => {
    const id = _id;
    console.log('Attempting to delete entry with ID:', id);
     try {
          const response = await apiRequest( `${API_ENDPOINTS.DELETE_ENTRY}?id=${id}`,'DELETE');
          onDeleteSuccess?.();
      }
      catch (error) {        
        console.error('Error deleting entry:', error);
      }
  }

  const time = new Date(entry.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <View style={styles.card}>
      {/* User Text */}
      <Text style={styles.userText}>{entry.userText}</Text>
      
      {/* Title */}
      <Text style={styles.title}>{entry.name}</Text>
      <View style={styles.titleLine} />

      {/* Meal Items List (optional) */}
      {isMeal && hasItems && (
        <View style={styles.itemsContainer}>
          {entry.items!.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <Text style={styles.itemName}>{item.name}</Text>
              <View style={styles.itemMacros}>
                <Text style={styles.itemMacroText}>{item.calories} kcal</Text>
                <Text style={styles.itemMacroText}>P {item.proteins}g</Text>
                <Text style={styles.itemMacroText}>C {item.carbs}g</Text>
                <Text style={styles.itemMacroText}>F {item.fats}g</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Macros or Exercise Info */}
      {isMeal ? (
        <View style={styles.macrosRow}>
          <Macro label="Calories" value={entry.calories} />
          <Macro label="Carbs" value={entry.carbs ?? 0} unit="g" />
          <Macro label="Protein" value={entry.proteins ?? 0} unit="g" />
          <Macro label="Fat" value={entry.fats ?? 0} unit="g" />
        </View>
      ) : (
        <View>
          <View style={styles.exerciseRow}>
            <Text style={styles.exerciseText}>Calories: {entry.calories}</Text>
            <Text style={styles.exerciseText}>Duration: {entry.duration} min</Text>
          </View>
          {entry.healthAnalysis && (
            <Text style={styles.healthAnalysis}>{entry.healthAnalysis}</Text>
          )}
        </View>
      )}

      {/* Bottom Row */}
      <View style={styles.bottomRow}>
        <Text style={styles.time}>{time}</Text>

        <View style={styles.actionButtons}>
          {/* <TouchableOpacity style={styles.actionButton}>
            <Edit3 size={16} color="#666" />
          </TouchableOpacity> */}
          
          <TouchableOpacity style={styles.actionButton} onPress={() => handleDelete(entry._id)}>
            <Trash2 size={16} color="red" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function Macro({
  label,
  value,
  unit = "",
}: {
  label: string;
  value: number;
  unit?: string;
}) {
  return (
    <View style={styles.macroBox}>
      <Text style={styles.macroLabel}>{label}</Text>
      <Text style={styles.macroValue}>
        {value}
        {unit}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    borderColor:"black",
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

  itemsContainer: {
    marginTop: 6,
    marginBottom: 10,
  },

  itemRow: {
    marginBottom: 6,
  },

  itemName: {
    fontSize: 14,
    fontWeight: "400",
    marginBottom: 4,
  },

  itemMacros: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },

  itemMacroText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 24,
    backgroundColor: "#F9FAFB",

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

  macroValue: {
    fontSize: 16,
    fontWeight: "500",
  },

  exerciseRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },

  exerciseText: {
    fontSize: 14,
    fontWeight: "400",
  },

  healthAnalysis: {
    fontSize: 13,
    color: "#555",
    marginTop: 8,
    lineHeight: 18,
    fontStyle: "italic",
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
});
