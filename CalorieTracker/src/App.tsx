// import 'react-native-gesture-handler'
import { ScrollView, StatusBar, StyleSheet, useColorScheme } from 'react-native';
import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native-safe-area-context'
import InputBox from './components/InputBox';
import EntryCard from './components/entryCard';
import { SkeletonEntryCard, ErrorEntryCard } from './components/skeletons';
import SummaryCard from './components/SummaryCard';
import { useEffect, useState } from 'react';
import DateStrip from './components/DateStrip';
import TopNav from './components/TopNav';


function App() {
  const isDarkMode = useColorScheme() === 'dark';

  const today = new Date()
  const todayISO = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const [selectedDate, setSelectedDate] = useState(todayISO)
  const [dayData, setDayData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [analyzingEntry, setAnalyzingEntry] = useState<string | null>(null)
  const [entryError, setEntryError] = useState<{ userText: string; message: string; retryFn?: () => void } | null>(null)
  

  const shareDay = (selectedDate: string) => {
    // share logic here
  }

  const handleEntrySubmit = (userText: string) => {
    setEntryError(null) // Clear any previous errors
    setAnalyzingEntry(userText)
  }

  const handleEntryAdded = (date: string) => {
    setAnalyzingEntry(null)
    setEntryError(null)
    fetchDayData(date)
  }

  const handleEntryError = (userText: string, errorMessage: string, retryFn?: () => void) => {
    setAnalyzingEntry(null)
    setEntryError({ userText, message: errorMessage, retryFn })
  }

  const handleRetryEntry = () => {
    if (entryError?.retryFn) {
      setEntryError(null)
      entryError.retryFn()
    }
  }

  const handleDismissError = () => {
    setEntryError(null)
  }
  
  const fetchDayData = async (date: string) => {
    const apiUrl = `http://10.0.2.2:5000/api/entries?date=${date}`
    
    console.log('🔍 App - Fetching day data:')
    console.log('📅 Date:', date)
    console.log('🌐 API URL:', apiUrl)
    
    try {
      setLoading(true)
      const response = await fetch(apiUrl)
      
      console.log('📡 Response Status:', response.status, response.statusText)
      console.log('📡 Response Headers:', Object.fromEntries(response.headers.entries()))
      
      if (response.ok) {
        const responseData = await response.json()
        console.log('✅ Day data received:', JSON.stringify(responseData, null, 2))
        // Extract the actual data from the response wrapper
        setDayData(responseData.data)
      } else {
        const errorText = await response.text()
        console.error('❌ Failed to fetch day data:')
        console.error('Status:', response.status, response.statusText)
        console.error('Error Response:', errorText)
      }
    } catch (error) {
      console.error('💥 Network error fetching day data:', error)
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {fetchDayData(selectedDate)}, [selectedDate])
  
  
  console.log('selectedDate:', selectedDate)


  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />  
      <TopNav
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onOpenDrawer={() => {}}
        onShare={() => shareDay(selectedDate)}
      />

      <DateStrip
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        />
      <SummaryCard
        calories={dayData?.summary?.calories || 0}
        macros={dayData?.summary?.macros || {}}
        />

      <ScrollView style={{ padding: 16 }}>
      {/* Show skeleton card while analyzing */}
      {analyzingEntry && (
        <SkeletonEntryCard userText={analyzingEntry} />
      )}
      
      {/* Show error card if there's an error */}
      {entryError && (
        <ErrorEntryCard 
          userText={entryError.userText}
          errorMessage={entryError.message}
          onRetry={handleRetryEntry}
          onDismiss={handleDismissError}
        />
      )}
      
      {/* Show actual entries */}
      {dayData?.entries?.map((entry: any) => (
        <EntryCard key={entry._id} entry={entry} />
      )) || []}
    </ScrollView>
      <InputBox 
        selectedDate={selectedDate}
        onEntrySubmit={handleEntrySubmit}
        onEntryAdded={handleEntryAdded}
        onEntryError={handleEntryError}
      />
        </SafeAreaView>
    </SafeAreaProvider>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
