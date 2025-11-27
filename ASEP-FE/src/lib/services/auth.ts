import apiClient from "@/lib/api";
import { LoginRequestSchema, TokenResponseSchema, RegisterRequestSchema } from "@/schemas/Auth";

export async function login(data: unknown) {
  const parsed = LoginRequestSchema.parse(data);
  const res = await apiClient.post("/auth/login", parsed);
  console.log("Raw login response:", res);
  console.log("Response data:", res.data);
  console.log("Response data type:", typeof res.data);
  
  // Handle case where backend might wrap response
  let responseData = res.data;
  if (responseData && typeof responseData === 'object' && 'data' in responseData) {
    responseData = (responseData as { data: unknown }).data;
  }
  
  const validated = TokenResponseSchema.parse(responseData);
  console.log("Validated token response:", { 
    hasAccessToken: !!validated.accessToken,
    accessTokenLength: validated.accessToken?.length 
  });
  return validated;

  
}

export async function register(data: unknown) {
  const parsed = RegisterRequestSchema.parse(data);
  const res = await apiClient.post("/auth/register", parsed);
  // backend returns created User for register - return raw data (validated elsewhere)
  return res.data;
}

export async function refreshToken(refreshToken: string) {
  const res = await apiClient.post(`/auth/refresh?refreshToken=${encodeURIComponent(refreshToken)}`);
  return TokenResponseSchema.parse(res.data);
}

export async function logout(token: string) {
  await apiClient.post("/auth/logout", null, { headers: { Authorization: `Bearer ${token}` } });
}
