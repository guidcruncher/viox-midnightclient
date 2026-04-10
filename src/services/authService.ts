import { getBaseUrl } from '../utils/baseUrl'

class AuthService {
  isLoggedIn(): boolean {
    return Boolean(localStorage.getItem('access_token'))
  }

  logout() {
    localStorage.removeItem('access_token')
  }

  getLoginUrl(): string {
    const apiUrl = getBaseUrl()
    //    const redirectUri = encodeURIComponent(`${window.location.origin}/auth/callback`)
    return `${apiUrl}/api/spotify/login`
  }

  async handleCallback(): Promise<void> {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')

    if (token) {
      localStorage.setItem('access_token', token)
    }
  }
}

export default new AuthService()
