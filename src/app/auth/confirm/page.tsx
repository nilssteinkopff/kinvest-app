useEffect(() => {
  const handleAuthConfirm = async () => {
    const supabase = createClient()
    
    // Get all possible parameters
    const urlParams = new URLSearchParams(window.location.search)
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    
    addDebug(`Full URL: ${window.location.href}`)
    addDebug(`Search: ${window.location.search}`)
    addDebug(`Hash: ${window.location.hash}`)
    
    // Extract session tokens from hash (OAuth redirects)
    const access_token = hashParams.get('access_token')
    const refresh_token = hashParams.get('refresh_token')
    const token_type = hashParams.get('token_type')
    
    // Extract magic link tokens (URL parameters)
    const magic_token = urlParams.get('token')
    const magic_type = urlParams.get('type')
    
    // Extract other possible parameters
    const token_hash = urlParams.get('token_hash')
    const error_description = urlParams.get('error_description')
    const error = urlParams.get('error')
    
    addDebug(`Hash tokens: access=${!!access_token}, refresh=${!!refresh_token}, type=${token_type}`)
    addDebug(`Magic link: token=${!!magic_token}, type=${magic_type}`)
    addDebug(`URL params: token_hash=${!!token_hash}`)
    
    if (error || error_description) {
      addDebug(`❌ Error in URL: ${error} - ${error_description}`)
      router.push(`/login?error=${encodeURIComponent(error_description || error || 'Authentication failed')}`)
      return
    }

    // Handle OAuth tokens (hash parameters)
    if (access_token && refresh_token) {
      addDebug('✅ Found OAuth session tokens, setting session...')
      try {
        const { data, error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        })

        if (error) {
          addDebug(`❌ Session error: ${error.message}`)
          router.push(`/login?error=${encodeURIComponent(error.message)}`)
        } else {
          addDebug(`✅ Session set successfully for: ${data.user?.email}`)
          // Clear hash and redirect
          window.history.replaceState({}, document.title, window.location.pathname)
          router.push('/dashboard')
        }
      } catch (err) {
        addDebug(`❌ Unexpected error: ${err}`)
        router.push('/login?error=Session setup failed')
      }
    } 
    // Handle Magic Link tokens (URL parameters)
    else if (magic_token && magic_type === 'magiclink') {
      addDebug('✅ Found magic link token, verifying...')
      try {
        const { data, error } = await supabase.auth.verifyOtp({
          type: 'magiclink',
          token: magic_token,
        })

        if (error) {
          addDebug(`❌ Magic link error: ${error.message}`)
          router.push(`/login?error=${encodeURIComponent(error.message)}`)
        } else {
          addDebug(`✅ Magic link verification successful for: ${data.user?.email}`)
          router.push('/dashboard')
        }
      } catch (err) {
        addDebug(`❌ Unexpected error: ${err}`)
        router.push('/login?error=Magic link verification failed')
      }
    }
    // Handle other token types
    else if (token_hash && magic_type) {
      addDebug(`✅ Found token_hash and type, verifying OTP...`)
      try {
        const { data, error } = await supabase.auth.verifyOtp({
          type: magic_type as any,
          token_hash,
        })

        if (error) {
          addDebug(`❌ Verify OTP error: ${error.message}`)
          router.push(`/login?error=${encodeURIComponent(error.message)}`)
        } else {
          addDebug(`✅ OTP verification successful for: ${data.user?.email}`)
          router.push('/dashboard')
        }
      } catch (err) {
        addDebug(`❌ Unexpected error: ${err}`)
        router.push('/login?error=OTP verification failed')
      }
    } else {
      addDebug('❌ No valid authentication data found')
      addDebug('Available URL params: ' + Array.from(urlParams.entries()).map(([k,v]) => `${k}=${v}`).join(', '))
      addDebug('Available hash params: ' + Array.from(hashParams.entries()).map(([k,v]) => `${k}=${v}`).join(', '))
      router.push('/login?error=No authentication data found')
    }
    
    setIsLoading(false)
  }

  // Small delay to ensure all params are available
  const timer = setTimeout(handleAuthConfirm, 200)
  return () => clearTimeout(timer)
}, [router])