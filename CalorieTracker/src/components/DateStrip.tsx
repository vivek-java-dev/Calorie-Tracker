import React from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'

const DAY_COUNT = 7

type DateStripProps = {
  selectedDate: string           // yyyy-mm-dd
  onSelectDate: (date: string) => void
}

function startOfDay(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  )
}

function subtractDays(date: Date, days: number) {
  const d = new Date(date)
  d.setDate(d.getDate() - days)
  return d
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function toISO(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatDay(date: Date) {
  return date.toLocaleDateString('en-US', { weekday: 'short' })
}


const DateStrip: React.FC<DateStripProps> = ({
  selectedDate,
  onSelectDate,
}) => {
  const today = startOfDay(new Date())

  const dates = Array.from({ length: DAY_COUNT }, (_, i) =>
    subtractDays(today, DAY_COUNT -1 - i)
  )

  return (
    <View style={styles.container}>
      {dates.map(date => {
        const iso = toISO(date)
        const isSelected = iso === selectedDate
        const isToday = isSameDay(date, today)

        return (
          <Pressable
            key={iso}
            onPress={() =>{
                console.log('Pressed:', iso)
                onSelectDate(iso)}}
            style={[
              styles.box,
              isSelected && styles.selectedBox,
            ]}
          >
            <Text style={styles.day}>
              {formatDay(date)}
            </Text>
            <Text
              style={[
                styles.date,
                isToday && styles.todayText,
              ]}
            >
              {date.getDate()}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginVertical: 8,
    zIndex: 999,

  },
  box: {
    width: 44,
    height: 52,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  selectedBox: {
    backgroundColor: '#DCFCE7',
  },
  day: {
    fontSize: 12,
    color: '#6B7280',
  },
  date: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  todayText: {
    color: '#16A34A',
  },
})

export default DateStrip
