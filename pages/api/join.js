import { supabase } from '@/lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { fullName, email, password, type, phone, company } = req.body

  if (!fullName || !email || !password || !type) {
    return res.status(400).json({ message: 'Missing required fields' })
  }

  const { data, error } = await supabase
    .from('users')
    .insert([{ 
      full_name: fullName, 
      email, 
      password, 
      type, 
      phone, 
      company 
    }])

  if (error) return res.status(500).json({ error: error.message })

  res.status(200).json({ message: 'User registered successfully', data })
}
