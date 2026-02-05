const API_URL = 'https://YOUR_BACKEND_URL'; // e.g. http://192.168.1.5:3000

type GoogleAuthResponse = {
  token: string;
  user: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
};

export async function loginWithGoogle(idToken: string): Promise<GoogleAuthResponse> {
  const res = await fetch(`${API_URL}/auth/google`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ idToken }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Google login failed');
  }

  return res.json();
}
