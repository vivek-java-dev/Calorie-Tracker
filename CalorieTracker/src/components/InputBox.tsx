import React, { useEffect, useState } from 'react'
import { View, TextInput, StyleSheet, Pressable, Keyboard, LayoutAnimation, Platform } from 'react-native'
import { Formik } from 'formik'
import { Send, Bookmark, Image } from 'lucide-react-native'
import { API_ENDPOINTS } from '../config/api'
import { apiRequest } from '../services/apiClient'

type InputBoxProps = {
  selectedDate: string
  onEntrySubmit: (userText: string) => void
  onEntryAdded: (date: string) => void
  onEntryError: (userText: string, error: string, retryFn: () => void) => void
}

type FormValues = {
  text: string
}

const InputBox: React.FC<InputBoxProps> = ({
  selectedDate,
  onEntrySubmit,
  onEntryAdded,
  onEntryError,
}) => {

  const [keyboardHeight, setKeyboardHeight] = useState(0)

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', e => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
      const height = e.endCoordinates.height
      setKeyboardHeight(height + 6)
    })

    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
      setKeyboardHeight(0)
    })

    return () => {
      showSub.remove()
      hideSub.remove()
    }
  }, [])

  const handleSave = () => {
    console.log('Save functionality - to be implemented')
  }

  const handleImage = () => {
    console.log('Image functionality - to be implemented')
  }

  const initialValues: FormValues = { text: '' }

  const handleSubmit = async (values: FormValues, resetForm: () => void) => {
    if (!values.text.trim()) return

    onEntrySubmit(values.text)

    const requestData = {
      user_text: values.text,
      date: selectedDate,
    }

    try {
      await apiRequest(API_ENDPOINTS.ANALYZE_USER_TEXT, 'POST', requestData)
      resetForm()
      onEntryAdded(selectedDate)

    } catch (error: any) {
      let errorMessage = 'Network error. Please check your connection.'
      if (error.name === 'AbortError') {
        errorMessage = 'Request timed out. Please try again.'
      } else if (error.message.includes('Network request failed')) {
        errorMessage = 'Cannot connect to server. Please check if the server is running.'
      }

      onEntryError(values.text, errorMessage, () =>
        handleSubmit(values, resetForm)
      )
    }
  }

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={(values, { resetForm }) =>
        handleSubmit(values, resetForm)
      }
    >
      {({ values, handleChange, handleSubmit, isSubmitting }) => (
        <View
          style={[
            styles.container,
            { paddingBottom: keyboardHeight > 0 ? keyboardHeight : 10 }
          ]}
        >
          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.textInput,
                  isSubmitting && styles.disabledInput,
                ]}
                placeholder="What did you eat or exercise?"
                value={values.text}
                onChangeText={handleChange('text')}
                placeholderTextColor="#8294a7ff"
                editable={!isSubmitting}
              />
              <Pressable
                style={[
                  styles.sendButton,
                  isSubmitting && styles.disabledButton,
                ]}
                disabled={isSubmitting}
                onPress={() => handleSubmit()}
              >
                <Send size={18} color={isSubmitting ? '#AAA' : '#4A90E2'} />
              </Pressable>
            </View>

            <View style={styles.buttonGroup}>
              <Pressable
                style={styles.secondaryButton}
                onPress={handleSave}
                disabled={isSubmitting}
              >
                <Bookmark size={18} color="#444" />
              </Pressable>

              <Pressable
                style={styles.secondaryButton}
                onPress={handleImage}
              >
                <Image size={18} color="#444" />
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </Formik>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingTop: 8,
    marginHorizontal: 16,
    marginBottom: 2,
    borderRadius: 14,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#D1E7FF',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingLeft: 10,
    paddingRight: 8,
    height: 46,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '400',
    paddingVertical: 8,
  },
  sendButton: {
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  secondaryButton: {
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledInput: {
    opacity: 0.6,
  },
  disabledButton: {
    opacity: 0.5,
  },
})

export default InputBox
