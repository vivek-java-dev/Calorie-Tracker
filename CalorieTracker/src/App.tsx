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
import { API_ENDPOINTS } from './config/api';
import './config/googleAuth';
import LoginScreen from './screens/LoginScreen';
import { getToken } from './services/authService';
import { logout } from './services/authService';
import { GoogleSignin } from '@react-native-google-signin/google-signin';



function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const today = new Date()
  const todayISO = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const [selectedDate, setSelectedDate] = useState(todayISO)
  const [dayData, setDayData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [analyzingEntry, setAnalyzingEntry] = useState<string | null>(null)
  const [entryError, setEntryError] = useState<{ userText: string; message: string; retryFn?: () => void } | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const token = await getToken();
      setIsAuthenticated(!!token);
      setCheckingAuth(false);
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await GoogleSignin.signOut();
    } catch (e) {
      console.warn('Google signOut failed (safe):', e);
    }

    await logout();
    setIsAuthenticated(false);
  };

  
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
    const apiUrl = `${API_ENDPOINTS.ENTRIES}?date=${date}`
    
    console.log('🔍 App - Fetching day data:')
    console.log('📅 Date:', date)
    console.log('🌐 API URL:', apiUrl)
    
    try {
      setLoading(true)
      const response = await fetch(apiUrl)
      console.log('📊 Response :', response)
            
      if (response.ok) {
        const responseData = await response.json()
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
  
  if (checkingAuth) {
    return null; // Or a loading spinner
  }

  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

 

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />  
      <TopNav
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onOpenDrawer={() => {}}
        onShare={() => shareDay(selectedDate)}
        onLogout={handleLogout}   

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
        <EntryCard key={entry._id} entry={entry} onDeleteSuccess={() => fetchDayData(selectedDate)}/>
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
    backgroundColor: '#ffffff', 

  },
});

export default App;
