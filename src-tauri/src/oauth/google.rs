use rand::{distr::Alphanumeric, Rng};
use serde::Deserialize;
use std::time::Duration;
use tokio::sync::mpsc;
use url::Url;

#[derive(Deserialize)]
#[allow(dead_code)]
pub(crate) struct TokenResponse {
    pub(crate) access_token: String,
    token_type: String,
    expires_in: u32,
    refresh_token: Option<String>,
    scope: String,
}

pub(crate) async fn login() -> Result<String, String> {
    let client_id =
        std::env::var("GOOGLE_CLIENT_ID").map_err(|_| "GOOGLE_CLIENT_ID not set".to_string())?;
    let client_secret = std::env::var("GOOGLE_CLIENT_SECRET")
        .map_err(|_| "GOOGLE_CLIENT_SECRET not set".to_string())?;

    let state: String = rand::rng()
        .sample_iter(&Alphanumeric)
        .take(32)
        .map(char::from)
        .collect();

    let (tx, mut rx) = mpsc::unbounded_channel::<String>();

    let port = tauri_plugin_oauth::start(move |url| {
        let _ = tx.send(url);
    })
    .map_err(|e| format!("Failed to start OAuth server: {e}"))?;

    let redirect_uri = format!("http://127.0.0.1:{port}/callback");
    let auth_url = format!(
        "https://accounts.google.com/o/oauth2/v2/auth?\
         client_id={client_id}&\
         redirect_uri={redirect_uri}&\
         response_type=code&\
         scope=openid%20email%20profile&\
         state={state}&\
         access_type=offline&\
         prompt=consent",
    );

    tauri_plugin_opener::open_url(&auth_url, None::<&str>)
        .map_err(|e| format!("Failed to open browser: {e}"))?;

    let callback_url = tokio::time::timeout(Duration::from_secs(180), rx.recv())
        .await
        .map_err(|_| "OAuth timeout: no callback received within 3 minutes".to_string())?
        .ok_or("OAuth channel closed unexpectedly".to_string())?;

    let _ = tauri_plugin_oauth::cancel(port);

    let parsed =
        Url::parse(&callback_url).map_err(|e| format!("Failed to parse callback URL: {e}"))?;

    if let Some((_, err)) = parsed.query_pairs().find(|(k, _)| k == "error") {
        return Err(format!("Google returned an error: {err}"));
    }

    let received_state = parsed
        .query_pairs()
        .find(|(k, _)| k == "state")
        .map(|(_, v)| v.into_owned())
        .ok_or("Missing state parameter in callback".to_string())?;

    if received_state != state {
        return Err("State mismatch: possible CSRF attack".to_string());
    }

    let code = parsed
        .query_pairs()
        .find(|(k, _)| k == "code")
        .map(|(_, v)| v.into_owned())
        .ok_or("Missing authorization code in callback".to_string())?;

    let client = reqwest::Client::new();
    let params = [
        ("code", code.as_str()),
        ("client_id", client_id.as_str()),
        ("client_secret", client_secret.as_str()),
        ("redirect_uri", redirect_uri.as_str()),
        ("grant_type", "authorization_code"),
    ];

    let resp = client
        .post("https://oauth2.googleapis.com/token")
        .form(&params)
        .send()
        .await
        .map_err(|e| format!("Token exchange request failed: {e}"))?;

    let token_data: TokenResponse = resp
        .json()
        .await
        .map_err(|e| format!("Failed to parse token response: {e}"))?;

    Ok(token_data.access_token)
}
