import { VITE_SPOTIFY_CLIENT_ID, VITE_SPOTIFY_CLIENT_SECRET } from '$env/static/private';
import { redirect, json } from '@sveltejs/kit';

export const GET = async ({ url, cookies }) => {
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');

	const cookieState = cookies.get('state');

	if (!cookieState || !state || cookieState !== state) {
		console.log('NO STATE OR DIFFERENT', state, cookieState);
	}
	const authKey = Buffer.from(VITE_SPOTIFY_CLIENT_ID + ':' + VITE_SPOTIFY_CLIENT_SECRET).toString(
		'base64'
	);

	const headers = new Headers();
	headers.append('Authorization', `Basic ${authKey}`);
	headers.append('Content-Type', 'application/x-www-form-urlencoded');
	headers.append('Accept', 'application/json');

	const spotifyURL = new URL('https://accounts.spotify.com/api/token');
	spotifyURL.searchParams.append('code', code as string);
	spotifyURL.searchParams.append('redirect_uri', 'http://localhost:5173/api/auth/callback/spotify');
	spotifyURL.searchParams.append('grant_type', 'authorization_code');
	spotifyURL.searchParams.append('client_id', VITE_SPOTIFY_CLIENT_ID);
 
	console.log(spotifyURL.toString());

	const result = await fetch(spotifyURL, {
		method: 'POST',
		headers

		// body: JSON.stringify({
		// 	code: code,
		// 	redirect_uri: 'http://localhost:5173/api/auth/callback/spotify',
		// 	grant_type: 'authorization_code'
		// })
	});
	
	const data = await result.json();

	const accessToken = data.access_token;
	const requestToken = data.refresh_token;
	console.log("it is " + result.status);
	console.log("access token " + accessToken);
	console.log("refresh token " + requestToken)
	
	const redirectResponse = redirect(302, '/dashboard');
	if (!result.ok) {
		throw redirect(302, '/?error=A problemo');
	}
	
	throw redirect(302, "/dashboard")
	
};
export const POST = async (refreshToken: string, clientId: string, clientSecret: string) => {
	const authKey = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  
	const headers = new Headers();
	headers.append('Authorization', `Basic ${authKey}`);
	headers.append('Content-Type', 'application/x-www-form-urlencoded');
  
	const body = new URLSearchParams();
	body.append('grant_type', 'refresh_token');
	body.append('refresh_token', refreshToken);
  
	const spotifyURL = new URL('https://accounts.spotify.com/api/token');
  
	const result = await fetch(spotifyURL, {
	  method: 'POST',
	  headers,
	  body,
	});
  
	if (!result.ok) {
	  throw new Error('Failed to refresh access token');
	}
  
	const data = await result.json();
	return data.access_token;
  };