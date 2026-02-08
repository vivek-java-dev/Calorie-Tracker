import React, { useState } from 'react'
import { View, Text, Pressable, StyleSheet, TouchableOpacity } from 'react-native'
import DatePicker from 'react-native-date-picker'
import { Menu, ChevronDown, Share } from 'lucide-react-native'


type TopNavProps = {
  selectedDate: string
  onOpenDrawer: () => void
  onDateChange: (date: string) => void
  onShare: () => void
  onLogout: () => void; 

}

function toISO(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatDate(iso: string) {
  const date = new Date(iso)
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}


const TopNav: React.FC<TopNavProps> = ({
  selectedDate,
  onOpenDrawer,
  onDateChange,
  onShare,
  onLogout,
}) => {
  const [open, setOpen] = useState(false)

  return (
    <View style={styles.container}>
      {/* Left */}
      <Pressable onPress={onOpenDrawer} style={styles.iconBtn}>
        <Menu size={20} color="#000" />
      </Pressable>

      {/* Center */}
       <Pressable
        onPress={() => setOpen(true)}
        style={styles.center}
      >
        <Text style={styles.dateText}>
          {formatDate(selectedDate)}
        </Text>
        <ChevronDown size={16} color="#000" style={{ marginLeft: 6 }} />
      </Pressable>


      {/* Right */}
      {/* <Pressable onPress={onShare} style={styles.iconBtn}>
        <Share size={20} color="#000" />
      </Pressable> */}

      <TouchableOpacity onPress={onLogout}>
        <Text style={{ color: 'red', fontWeight: '600' }}>
          Logout
        </Text>
      </TouchableOpacity>

      <DatePicker
        modal
        open={open}
        date={new Date(selectedDate) || Date.now()}
        mode="date"
        onConfirm={(date) => {
          setOpen(false)
          onDateChange(toISO(date))
        }}
        onCancel={() => setOpen(false)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  iconBtn: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '500',
  },
})


export default TopNav
