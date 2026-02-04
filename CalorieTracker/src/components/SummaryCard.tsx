import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Flame, Salad } from 'lucide-react-native'

type CaloriesData = {
  netCalories: number
  intake: number
  burned: number
}

type MacrosData = {
  carbs: number
  proteins: number
  fats: number
}

type SummaryCardProps = {
  calories: CaloriesData
  macros: MacrosData
}

const SummaryCard: React.FC<SummaryCardProps> = ({ calories, macros }) => {
  return (
    <View style={styles.container}>
      {/* Calories Section */}
      <View style={styles.card}>
        <View style={styles.header}>
          <Flame size={16} color="#FF6B35" />
          <Text style={styles.headerText}>Calories</Text>
        </View>

        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.value}>{calories.intake}</Text>
            <Text style={styles.label}>Intake</Text>
          </View>

          <View style={styles.column}>
            <Text style={styles.value}>{calories.burned}</Text>
            <Text style={styles.label}>Burned</Text>
          </View>

          <View style={styles.column}>
            <Text style={[styles.value, styles.bold]}>{calories.netCalories}</Text>
            <Text style={styles.label}>Total</Text>
          </View>
        </View>
      </View>

      {/* Macros Section */}
      <View style={styles.card}>
        <View style={styles.header}>
          <Salad size={16} color="#22C55E" />
          <Text style={styles.headerText}>Macros</Text>
        </View>

        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.value}>{macros.carbs}</Text>
            <Text style={styles.label}>Carbs (g)</Text>
          </View>

          <View style={styles.column}>
            <Text style={styles.value}>{macros.proteins}</Text>
            <Text style={styles.label}>Protein (g)</Text>
          </View>

          <View style={styles.column}>
            <Text style={styles.value}>{macros.fats}</Text>
            <Text style={styles.label}>Fat (g)</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
  },
  card: {
    flex: 1,
    backgroundColor: '#EEF5FF',
    borderRadius: 14,
    padding: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    alignItems: 'center',
    flex: 1,
  },
  value: {
    fontSize: 18,
    fontWeight: '400',
  },
  bold: {
    fontWeight: '500',
  },
  label: {
    fontSize: 12,
    color: '#555',
    marginTop: 2,
    // textAlign:'left'
  },
})

export default SummaryCard