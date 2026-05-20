import { supabase } from './supabaseClient.js'

// Signup Function
export async function signUpUser(email, password, username) {
  // Step 1: Create the user in Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    console.error('Signup error:', error.message)
    alert(error.message)
    return
  }

  const user = data.user

  // Step 2: Store username in your table
  const { error: insertError } = await supabase.from('username').insert([
    {
      id: user.id,      // link to auth.users.id
      username: username,
    },
  ])

  if (insertError) {
    console.error('Error saving username:', insertError.message)
    alert('Error saving username')
  } else {
    console.log('User signed up successfully!')
    alert('Signup successful!')
  }
}

// Login Function
export async function loginUser(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('Login error:', error.message)
    alert(error.message)
  } else {
    console.log('Login successful:', data.user)
    alert('Welcome back!')
  }
}

// Logout Function
export async function logoutUser() {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('Logout error:', error.message)
  } else {
    console.log('Logged out successfully!')
    alert('Logged out')
  }
}