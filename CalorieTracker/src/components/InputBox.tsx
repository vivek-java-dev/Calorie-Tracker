import React from 'react'
import { View, TextInput, StyleSheet, Pressable } from 'react-native'
import { Formik } from 'formik'
import { Send, Bookmark, Image } from 'lucide-react-native'

type InputBoxProps = {
  selectedDate: string
  onEntryAdded: (date: string) => void
}

type FormValues = {
  text: string
}

const InputBox: React.FC<InputBoxProps> = ({
  selectedDate,
  onEntryAdded,
}) => {
  const handleSave = () => {
    console.log('Save functionality - to be implemented')
  }

  const handleImage = () => {
    console.log('Image functionality - to be implemented')
  }

  const initialValues: FormValues = { text: '' }

  const handleSubmit = async (values: FormValues, resetForm: () => void) => {
    if (!values.text.trim()) return

    const requestData = {
      user_text: values.text,
      date: selectedDate,
    }

    console.log('🚀 InputBox - Submitting text analysis request:')
    console.log('📅 Selected Date:', selectedDate)
    console.log('📝 User Text:', values.text)
    console.log('📦 Request Body:', JSON.stringify(requestData, null, 2))

    try {
      const response = await fetch('http://10.0.2.2:5000/api/analyze-user-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      console.log('📡 Response Status:', response.status, response.statusText)
      console.log('📡 Response Headers:', Object.fromEntries(response.headers.entries()))

      if (response.ok) {
        const result = await response.json()
        console.log('✅ Analysis result:', JSON.stringify(result, null, 2))
        resetForm()
        onEntryAdded(selectedDate)
      } else {
        const errorText = await response.text()
        console.error('❌ Failed to analyze text:')
        console.error('Status:', response.status, response.statusText)
        console.error('Error Response:', errorText)
      }
    } catch (error) {
      console.error('💥 Network error submitting text:', error)
    }
  }

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={(values, { resetForm }) =>
        handleSubmit(values, resetForm)
      }
    >
      {({ values, handleChange, handleSubmit }) => (
        <View style={styles.container}>
          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="What did you eat or exercise?"
                value={values.text}
                onChangeText={handleChange('text')}
                placeholderTextColor="#8294a7ff"
              />
              <Pressable 
                style={styles.sendButton}
                onPress={() => handleSubmit()}
              >
                <Send size={18} color="#4A90E2" />
              </Pressable>
            </View>

            <View style={styles.buttonGroup}>
              <Pressable 
                style={styles.secondaryButton}
                onPress={handleSave}
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
    // backgroundColor: '#EEF5FF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginBottom: 2,
    borderRadius: 14,
    // shadowColor: '#4A90E2',
    // shadowOffset: {
    //   width: 0,
    //   height: 2,
    // },
    // shadowOpacity: 0.08,
    // shadowRadius: 4,
    // elevation: 3,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#D1E7FF',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingLeft: 16,
    paddingRight: 8,
    height: 52,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '400',
    paddingVertical: 12,
  },
  sendButton: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  secondaryButton: {
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
})

export default InputBox
